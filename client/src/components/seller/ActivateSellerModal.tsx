"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Store, Sparkles, AlertCircle, ArrowRight } from "lucide-react";
import { toast } from "sonner";
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
import { useAuth } from "@/hooks/useAuth";
import { sellerService } from "@/services/seller.service";

interface ActivateSellerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ActivateSellerModal = ({
  open,
  onOpenChange,
}: ActivateSellerModalProps) => {
  const router = useRouter();
  const { refreshUser, setActiveMode, setSellerProfile, user } = useAuth();
  const [storeName, setStoreName] = useState("");
  const [description, setDescription] = useState("");
  const [taxId, setTaxId] = useState(user?.businessProfile?.taxId || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!storeName.trim()) {
      setError("El nombre comercial de la tienda es requerido.");
      return;
    }

    setIsSubmitting(true);
    try {
      const savedProfile = await sellerService.upsertProfile({
        storeName: storeName.trim(),
        description: description.trim() || undefined,
        taxId: taxId.trim() || undefined,
      });

      if (setSellerProfile) {
        setSellerProfile(savedProfile);
      }
      setActiveMode("seller");

      toast.success("¡Tu tienda ha sido activada con éxito!", {
        description: `Bienvenido al panel de vendedor de ${storeName}.`,
      });

      onOpenChange(false);
      try {
        await refreshUser();
      } catch {}
      router.push("/seller/dashboard");
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ||
          err?.message ||
          "Error al activar la tienda. Inténtalo de nuevo."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-6 rounded-3xl">
        <DialogHeader className="space-y-3">
          <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            <Store className="size-6" />
          </div>
          <DialogTitle className="text-xl font-black text-foreground">
            Activar Modo Vendedor
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
            Comienza a publicar tus productos en FerroMax 360. Solo necesitas elegir el nombre de tu tienda para empezar.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="storeName" className="text-xs font-bold text-foreground">
              Nombre de tu Tienda *
            </Label>
            <Input
              id="storeName"
              placeholder="Ej: Ferretería El Progreso, Metales del Sur"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="h-10 text-xs rounded-xl"
              required
              disabled={isSubmitting}
            />
            <p className="text-[11px] text-muted-foreground">
              Este nombre será visible públicamente para todos los compradores.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-xs font-bold text-foreground">
              Descripción o Rubro (Opcional)
            </Label>
            <Input
              id="description"
              placeholder="Ej: Especialistas en bulonería, herramientas de precisión"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="h-10 text-xs rounded-xl"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="taxId" className="text-xs font-bold text-foreground">
              Identificación Fiscal / CUIT / RUT (Opcional)
            </Label>
            <Input
              id="taxId"
              placeholder="Ej: 30-71234567-8"
              value={taxId}
              onChange={(e) => setTaxId(e.target.value)}
              className="h-10 text-xs rounded-xl"
              disabled={isSubmitting}
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-10 rounded-xl text-xs font-semibold"
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="h-10 rounded-xl text-xs font-bold gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>Activando tienda…</>
              ) : (
                <>
                  <Sparkles className="size-4" />
                  Activar y Empezar a Vender
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
