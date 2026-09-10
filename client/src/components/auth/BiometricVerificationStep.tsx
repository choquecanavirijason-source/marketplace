"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Camera,
  Video,
  ShieldCheck,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  UploadCloud,
  Sparkles,
  ArrowRight,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { kycService } from "@/services/kyc.service";
import { useAuth } from "@/hooks/useAuth";
import type { KycChallenge } from "@/types";

interface BiometricVerificationStepProps {
  onComplete: () => void;
  onSkip?: () => void;
  accountType?: "buyer" | "seller_individual" | "seller_company";
}

type SubStep = "document" | "camera" | "processing" | "success" | "error";

export const BiometricVerificationStep: React.FC<BiometricVerificationStepProps> = ({
  onComplete,
  onSkip,
  accountType = "buyer",
}) => {
  const { refreshUser } = useAuth();

  const [subStep, setSubStep] = useState<SubStep>("document");
  const [documentType, setDocumentType] = useState<"NATIONAL_ID" | "PASSPORT" | "DRIVING_LICENSE">("NATIONAL_ID");
  const [idImageBase64, setIdImageBase64] = useState<string | null>(null);
  const [idImageMime, setIdImageMime] = useState<string>("image/jpeg");

  const [challenge, setChallenge] = useState<KycChallenge | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [recordingProgress, setRecordingProgress] = useState(0);
  const [selfieVideoBase64, setSelfieVideoBase64] = useState<string | null>(null);
  const [selfieVideoMimeType, setSelfieVideoMimeType] = useState<string>("video/webm");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Preparando verificación...");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  const isSeller = accountType === "seller_individual" || accountType === "seller_company";

  // Detener la cámara al desmontar
  const stopCamera = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraActive(false);
    setIsRecording(false);
    setCountdown(null);
  }, []);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Cargar reto desde el backend. El nonce debe venir del VPS de biometría
  // (queda persistido ahí para el chequeo anti-replay de /verify/submit);
  // inventar uno local aquí produce verificaciones que el VPS termina
  // rechazando silenciosamente, así que ante un fallo se muestra el error
  // en vez de fabricar un challenge falso.
  const loadChallenge = useCallback(async () => {
    try {
      const res = await kycService.getChallenge();
      const challengeData = (res as any)?.data ?? res;
      if (!challengeData?.nonce) {
        throw new Error("Respuesta de challenge inválida");
      }
      setChallenge({
        challenge: challengeData.challenge || "blink_twice",
        instruction: challengeData.instruction || "Mira fijamente a la cámara y parpadea dos veces lentamente.",
        nonce: challengeData.nonce,
        expires_at: challengeData.expires_at || new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      });
    } catch (err: any) {
      setChallenge(null);
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "No se pudo obtener el reto de verificación biométrica del servidor. Intenta recargar la página.";
      toast.error(msg);
    }
  }, []);

  useEffect(() => {
    void loadChallenge();
  }, [loadChallenge]);

  // Manejador para cargar la imagen del documento
  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Por favor selecciona un archivo de imagen válido (JPG, PNG o WebP).");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("El archivo de imagen no debe superar los 10 MB.");
      return;
    }

    setIdImageMime(file.type);

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setIdImageBase64(reader.result);
        toast.success("Documento cargado correctamente.");
      }
    };
    reader.readAsDataURL(file);
  };

  // Iniciar la cámara web
  const startCamera = async () => {
    setErrorMessage(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
        audio: false,
      });

      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err: any) {
      setErrorMessage("No se pudo acceder a la cámara. Por favor autoriza los permisos en tu navegador.");
      toast.error("Permiso de cámara denegado o dispositivo no disponible.");
    }
  };

  // Iniciar cuenta regresiva y grabación de 4 segundos
  const startRecordingChallenge = () => {
    if (!mediaStreamRef.current) {
      toast.error("La cámara no está activa.");
      return;
    }

    setCountdown(3);
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(countdownInterval);
          startActualMediaRecording();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const startActualMediaRecording = () => {
    if (!mediaStreamRef.current) return;

    recordedChunksRef.current = [];
    // Se prefiere VP8 explícitamente: Chrome graba VP9 por defecto con
    // "video/webm" a secas, pero muchos pipelines de decodificación en
    // servidor (ffmpeg/OpenCV) no lo soportan bien dentro de webm y fallan
    // silenciosamente al extraer frames, aunque el navegador lo reproduzca sin problema.
    const candidateMimeTypes = [
      "video/webm;codecs=vp8,opus",
      "video/webm;codecs=vp8",
      "video/webm",
      "video/mp4",
    ];
    const mimeType = candidateMimeTypes.find((type) => MediaRecorder.isTypeSupported(type)) || "";

    try {
      const recorder = new MediaRecorder(mediaStreamRef.current, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const effectiveMimeType = mimeType || "video/webm";
        const baseMimeType = effectiveMimeType.split(";")[0];
        const videoBlob = new Blob(recordedChunksRef.current, { type: baseMimeType });
        setSelfieVideoMimeType(baseMimeType);
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === "string") {
            setSelfieVideoBase64(reader.result);
            toast.success("Prueba de vida grabada con éxito.");
          }
        };
        reader.readAsDataURL(videoBlob);
        stopCamera();
      };

      recorder.start(200);
      setIsRecording(true);
      setRecordingProgress(0);

      // Progreso visual de 4 segundos
      const durationMs = 4000;
      const intervalMs = 100;
      let elapsed = 0;

      const progressTimer = setInterval(() => {
        elapsed += intervalMs;
        const pct = Math.min(100, Math.round((elapsed / durationMs) * 100));
        setRecordingProgress(pct);

        if (elapsed >= durationMs) {
          clearInterval(progressTimer);
          if (recorder.state === "recording") {
            recorder.stop();
          }
          setIsRecording(false);
        }
      }, intervalMs);
    } catch (err: any) {
      toast.error("Error al inicializar la grabación de video.");
      setIsRecording(false);
    }
  };

  // Enviar verificación completa al Backend
  const handleSubmitVerification = async () => {
    if (!idImageBase64) {
      toast.error("Debes cargar la foto de tu documento de identidad.");
      return;
    }
    if (!selfieVideoBase64) {
      toast.error("Debes grabar el video selfie con la prueba de vida.");
      return;
    }
    if (!challenge) {
      toast.error("No se pudo obtener el reto biométrico. Recarga la página.");
      return;
    }

    setSubStep("processing");
    setIsSubmitting(true);
    setErrorMessage(null);
    setStatusMessage("Enviando documento y video al motor de verificación...");

    const effectiveChallenge =
      challenge?.challenge || (challenge as any)?.data?.challenge || "blink_twice";
    const effectiveNonce =
      challenge?.nonce ||
      (challenge as any)?.data?.nonce ||
      `nonce_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    try {
      const submission = await kycService.submitVerification({
        idImage: idImageBase64,
        idImageMimeType: idImageMime,
        selfieVideo: selfieVideoBase64,
        selfieVideoMimeType,
        challenge: effectiveChallenge,
        nonce: effectiveNonce,
        documentType,
      });

      setStatusMessage("Analizando autenticidad facial y prueba de vida...");

      // Si fue rechazado de inmediato por el VPS
      if (submission.status === "REJECTED") {
        setIsSubmitting(false);
        setSubStep("error");
        const rejectReason =
          submission.message ||
          "La prueba biométrica fue rechazada. Verifica que tu rostro sea visible en el video y coincida con el documento.";
        setErrorMessage(rejectReason);
        toast.error(rejectReason);
        return;
      }

      // Si ya fue aprobado de inmediato
      if (submission.status === "APPROVED") {
        await handleVerificationSuccess();
        return;
      }

      // Polling de 6 intentos (12 segundos) para consultar el veredicto del VPS
      let attempts = 0;
      const maxAttempts = 6;
      const pollInterval = setInterval(async () => {
        attempts++;
        try {
          const status = await kycService.getStatus(submission.jobId);
          if (status.status === "APPROVED" || status.isVerified) {
            clearInterval(pollInterval);
            await handleVerificationSuccess();
          } else if (status.status === "REJECTED") {
            clearInterval(pollInterval);
            setIsSubmitting(false);
            setSubStep("error");
            const reason = status.rejectionReason || "No se pudo validar el rostro con el documento.";
            setErrorMessage(reason);
            toast.error(reason);
          } else if (attempts >= maxAttempts) {
            clearInterval(pollInterval);
            setIsSubmitting(false);
            setSubStep("error");
            const timeoutReason =
              "El análisis biométrico está demorando más de lo esperado. Por favor reintenta con mejor iluminación o intenta más tarde.";
            setErrorMessage(timeoutReason);
            toast.warning(timeoutReason);
          }
        } catch {
          if (attempts >= maxAttempts) {
            clearInterval(pollInterval);
            setIsSubmitting(false);
            setSubStep("error");
            setErrorMessage("Error de conexión al consultar el resultado biométrico con el servidor.");
          }
        }
      }, 2000);
    } catch (err: any) {
      setIsSubmitting(false);
      setSubStep("error");
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        "Ocurrió un error al procesar la verificación biométrica.";
      setErrorMessage(msg);
      toast.error(msg);
    }
  };

  const handleVerificationSuccess = async (customMessage?: string) => {
    setIsSubmitting(false);
    setSubStep("success");
    setStatusMessage(customMessage || "¡Tu identidad ha sido verificada exitosamente!");
    toast.success("¡Identidad biométrica validada!");

    try {
      await refreshUser?.();
    } catch {
      // Ignorar fallo de refresco
    }
  };

  return (
    <Card className="w-full max-w-xl mx-auto shadow-xl border-border bg-card">
      <CardHeader className="text-center pb-4">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-2 shadow-sm">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <CardTitle className="text-xl font-bold tracking-tight">
          Verificación de Identidad Biométrica
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground max-w-md mx-auto">
          {isSeller
            ? "Requisito para activar tu tienda y recibir pagos de forma segura en FerroMax."
            : "Verifica tu cuenta para obtener el sello de comprador verificado y mayores límites."}
        </CardDescription>

        {/* Mini Stepper superior */}
        <div className="flex items-center justify-center gap-2 pt-3 text-xs font-semibold">
          <span
            className={`px-3 py-1 rounded-full border transition-colors ${
              subStep === "document"
                ? "bg-primary text-primary-foreground border-primary"
                : idImageBase64
                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                : "bg-muted text-muted-foreground border-border"
            }`}
          >
            1. Documento {idImageBase64 && "✓"}
          </span>
          <span className="text-muted-foreground">→</span>
          <span
            className={`px-3 py-1 rounded-full border transition-colors ${
              subStep === "camera"
                ? "bg-primary text-primary-foreground border-primary"
                : selfieVideoBase64
                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                : "bg-muted text-muted-foreground border-border"
            }`}
          >
            2. Escaneo Facial {selfieVideoBase64 && "✓"}
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-2">
        {/* SUBPASO 1: Subir Documento de Identidad */}
        {subStep === "document" && (
          <div className="space-y-4">
            <div className="flex gap-2 justify-center">
              {(["NATIONAL_ID", "PASSPORT", "DRIVING_LICENSE"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setDocumentType(type)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    documentType === type
                      ? "bg-primary/10 border-primary text-primary font-bold"
                      : "bg-background border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {type === "NATIONAL_ID" ? "DNI / Cédula" : type === "PASSPORT" ? "Pasaporte" : "Licencia"}
                </button>
              ))}
            </div>

            <div className="border-2 border-dashed border-border hover:border-primary/50 transition-colors rounded-2xl p-6 text-center flex flex-col items-center justify-center relative bg-muted/20">
              {idImageBase64 ? (
                <div className="space-y-3 w-full flex flex-col items-center">
                  <div className="relative max-h-48 rounded-xl overflow-hidden border border-border shadow-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={idImageBase64} alt="Documento cargado" className="max-h-48 object-contain" />
                  </div>
                  <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Documento frontal listo
                  </p>
                  <label className="text-xs text-primary hover:underline cursor-pointer">
                    Cambiar imagen
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleDocumentUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              ) : (
                <label className="cursor-pointer space-y-3 w-full flex flex-col items-center py-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Sube el frente de tu documento</p>
                    <p className="text-xs text-muted-foreground">Formato JPG, PNG o WebP (máx. 10 MB)</p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold py-1.5 px-3 rounded-lg bg-primary text-primary-foreground shadow-sm">
                    <FileText className="w-3.5 h-3.5" /> Seleccionar Archivo
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleDocumentUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            <div className="p-3 bg-primary/5 border border-primary/10 rounded-xl text-xs text-muted-foreground flex gap-2 items-start">
              <Eye className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <span>Asegúrate de que la foto esté bien iluminada, sin reflejos y que todos los datos y el rostro sean legibles.</span>
            </div>

            <div className="flex justify-between items-center pt-2">
              {onSkip && !isSeller ? (
                <Button type="button" variant="ghost" size="sm" onClick={onSkip} className="text-xs text-muted-foreground">
                  Omitir por ahora
                </Button>
              ) : <div />}

              <Button
                type="button"
                size="sm"
                disabled={!idImageBase64}
                onClick={() => {
                  setSubStep("camera");
                  void startCamera();
                }}
                className="gap-1.5"
              >
                Siguiente: Escaneo Facial <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* SUBPASO 2: Reconocimiento Facial y Liveness con Cámara */}
        {subStep === "camera" && (
          <div className="space-y-4">
            {/* Instrucción del Reto Biométrico */}
            <div className="p-3.5 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-2xl flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-sm">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground uppercase tracking-wider">Reto de Prueba de Vida</p>
                <p className="text-xs font-medium text-foreground">
                  {challenge?.instruction || "Mira fijamente a la cámara y parpadea dos veces lentamente."}
                </p>
              </div>
            </div>

            {/* Visor de Video de la Cámara con Guía Ovalada */}
            <div className="relative aspect-video max-h-72 w-full rounded-2xl overflow-hidden bg-black flex items-center justify-center border border-border shadow-inner">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${selfieVideoBase64 && !isCameraActive ? "hidden" : ""}`}
              />

              {selfieVideoBase64 && !isCameraActive && (
                // eslint-disable-next-line jsx-a11y/media-has-caption
                <video
                  src={selfieVideoBase64}
                  controls
                  loop
                  playsInline
                  className="w-full h-full object-contain bg-black"
                />
              )}

              {/* Marco ovalado de centrado de rostro */}
              {isCameraActive && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-48 h-60 rounded-[50%] border-2 border-dashed border-primary/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.4)] flex items-center justify-center">
                    <span className="text-[10px] text-white/90 bg-black/60 px-2 py-0.5 rounded-full">
                      Ubica tu rostro aquí
                    </span>
                  </div>
                </div>
              )}

              {/* Cuenta regresiva antes de grabar */}
              {countdown !== null && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-10">
                  <span className="text-6xl font-black text-primary animate-ping">{countdown}</span>
                </div>
              )}

              {/* Barra de progreso de 4 segundos durante la grabación */}
              {isRecording && (
                <div className="absolute bottom-3 left-4 right-4 z-10 space-y-1">
                  <div className="flex justify-between text-[11px] font-bold text-white drop-shadow">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" /> Grabando prueba...
                    </span>
                    <span>{recordingProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-100 ease-linear rounded-full"
                      style={{ width: `${recordingProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {selfieVideoBase64 && !isCameraActive && (
              <p className="text-[10px] text-muted-foreground text-center">
                Formato: {selfieVideoMimeType} · Tamaño aprox:{" "}
                {Math.round((selfieVideoBase64.length * 0.75) / 1024)} KB
              </p>
            )}

            {errorMessage && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Controles de Cámara */}
            <div className="flex justify-between items-center pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  stopCamera();
                  setSubStep("document");
                }}
                className="text-xs"
              >
                Volver a Documento
              </Button>

              <div className="flex gap-2">
                {!isCameraActive && !selfieVideoBase64 && (
                  <Button type="button" size="sm" onClick={() => void startCamera()} className="gap-1.5">
                    <Camera className="w-4 h-4" /> Activar Cámara
                  </Button>
                )}

                {isCameraActive && !isRecording && (
                  <Button
                    type="button"
                    size="sm"
                    onClick={startRecordingChallenge}
                    className="gap-1.5 bg-primary text-primary-foreground shadow-md"
                  >
                    <Video className="w-4 h-4" /> Iniciar Reto (4s)
                  </Button>
                )}

                {selfieVideoBase64 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelfieVideoBase64(null);
                      void startCamera();
                    }}
                    className="gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Reintentar
                  </Button>
                )}

                {selfieVideoBase64 && (
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => void handleSubmitVerification()}
                    disabled={isSubmitting}
                    className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md"
                  >
                    Verificar Identidad <CheckCircle2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* SUBPASO 3: Procesando Verificación */}
        {subStep === "processing" && (
          <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-pulse" />
              <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground mb-1">{statusMessage}</h3>
              <p className="text-xs text-muted-foreground max-w-sm">
                Estamos validando la nitidez del documento y contrastando tus rasgos faciales con inteligencia artificial.
              </p>
            </div>
          </div>
        )}

        {/* SUBPASO 4: Éxito */}
        {subStep === "success" && (
          <div className="py-6 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center animate-bounce shadow-md">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-lg font-black text-foreground mb-1">¡Identidad Verificada con Éxito!</h3>
              <p className="text-xs text-muted-foreground max-w-sm">
                Tu cuenta ahora cuenta con el nivel de verificación biométrica completo. Ya puedes disfrutar de todas las funciones de FerroMax.
              </p>
            </div>
            <Button
              type="button"
              onClick={onComplete}
              className="w-full max-w-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md"
            >
              Continuar al Marketplace
            </Button>
          </div>
        )}

        {/* SUBPASO 5: Error con opción de Reintentar */}
        {subStep === "error" && (
          <div className="py-6 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-destructive/10 text-destructive flex items-center justify-center">
              <AlertCircle className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-lg font-black text-foreground mb-1">No se pudo verificar la identidad</h3>
              <p className="text-xs text-destructive max-w-sm mb-2">{errorMessage}</p>
              <p className="text-xs text-muted-foreground max-w-sm">
                Asegúrate de que haya buena iluminación, que el rostro coincida exactamente con la foto del documento y que parpadees durante la grabación.
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setSubStep("camera");
                  setSelfieVideoBase64(null);
                  setErrorMessage(null);
                  void loadChallenge();
                  void startCamera();
                }}
                className="gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Reintentar Escaneo
              </Button>
              {onSkip && !isSeller && (
                <Button type="button" variant="ghost" size="sm" onClick={onSkip} className="text-xs text-muted-foreground">
                  Completar más tarde
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-center border-t border-border pt-4 text-[11px] text-muted-foreground">
        <span>Tus datos biométricos están protegidos con cifrado de sobre AES-256 en servidores propios.</span>
      </CardFooter>
    </Card>
  );
};
