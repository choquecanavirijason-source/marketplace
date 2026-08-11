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
    <div className="flex items-center gap-3 px-6 py-3">
      <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div>
        <p className="text-sm font-bold text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
    </div>
  );
}
