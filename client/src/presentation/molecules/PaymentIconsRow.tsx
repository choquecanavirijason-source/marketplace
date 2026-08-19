import { Banknote, CreditCard, Landmark, Smartphone } from "lucide-react";

const methods = [
  { Icon: CreditCard, label: "Tarjeta" },
  { Icon: Landmark, label: "Transferencia" },
  { Icon: Smartphone, label: "Billetera" },
  { Icon: Banknote, label: "Efectivo" },
];

export function PaymentIconsRow() {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {methods.map(({ Icon, label }) => (
        <div
          key={label}
          className="flex items-center gap-1.5 text-xs bg-card border border-border rounded-lg px-2.5 py-1.5 text-muted-foreground font-medium"
        >
          <Icon className="w-3.5 h-3.5" strokeWidth={1.75} />
          {label}
        </div>
      ))}
    </div>
  );
}
