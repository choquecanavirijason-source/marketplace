import { ChevronRight } from "lucide-react";

export function FooterLinkColumn({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <h4 className="font-black text-sm mb-4 text-white">{title}</h4>
      <ul className="space-y-2.5">
        {links.map((link) => (
          <li key={link}>
            <a href="#" className="text-sm text-white/60 hover:text-orange-400 transition-colors flex items-center gap-1.5">
              <ChevronRight className="w-3 h-3" /> {link}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
