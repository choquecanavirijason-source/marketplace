import { Mail } from "lucide-react";
import { NewsletterForm } from "@/presentation/molecules/NewsletterForm";

export function NewsletterSection() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-6 pb-10">
      <div
        className="rounded-3xl relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1b5e20 0%, #2e7d32 50%, #388e3c 100%)" }}
      >
        <div className="relative z-10 text-center py-12 px-4">
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Mail className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl font-black text-white mb-2">Stay Fresh with EkoMart</h2>
          <p className="text-green-100/80 text-sm mb-8 max-w-md mx-auto">
            Subscribe for weekly deals, seasonal picks, and recipes from our in-house nutritionists.
          </p>
          <NewsletterForm />
          <p className="text-green-200/50 text-xs mt-4">No spam. Unsubscribe anytime.</p>
        </div>
        <div className="absolute -left-16 -bottom-16 w-48 h-48 rounded-full bg-white/5" />
        <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/5" />
      </div>
    </section>
  );
}
