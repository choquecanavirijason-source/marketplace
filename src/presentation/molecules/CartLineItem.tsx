import { Minus, Plus, X } from "lucide-react";
import type { CartItem } from "@/domain/entities/Cart";
import { formatPrice } from "@/shared/lib/format";

export function CartLineItem({
  item,
  onUpdateQty,
  onRemove,
}: {
  item: CartItem;
  onUpdateQty: (delta: number) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-secondary transition-colors">
      <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover bg-secondary" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold truncate">{item.name}</p>
        <p className="text-xs text-primary font-bold">{formatPrice(item.price)}</p>
        <div className="flex items-center gap-1.5 mt-1">
          <button
            type="button"
            onClick={() => onUpdateQty(-1)}
            className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
          >
            <Minus className="w-2.5 h-2.5" />
          </button>
          <span className="text-xs font-bold w-4 text-center">{item.qty}</span>
          <button
            type="button"
            onClick={() => onUpdateQty(1)}
            className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
          >
            <Plus className="w-2.5 h-2.5" />
          </button>
        </div>
      </div>
      <button type="button" onClick={onRemove} className="text-muted-foreground hover:text-red-500 transition-colors">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
