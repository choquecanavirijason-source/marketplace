"use client";

import React, { useState, useEffect } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardLayout, customerNavItems } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import {
  useAddresses,
  useCreateAddress,
  useUpdateAddress,
  useDeleteAddress,
} from "@/hooks/useAddresses";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { MapPin, Plus, Pencil, Trash2, Loader2, Home, Building2, Package } from "lucide-react";
import type { AddressInput, UserAddress } from "@/services";

const EMPTY_FORM: AddressInput = {
  label: "Principal",
  country: "Argentina",
  province: "",
  city: "",
  street: "",
  number: "",
  zip: "",
  isDefault: false,
};

const AddressFormDialog = ({
  open,
  onOpenChange,
  initial,
  isSaving,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial: UserAddress | null;
  isSaving: boolean;
  onSubmit: (data: AddressInput) => void;
}) => {
  const [form, setForm] = useState<AddressInput>(EMPTY_FORM);

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setForm({
        label: initial.label || "Principal",
        country: initial.country,
        province: initial.province,
        city: initial.city,
        street: initial.street,
        number: initial.number,
        zip: initial.zip,
        isDefault: initial.isDefault,
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [open, initial]);

  const set = (field: keyof AddressInput, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.country.trim() || !form.province.trim() || !form.city.trim() || !form.street.trim() || !form.number.trim() || !form.zip.trim()) {
      toast.error("Completá todos los campos de la dirección.");
      return;
    }
    onSubmit(form);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-3xl">
        <DialogHeader>
          <DialogTitle>{initial ? "Editar dirección" : "Nueva dirección"}</DialogTitle>
          <DialogDescription>
            Completá los datos del domicilio de envío o facturación.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="addr-label">Etiqueta</Label>
              <Input
                id="addr-label"
                placeholder="Casa, Trabajo, Principal..."
                value={form.label ?? ""}
                onChange={(e) => set("label", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="addr-country">País</Label>
              <Input
                id="addr-country"
                required
                value={form.country}
                onChange={(e) => set("country", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="addr-province">Provincia / Estado</Label>
              <Input
                id="addr-province"
                required
                value={form.province}
                onChange={(e) => set("province", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="addr-city">Ciudad</Label>
              <Input
                id="addr-city"
                required
                value={form.city}
                onChange={(e) => set("city", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="addr-street">Calle</Label>
              <Input
                id="addr-street"
                required
                value={form.street}
                onChange={(e) => set("street", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="addr-number">Número</Label>
              <Input
                id="addr-number"
                required
                value={form.number}
                onChange={(e) => set("number", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="addr-zip">Código postal</Label>
              <Input
                id="addr-zip"
                required
                value={form.zip}
                onChange={(e) => set("zip", e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-muted/40 px-4 py-3">
              <div className="space-y-0.5">
                <Label htmlFor="addr-default" className="text-sm font-semibold">
                  Dirección principal
                </Label>
                <p className="text-xs text-muted-foreground">Se usará por defecto en tus compras.</p>
              </div>
              <Switch
                id="addr-default"
                checked={Boolean(form.isDefault)}
                onCheckedChange={(checked) => set("isDefault", checked)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving} className="rounded-xl">
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {initial ? "Guardar cambios" : "Agregar dirección"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const AddressCard = ({
  address,
  onEdit,
}: {
  address: UserAddress;
  onEdit: (address: UserAddress) => void;
}) => {
  const deleteAddress = useDeleteAddress();
  const updateAddress = useUpdateAddress();
  const isDeleting = deleteAddress.isPending;
  const isUpdating = updateAddress.isPending;

  const handleDelete = async () => {
    try {
      await deleteAddress.mutateAsync(address.id);
      toast.success("Dirección eliminada correctamente.");
    } catch {
      toast.error("No se pudo eliminar la dirección.");
    }
  };

  const handleSetDefault = async () => {
    try {
      await updateAddress.mutateAsync({ id: address.id, data: { isDefault: true } });
      toast.success("Dirección principal actualizada.");
    } catch {
      toast.error("No se pudo actualizar la dirección.");
    }
  };

  const LabelIcon = address.label?.toLowerCase().includes("trabajo") ? Building2 : address.label?.toLowerCase().includes("factur") ? Package : Home;

  return (
    <Card className="border-border/70 rounded-3xl shadow-sm overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 shrink-0 size-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <LabelIcon className="size-5" />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-foreground">{address.label || "Dirección"}</span>
                {address.isDefault && (
                  <Badge variant="default" className="text-[10px] font-bold rounded-full">
                    Principal
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {address.street} {address.number}, {address.city}, {address.province} ({address.zip}), {address.country}
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-border/60">
          {!address.isDefault && (
            <Button variant="outline" size="sm" className="rounded-xl h-8 text-xs font-semibold" disabled={isUpdating} onClick={handleSetDefault}>
              {isUpdating ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <MapPin className="mr-1.5 h-3.5 w-3.5" />}
              Establecer como principal
            </Button>
          )}
          <Button variant="outline" size="sm" className="rounded-xl h-8 text-xs font-semibold" onClick={() => onEdit(address)}>
            <Pencil className="mr-1.5 h-3.5 w-3.5" /> Editar
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="rounded-xl h-8 text-xs font-semibold text-destructive hover:text-destructive">
                <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Eliminar
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-3xl">
              <AlertDialogHeader>
                <AlertDialogTitle>¿Eliminar esta dirección?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no se puede deshacer. La dirección dejará de estar disponible en tus compras.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  disabled={isDeleting}
                  onClick={(e) => {
                    e.preventDefault();
                    void handleDelete();
                  }}
                >
                  {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Sí, eliminar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
};

const AddressesPage = () => {
  const { user } = useAuth();
  const { data: addresses, isLoading, isError, refetch } = useAddresses();
  const createAddress = useCreateAddress();
  const updateAddress = useUpdateAddress();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<UserAddress | null>(null);
  const isSaving = createAddress.isPending || updateAddress.isPending;

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (address: UserAddress) => {
    setEditing(address);
    setDialogOpen(true);
  };

  const handleSubmit = async (data: AddressInput) => {
    try {
      if (editing) {
        await updateAddress.mutateAsync({ id: editing.id, data });
        toast.success("Dirección actualizada correctamente.");
      } else {
        await createAddress.mutateAsync(data);
        toast.success("Dirección agregada correctamente.");
      }
      setDialogOpen(false);
      setEditing(null);
    } catch {
      toast.error(editing ? "No se pudo actualizar la dirección." : "No se pudo agregar la dirección.");
    }
  };

  const items = Array.isArray(addresses) ? addresses : [];

  return (
    <ProtectedRoute>
      <DashboardLayout navItems={customerNavItems} title="Mis Direcciones">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">Mis Direcciones</h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Administra los domicilios de envío y facturación de tu cuenta
              </p>
            </div>
            <Button onClick={openCreate} className="rounded-xl">
              <Plus className="mr-2 h-4 w-4" /> Nueva dirección
            </Button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20 text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Cargando direcciones...
            </div>
          ) : isError ? (
            <Card className="border-destructive/30 rounded-3xl">
              <CardContent className="p-8 text-center space-y-4">
                <p className="text-sm text-muted-foreground">
                  No se pudieron cargar tus direcciones. Intentalo nuevamente.
                </p>
                <Button variant="outline" className="rounded-xl" onClick={() => void refetch()}>
                  Reintentar
                </Button>
              </CardContent>
            </Card>
          ) : items.length === 0 ? (
            <Card className="border-dashed rounded-3xl">
              <CardContent className="p-12 text-center space-y-4">
                <div className="mx-auto size-14 rounded-3xl bg-primary/10 text-primary flex items-center justify-center">
                  <MapPin className="size-7" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Aún no tenés direcciones guardadas</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Agregá tu primer domicilio para agilizar tus compras, {user?.name?.split(" ")[0] || ""}.
                  </p>
                </div>
                <Button onClick={openCreate} className="rounded-xl">
                  <Plus className="mr-2 h-4 w-4" /> Agregar dirección
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {items.map((address) => (
                <AddressCard key={address.id} address={address} onEdit={openEdit} />
              ))}
            </div>
          )}
        </div>

        <AddressFormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          initial={editing}
          isSaving={isSaving}
          onSubmit={handleSubmit}
        />
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default AddressesPage;
