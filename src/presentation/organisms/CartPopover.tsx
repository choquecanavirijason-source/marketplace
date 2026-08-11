"use client";

import { useEffect, useRef, useState } from "react";
import { ShoppingCart, X } from "lucide-react";
import { useCart } from "@/presentation/hooks/useCart";
import { CartLineItem } from "@/presentation/molecules/CartLineItem";
import { formatPrice } from "@/shared/lib/format";

export function CartPopover() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { items, total, count, updateQty, removeFromCart } = useCart();

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex flex-col items-center p-2 hover:text-primary transition-colors text-foreground/70 gap-0.5 relative"
      >
        <ShoppingCart className="w-5 h-5" />
        <span className="text-[10px] font-medium">Cart</span>
        {count > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-primary text-white text-[9px] font-bold rounded-full flex items-center justify-center">
            {count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-card rounded-2xl shadow-2xl border border-border z-50 overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="font-bold text-sm">Shopping Cart ({count})</h3>
            <button type="button" onClick={() => setOpen(false)}>
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          <div className="max-h-72 overflow-y-auto p-2">
            {items.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ShoppingCart className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Your cart is empty</p>
              </div>
            ) : (
              items.map((item) => (
                <CartLineItem
                  key={item.id}
                  item={item}
                  onUpdateQty={(delta) => updateQty(item.id, delta)}
                  onRemove={() => removeFromCart(item.id)}
                />
              ))
            )}
          </div>
          {items.length > 0 && (
            <div className="p-4 border-t border-border">
              <div className="flex justify-between mb-3">
                <span className="text-sm text-muted-foreground">Total:</span>
                <span className="font-bold text-primary">{formatPrice(total)}</span>
              </div>
              <button
                type="button"
                className="w-full bg-primary text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors"
              >
                Checkout
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
