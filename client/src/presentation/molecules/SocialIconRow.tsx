import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";

const icons = [Facebook, Twitter, Instagram, Youtube];

export function SocialIconRow() {
  return (
    <div className="flex items-center gap-3">
      {icons.map((Icon, i) => (
        <button
          key={i}
          type="button"
          className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center hover:bg-primary transition-colors"
        >
          <Icon className="w-4 h-4" />
        </button>
      ))}
    </div>
  );
}
