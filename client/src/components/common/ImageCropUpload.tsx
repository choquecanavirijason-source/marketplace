"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  UploadCloud,
  RotateCw,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Check,
  X,
  Camera,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ImageCropUploadProps {
  isOpen: boolean;
  onClose: () => void;
  onImageSaved: (croppedDataUrl: string) => Promise<void>;
  title?: string;
  cropShape?: "circle" | "rect";
  aspectRatio?: number;
}

export const ImageCropUpload = ({
  isOpen,
  onClose,
  onImageSaved,
  title = "Cambiar Foto de Perfil",
  cropShape = "circle",
  aspectRatio = 1,
}: ImageCropUploadProps) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isHoveringDropZone, setIsHoveringDropZone] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  // Reset state on open/close
  useEffect(() => {
    if (!isOpen) {
      setSelectedImage(null);
      setZoom(1);
      setRotation(0);
      setPan({ x: 0, y: 0 });
      setIsSaving(false);
    }
  }, [isOpen]);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Por favor selecciona un archivo de imagen válido (JPEG, PNG o WebP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("La imagen supera el límite de 5 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
      setZoom(1);
      setRotation(0);
      setPan({ x: 0, y: 0 });
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsHoveringDropZone(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsHoveringDropZone(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsHoveringDropZone(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!selectedImage) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!selectedImage || e.touches.length === 0) return;
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({ x: touch.clientX - pan.x, y: touch.clientY - pan.y });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length === 0) return;
    const touch = e.touches[0];
    setPan({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setPan({ x: 0, y: 0 });
  };

  const generateCroppedImage = useCallback((): string | null => {
    if (!imageRef.current) return null;

    const img = imageRef.current;
    const canvas = document.createElement("canvas");
    const outputSize = 512;
    canvas.width = outputSize;
    canvas.height = outputSize;
    const ctx = canvas.getContext("2d");

    if (!ctx) return null;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, outputSize, outputSize);

    ctx.save();
    // Mover al centro del canvas de destino
    ctx.translate(outputSize / 2, outputSize / 2);
    ctx.rotate((rotation * Math.PI) / 180);

    // Factor de escala considerando el viewport del contenedor (diámetro 260px)
    const viewportDiameter = 260;
    const scale = (outputSize / viewportDiameter) * zoom;

    // Dibujar imagen considerando el desplazamiento pan y zoom
    const drawWidth = img.naturalWidth * (viewportDiameter / Math.min(img.naturalWidth, img.naturalHeight)) * (scale / (outputSize / viewportDiameter));
    const drawHeight = img.naturalHeight * (viewportDiameter / Math.min(img.naturalWidth, img.naturalHeight)) * (scale / (outputSize / viewportDiameter));

    const panScaledX = pan.x * (outputSize / viewportDiameter);
    const panScaledY = pan.y * (outputSize / viewportDiameter);

    ctx.drawImage(
      img,
      panScaledX - drawWidth / 2,
      panScaledY - drawHeight / 2,
      drawWidth,
      drawHeight,
    );

    ctx.restore();

    // Generar formato WebP optimizado nativo (con fallback seguro a JPEG si el navegador no soporta webp en canvas)
    let dataUrl = canvas.toDataURL("image/webp", 0.88);
    if (!dataUrl.startsWith("data:image/webp")) {
      dataUrl = canvas.toDataURL("image/jpeg", 0.88);
    }
    return dataUrl;
  }, [zoom, rotation, pan]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const cropped = generateCroppedImage();
      if (!cropped) {
        toast.error("No se pudo generar el recorte de la imagen.");
        return;
      }
      await onImageSaved(cropped);
      toast.success("Foto de perfil actualizada correctamente.");
      onClose();
    } catch (err: any) {
      toast.error(err?.message || "Error al subir la imagen.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isSaving && onClose()}>
      <DialogContent className="sm:max-w-lg rounded-3xl p-6 overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <Camera className="w-5 h-5 text-primary" />
            {title}
          </DialogTitle>
        </DialogHeader>

        {!selectedImage ? (
          /* Zona de Drag & Drop */
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
              isHoveringDropZone
                ? "border-primary bg-primary/10 scale-[1.01]"
                : "border-border hover:border-primary/60 hover:bg-muted/30"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/jpg"
              className="hidden"
              onChange={handleInputChange}
            />
            <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shadow-inner">
              <UploadCloud className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-foreground">
                Haz clic para subir o arrastra tu foto aquí
              </p>
              <p className="text-xs text-muted-foreground">
                Formatos soportados: PNG, JPG o WEBP (máx. 5 MB)
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2 rounded-xl text-xs font-bold pointer-events-none"
            >
              Seleccionar Archivo
            </Button>
          </div>
        ) : (
          /* Zona de Recorte / Cropper */
          <div className="space-y-4">
            {/* Viewport de recorte interactivo */}
            <div
              className="relative w-full h-[300px] bg-neutral-900 rounded-2xl overflow-hidden flex items-center justify-center select-none cursor-grab active:cursor-grabbing border border-border"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {/* Imagen manipulable */}
              <img
                ref={imageRef}
                src={selectedImage}
                alt="Para recortar"
                draggable={false}
                style={{
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                  transformOrigin: "center center",
                  maxHeight: "260px",
                  maxWidth: "260px",
                  objectFit: "contain",
                  transition: isDragging ? "none" : "transform 0.05s ease-out",
                }}
                className="pointer-events-none"
              />

              {/* Máscara de recorte oscurecida circular o cuadrada */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div
                  className={`w-[240px] h-[240px] border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.65)] ${
                    cropShape === "circle" ? "rounded-full" : "rounded-2xl"
                  }`}
                />
              </div>

              {/* Indicador de ayuda */}
              <span className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur text-white text-[10px] font-medium px-2.5 py-1 rounded-full pointer-events-none">
                Arrastra para reubicar la imagen
              </span>
            </div>

            {/* Controles de Zoom y Rotación */}
            <div className="space-y-3 bg-muted/40 p-3.5 rounded-2xl border border-border/70">
              <div className="flex items-center gap-3">
                <ZoomOut className="w-4 h-4 text-muted-foreground shrink-0" />
                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.05"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-border rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <ZoomIn className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="text-xs font-semibold w-10 text-right text-muted-foreground">
                  {Math.round(zoom * 100)}%
                </span>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRotate}
                    className="h-8 rounded-xl text-xs gap-1.5"
                  >
                    <RotateCw className="w-3.5 h-3.5" /> Rotar 90°
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleReset}
                    className="h-8 rounded-xl text-xs gap-1 text-muted-foreground hover:text-foreground"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Restablecer
                  </Button>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedImage(null)}
                  className="h-8 rounded-xl text-xs text-muted-foreground hover:text-foreground"
                >
                  Cambiar archivo
                </Button>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="mt-2 flex sm:justify-between items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSaving}
            className="rounded-xl text-xs"
          >
            Cancelar
          </Button>
          {selectedImage && (
            <Button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="rounded-xl text-xs font-bold bg-primary text-primary-foreground gap-1.5"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Guardando en AWS S3...
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Aplicar y Guardar
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
