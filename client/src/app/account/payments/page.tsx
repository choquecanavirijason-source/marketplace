"use client";

import { useState } from "react";
import {
  CreditCard,
  Plus,
  Trash2,
  CheckCircle2,
  ShieldCheck,
  Lock,
  Landmark,
  Building,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface PaymentCard {
  id: string;
  brand: "visa" | "mastercard" | "amex";
  last4: string;
  holderName: string;
  expiryMonth: string;
  expiryYear: string;
  isDefault: boolean;
}

const INITIAL_CARDS: PaymentCard[] = [
  {
    id: "card-1",
    brand: "visa",
    last4: "4242",
    holderName: "JUAN PEREZ",
    expiryMonth: "08",
    expiryYear: "28",
    isDefault: true,
  },
  {
    id: "card-2",
    brand: "mastercard",
    last4: "8891",
    holderName: "JUAN PEREZ",
    expiryMonth: "11",
    expiryYear: "27",
    isDefault: false,
  },
];

const AccountPaymentsPage = () => {
  const [cards, setCards] = useState<PaymentCard[]>(INITIAL_CARDS);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [cardToDelete, setCardToDelete] = useState<string | null>(null);

  // New card form
  const [cardNumber, setCardNumber] = useState("");
  const [holderName, setHolderName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [makeDefault, setMakeDefault] = useState(false);

  const handleSetDefault = (id: string) => {
    setCards((prev) =>
      prev.map((c) => ({
        ...c,
        isDefault: c.id === id,
      }))
    );
    toast.success("Método de pago predeterminado actualizado.");
  };

  const handleDeleteCard = (id: string) => {
    const target = cards.find((c) => c.id === id);
    if (target?.isDefault && cards.length > 1) {
      toast.error("No puedes eliminar la tarjeta predeterminada. Elige otra antes.");
      setCardToDelete(null);
      return;
    }
    setCards((prev) => prev.filter((c) => c.id !== id));
    setCardToDelete(null);
    toast.success("Tarjeta eliminada correctamente.");
  };

  const handleAddCard = () => {
    const cleanNum = cardNumber.replace(/\s+/g, "");
    if (cleanNum.length < 15) {
      toast.error("Número de tarjeta inválido.");
      return;
    }
    if (!holderName.trim()) {
      toast.error("Ingresa el nombre del titular como figura en la tarjeta.");
      return;
    }
    if (!expiry || !expiry.includes("/")) {
      toast.error("Ingresa la fecha de vencimiento (MM/AA).");
      return;
    }

    const [expMonth, expYear] = expiry.split("/");
    const brand: "visa" | "mastercard" | "amex" = cleanNum.startsWith("4")
      ? "visa"
      : cleanNum.startsWith("3")
      ? "amex"
      : "mastercard";

    const newCard: PaymentCard = {
      id: `card-${Date.now()}`,
      brand,
      last4: cleanNum.slice(-4),
      holderName: holderName.toUpperCase().trim(),
      expiryMonth: expMonth.trim(),
      expiryYear: expYear.trim(),
      isDefault: makeDefault || cards.length === 0,
    };

    if (newCard.isDefault) {
      setCards((prev) => prev.map((c) => ({ ...c, isDefault: false })));
    }

    setCards((prev) => [...prev, newCard]);
    setDialogOpen(false);
    // Reset form
    setCardNumber("");
    setHolderName("");
    setExpiry("");
    setCvv("");
    setMakeDefault(false);
    toast.success("Nueva tarjeta guardada de forma segura.");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div className="flex items-center gap-2.5">
          <div className="size-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            <CreditCard className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              Métodos de Pago
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Administra tus tarjetas de crédito, débito y cuentas para un checkout rápido y protegido
            </p>
          </div>
        </div>

        <Button
          onClick={() => setDialogOpen(true)}
          className="rounded-xl font-bold text-xs gap-1.5"
        >
          <Plus className="size-4" /> Agregar Tarjeta
        </Button>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cards.map((card) => (
          <Card
            key={card.id}
            className={`border transition-all overflow-hidden relative ${
              card.isDefault
                ? "border-primary/50 shadow-xs bg-primary/5"
                : "border-border/70 hover:border-border"
            }`}
          >
            <CardContent className="p-5 flex flex-col justify-between h-48">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">
                    {card.brand === "visa" ? "Visa" : card.brand === "mastercard" ? "Mastercard" : "American Express"}
                  </span>
                  <p className="font-mono text-base sm:text-lg font-black tracking-widest text-foreground mt-1">
                    •••• •••• •••• {card.last4}
                  </p>
                </div>
                {card.isDefault && (
                  <Badge className="bg-primary text-primary-foreground text-[10px] font-bold">
                    Predeterminada
                  </Badge>
                )}
              </div>

              <div>
                <div className="flex items-end justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase">Titular</span>
                    <p className="font-bold text-foreground truncate max-w-[180px]">
                      {card.holderName}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-muted-foreground uppercase">Vence</span>
                    <p className="font-bold text-foreground">
                      {card.expiryMonth}/{card.expiryYear}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 mt-3 border-t border-border/50">
                  {!card.isDefault ? (
                    <button
                      type="button"
                      onClick={() => handleSetDefault(card.id)}
                      className="text-xs font-bold text-primary hover:underline"
                    >
                      Establecer como principal
                    </button>
                  ) : (
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-semibold">
                      <CheckCircle2 className="size-3.5 text-emerald-500" /> Método principal de cobro
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => setCardToDelete(card.id)}
                    className="text-xs font-semibold text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1"
                  >
                    <Trash2 className="size-3.5" /> Eliminar
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alternative Payment Options */}
      <Card className="border-border/70 bg-muted/20">
        <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-xl bg-muted flex items-center justify-center text-primary shrink-0">
              <Landmark className="size-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-foreground">
                Transferencia Bancaria Inmediata / CBU
              </h4>
              <p className="text-xs text-muted-foreground">
                Aprobación automática al finalizar tu pedido con 5% de descuento adicional
              </p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs font-bold self-start sm:self-center">
            Habilitado en Checkout
          </Badge>
        </CardContent>
      </Card>

      {/* Security Assurance */}
      <div className="p-4 rounded-2xl border border-border/60 bg-muted/30 flex items-center gap-3 text-xs text-muted-foreground">
        <ShieldCheck className="size-5 text-emerald-600 shrink-0" />
        <p className="leading-relaxed">
          <strong>Pagos 100% Protegidos:</strong> No almacenamos los códigos de seguridad (CVV) en nuestros servidores. Toda la información viaja encriptada mediante protocolo SSL bajo certificación estándar PCI-DSS Nivel 1.
        </p>
      </div>

      {/* Add Card Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="rounded-3xl max-w-md">
          <DialogHeader>
            <DialogTitle>Agregar Nueva Tarjeta</DialogTitle>
            <DialogDescription>
              Tus datos bancarios están encriptados con los más altos estándares de seguridad.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Número de Tarjeta</Label>
              <Input
                placeholder="4500 0000 0000 0000"
                maxLength={19}
                value={cardNumber}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").replace(/(\d{4})/g, "$1 ").trim();
                  setCardNumber(val);
                }}
                className="rounded-xl font-mono text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Nombre del Titular (como figura en el plástico)</Label>
              <Input
                placeholder="JUAN PEREZ"
                value={holderName}
                onChange={(e) => setHolderName(e.target.value.toUpperCase())}
                className="rounded-xl text-xs uppercase"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Vencimiento</Label>
                <Input
                  placeholder="MM/AA"
                  maxLength={5}
                  value={expiry}
                  onChange={(e) => {
                    let val = e.target.value.replace(/\D/g, "");
                    if (val.length >= 3) {
                      val = `${val.slice(0, 2)}/${val.slice(2, 4)}`;
                    }
                    setExpiry(val);
                  }}
                  className="rounded-xl font-mono text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Código de Seguridad (CVV)</Label>
                <Input
                  type="password"
                  placeholder="123"
                  maxLength={4}
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, ""))}
                  className="rounded-xl font-mono text-xs"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Checkbox
                id="default-card"
                checked={makeDefault}
                onCheckedChange={(checked) => setMakeDefault(Boolean(checked))}
              />
              <Label htmlFor="default-card" className="text-xs font-medium cursor-pointer">
                Guardar como método de pago predeterminado
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              className="rounded-xl text-xs"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAddCard}
              className="rounded-xl text-xs font-bold gap-1.5"
            >
              <Lock className="size-3.5" /> Guardar Tarjeta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert */}
      <AlertDialog open={Boolean(cardToDelete)} onOpenChange={() => setCardToDelete(null)}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este método de pago?</AlertDialogTitle>
            <AlertDialogDescription>
              La tarjeta se desvinculará de tu cuenta y no podrá ser utilizada en tus próximas compras.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => cardToDelete && handleDeleteCard(cardToDelete)}
              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Sí, eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AccountPaymentsPage;
