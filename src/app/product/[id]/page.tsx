import Link from "next/link";
import { StorefrontTemplate } from "@/presentation/templates/StorefrontTemplate";
import { ProductDetailTemplate } from "@/presentation/templates/ProductDetailTemplate";
import { productsSeed } from "@/infrastructure/data/products.data";

export async function generateStaticParams() {
  return productsSeed.map((product) => ({
    id: product.id.toString(),
  }));
}

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = await params;
  const product = productsSeed.find((p) => p.id === Number(id));

  return (
    <StorefrontTemplate>
      {!product ? (
        <div className="max-w-7xl mx-auto px-4 py-24 text-center">
          <h1 className="text-2xl font-black text-foreground mb-2">Producto no encontrado</h1>
          <p className="text-muted-foreground mb-6">Este producto pudo haber sido eliminado o ya no está disponible.</p>
          <Link href="/" className="text-primary font-semibold hover:underline">
            Volver a la tienda
          </Link>
        </div>
      ) : (
        <ProductDetailTemplate product={product} />
      )}
    </StorefrontTemplate>
  );
}
