import { cn } from "@/shared/lib/utils";

export function GalleryThumbnail({
  src,
  active,
  onClick,
}: {
  src: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-16 h-16 rounded-xl overflow-hidden border-2 transition-all",
        active ? "border-primary shadow-md" : "border-border hover:border-primary/40",
      )}
    >
      <img src={src} alt="" className="w-full h-full object-cover" />
    </button>
  );
}
