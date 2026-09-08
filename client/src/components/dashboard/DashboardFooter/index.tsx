import { NextjsIcon, NestjsIcon } from "@/components/icons/TechIcons";

export const DashboardFooter = () => {
  return (
    <footer className="w-full border-t border-border/40 bg-background/60 backdrop-blur-xl px-4 py-3 mt-auto text-xs text-muted-foreground">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-6 text-[11px] font-medium">
        <div className="flex items-center gap-1.5">
          <NextjsIcon className="size-3.5 text-foreground" />
          <span className="text-foreground font-semibold">Next.js</span>
          <span className="text-muted-foreground">v16.3.0</span>
        </div>
        <span className="text-border">•</span>
        <div className="flex items-center gap-1.5">
          <NestjsIcon className="size-3.5 text-[#E0234E]" />
          <span className="text-foreground font-semibold">NestJS</span>
          <span className="text-muted-foreground">v12.0.1</span>
        </div>
      </div>
    </footer>
  );
};
