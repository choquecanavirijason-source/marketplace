"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, ShieldCheck, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { HttpAuthRepository } from "@/services/auth.service";
import { toast } from "sonner";

interface EmailVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  email: string;
}

const authService = new HttpAuthRepository();

export const EmailVerificationModal: React.FC<EmailVerificationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  email,
}) => {
  const [code, setCode] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [codeSent, setCodeSent] = useState(false);

  const handleSendCode = async () => {
    if (!email) return;
    setIsSending(true);
    setError(null);
    try {
      await authService.sendEmailOtp(email);
      setCodeSent(true);
      toast.success("Código de verificación enviado a tu correo.");
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || "Error al enviar el código de verificación.");
      toast.error("No se pudo enviar el correo de verificación.");
    } finally {
      setIsSending(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !email) return;

    setIsVerifying(true);
    setError(null);
    try {
      await authService.verifyEmail(email, code.trim());
      toast.success("¡Correo verificado con éxito!");
      setCode("");
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || "Código inválido o expirado. Inténtalo de nuevo.");
      toast.error("Error en la verificación del código.");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md rounded-2xl p-6">
        <DialogHeader className="text-left space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-1">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <DialogTitle className="text-lg font-bold text-foreground">
            Verificar Correo Electrónico
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Para garantizar la seguridad de tu cuenta, ingresa el código de 6 dígitos enviado a:
          </DialogDescription>
          <p className="text-sm font-semibold text-foreground bg-muted/50 px-3 py-2 rounded-xl flex items-center gap-2">
            <Mail className="w-4 h-4 text-primary shrink-0" />
            <span className="truncate">{email}</span>
          </p>
        </DialogHeader>

        {error && (
          <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="otp-input" className="text-xs font-bold text-foreground uppercase tracking-wider">
                Código de 6 dígitos
              </Label>
              <button
                type="button"
                onClick={handleSendCode}
                disabled={isSending}
                className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1 disabled:opacity-50"
              >
                {isSending ? (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin" /> Enviando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3 h-3" /> {codeSent ? "Reenviar código" : "Enviar código"}
                  </>
                )}
              </button>
            </div>
            <Input
              id="otp-input"
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="123456"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              className="text-center text-xl font-bold tracking-widest h-12 rounded-xl"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="rounded-xl h-10 px-4 text-xs font-semibold"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isVerifying || code.trim().length < 4}
              className="rounded-xl h-10 px-5 text-xs font-semibold shadow-sm"
            >
              {isVerifying ? "Verificando..." : "Confirmar y Activar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
