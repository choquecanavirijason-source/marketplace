import { Minus, Plus } from "lucide-react";
import { QuantityButton } from "@/presentation/atoms/QuantityButton";

export function QuantitySelector({
  qty,
  onChange,
}: {
  qty: number;
  onChange: (qty: number) => void;
}) {
  return (
    <div className="flex items-center border-2 border-border rounded-xl overflow-hidden">
      <QuantityButton onClick={() => onChange(Math.max(1, qty - 1))} aria-label="Disminuir cantidad">
        <Minus className="w-4 h-4" />
      </QuantityButton>
      <span className="w-12 text-center font-bold text-base">{qty}</span>
      <QuantityButton onClick={() => onChange(qty + 1)} aria-label="Aumentar cantidad">
        <Plus className="w-4 h-4" />
      </QuantityButton>
    </div>
  );
}
