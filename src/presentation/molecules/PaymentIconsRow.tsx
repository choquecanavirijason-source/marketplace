const methods = ["💳 Visa", "💳 MC", "🏦 PayPal", "📱 Apple Pay", "🔐 Stripe"];

export function PaymentIconsRow() {
  return (
    <div className="flex items-center gap-2">
      {methods.map((m) => (
        <div key={m} className="text-xs bg-card border border-border rounded-lg px-2 py-1 text-muted-foreground font-medium">
          {m}
        </div>
      ))}
    </div>
  );
}
