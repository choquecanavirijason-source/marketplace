import type { LucideIcon } from "lucide-react";

export function TrustBadgeItem({ icon: Icon, text }: { icon: LucideIcon; text: string }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <span className="text-muted-foreground">{text}</span>
    </div>
  );
}

export function FeatureBarItem({
  icon: Icon,
  title,
  desc,
  color,
}: {
  icon: LucideIcon;
  title: string;
  desc: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2.5 sm:gap-3 px-3 sm:px-6 py-2 sm:py-3 group hover:bg-muted/30 rounded-xl md:rounded-none transition-colors">
      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
        <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${color}`} />
      </div>
      <div className="min-w-0">
        <p className="text-xs sm:text-sm font-bold text-foreground truncate">{title}</p>
        <p className="text-[10px] sm:text-xs text-muted-foreground truncate hidden sm:block">{desc}</p>
      </div>
    </div>
  );
}
