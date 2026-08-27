import CategoryDetailPageClient from "./CategoryDetailPageClient";

export function generateStaticParams() {
  return [
    { slug: "general" },
    { slug: "herramientas-electricas" },
    { slug: "herramientas-manuales" },
    { slug: "pinturas" },
    { slug: "plomeria" },
    { slug: "electricidad" },
    { slug: "accesorios-y-repuestos" },
    { slug: "calefaccion" },
    { slug: "climatizacion" },
    { slug: "construccion" },
    { slug: "tornillos-y-fijaciones" },
    { slug: "seguridad-industrial" },
  ];
}

export default function CategoryDetailPage() {
  return <CategoryDetailPageClient />;
}