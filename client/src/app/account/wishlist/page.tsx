"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Gift,
  ShoppingCart,
  Trash2,
  Plus,
  Share2,
  FolderPlus,
  Tag,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ImageWithFallback } from "@/components/common/ImageWithFallback";
import { useCart } from "@/hooks/useCart";
import { useFavorites } from "@/hooks/useFavorites";
import { formatPrice } from "@/shared/lib/format";
import { toast } from "sonner";
import type { Product } from "@/types";

interface WishlistCollection {
  id: string;
  name: string;
  itemCount: number;
}

const INITIAL_COLLECTIONS: WishlistCollection[] = [
  { id: "all", name: "Todos los artículos", itemCount: 4 },
  { id: "taller", name: "Herramientas de Taller", itemCount: 2 },
  { id: "reforma", name: "Materiales y Reforma", itemCount: 2 },
];

const SAMPLE_WISHLIST_ITEMS: (Product & { collectionId: string })[] = [
  {
    id: 101,
    name: "Taladro Percutor Inalámbrico 20V Brushless",
    price: 89999,
    originalPrice: 109999,
    image: "/images/products/taladro.jpg",
    rating: 4.8,
    reviews: 34,
    inStock: true,
    category: "Herramientas Eléctricas",
    collectionId: "taller",
    sku: "TAL-20V-01",
    description: "Taladro percutor con mandril metálico y 2 baterías de litio.",
  },
  {
    id: 102,
    name: "Amoladora Angular 850W 115mm Profesional",
    price: 45500,
    image: "/images/products/amoladora.jpg",
    rating: 4.7,
    reviews: 18,
    inStock: true,
    category: "Herramientas Eléctricas",
    collectionId: "taller",
    sku: "AMO-850-02",
    description: "Amoladora compacta de alto rendimiento para corte y desbaste.",
  },
  {
    id: 103,
    name: "Látex Interior Lavable Blanco 20 Litros",
    price: 68900,
    originalPrice: 78000,
    image: "/images/products/pintura.jpg",
    rating: 4.9,
    reviews: 52,
    inStock: true,
    category: "Pinturas",
    collectionId: "reforma",
    sku: "PIN-LAT-20",
    description: "Pintura al látex de máxima cobertura y acabado mate lavable.",
  },
  {
    id: 104,
    name: "Set Juego Llaves Combinadas Cromo Vanadio 12 Pzas",
    price: 32400,
    image: "/images/products/llaves.jpg",
    rating: 4.6,
    reviews: 15,
    inStock: false,
    category: "Herramientas Manuales",
    collectionId: "reforma",
    sku: "SET-LLA-12",
    description: "Juego de llaves forjadas con estuche organizador reforzado.",
  },
];

const WishlistPage = () => {
  const { addToCart } = useCart();
  const { items: favItems, count: favCount } = useFavorites();
  const [collections, setCollections] = useState<WishlistCollection[]>(INITIAL_COLLECTIONS);
  const [activeCollection, setActiveCollection] = useState("all");
  const [items, setItems] = useState(SAMPLE_WISHLIST_ITEMS);
  const [newCollectionOpen, setNewCollectionOpen] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");

  const filteredItems = activeCollection === "all"
    ? items
    : items.filter((item) => item.collectionId === activeCollection);

  const totalEstimated = filteredItems.reduce((acc, item) => acc + item.price, 0);

  const handleCreateCollection = () => {
    if (!newCollectionName.trim()) {
      toast.error("Por favor ingresa un nombre para la lista");
      return;
    }
    const newCol: WishlistCollection = {
      id: newCollectionName.toLowerCase().replace(/[^a-z0-9]/g, "-"),
      name: newCollectionName.trim(),
      itemCount: 0,
    };
    setCollections((prev) => [...prev, newCol]);
    setNewCollectionName("");
    setNewCollectionOpen(false);
    toast.success(`Lista "${newCol.name}" creada con éxito.`);
  };

  const handleRemove = (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    toast.success("Producto quitado de tu lista de deseos.");
  };

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    toast.success(`"${product.name}" agregado al carrito de compras.`);
  };

  const handleAddAllToCart = () => {
    const available = filteredItems.filter((i) => i.inStock);
    if (available.length === 0) {
      toast.error("No hay productos con stock disponible en esta lista.");
      return;
    }
    available.forEach((prod) => addToCart(prod));
    toast.success(`Se agregaron ${available.length} productos al carrito.`);
  };

  const handleShareList = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Enlace de tu lista copiado al portapapeles.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="size-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <Gift className="size-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                Lista de Deseos
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Guarda ideas para tus próximos proyectos y muévelas al carrito en 1 clic
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleShareList}
            className="rounded-xl text-xs font-semibold gap-1.5"
          >
            <Share2 className="size-3.5" /> Compartir
          </Button>
          <Button
            size="sm"
            onClick={() => setNewCollectionOpen(true)}
            className="rounded-xl text-xs font-semibold gap-1.5"
          >
            <FolderPlus className="size-3.5" /> Nueva Lista
          </Button>
        </div>
      </div>

      {/* Collections Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {collections.map((col) => {
          const isActive = activeCollection === col.id;
          return (
            <button
              key={col.id}
              type="button"
              onClick={() => setActiveCollection(col.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {col.name}
            </button>
          );
        })}
      </div>

      {/* Summary Bar */}
      {filteredItems.length > 0 && (
        <div className="p-4 rounded-2xl bg-muted/40 border border-border/70 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Tag className="size-4 text-primary" />
            <span className="font-semibold text-foreground">
              {filteredItems.length} artículos en esta lista
            </span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">
              Valor estimado: <strong className="text-foreground">{formatPrice(totalEstimated)}</strong>
            </span>
          </div>

          <Button
            size="sm"
            onClick={handleAddAllToCart}
            className="rounded-xl text-xs font-bold gap-1.5 h-8"
          >
            <ShoppingCart className="size-3.5" /> Agregar todo con stock
          </Button>
        </div>
      )}

      {/* Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-3xl border border-dashed border-border/80 bg-muted/20">
          <div className="size-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4 text-muted-foreground">
            <Gift className="size-8" />
          </div>
          <h3 className="text-base font-bold text-foreground mb-1">
            Tu lista de deseos está vacía
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto mb-6">
            Explora nuestro catálogo de herramientas y materiales para guardar productos que quieras comprar después.
          </p>
          <Button asChild className="font-bold text-xs rounded-xl">
            <Link href="/categories">Explorar Catálogo</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((product) => (
            <Card
              key={product.id}
              className="border-border/70 overflow-hidden flex flex-col justify-between hover:border-primary/40 hover:shadow-xs transition-all group"
            >
              <CardContent className="p-4 flex flex-col h-full justify-between">
                <div>
                  <div className="relative aspect-video rounded-xl bg-muted/40 overflow-hidden mb-3.5 flex items-center justify-center">
                    <ImageWithFallback
                      src={product.image}
                      alt={product.name}
                      className="size-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge
                        variant={product.inStock ? "default" : "secondary"}
                        className="text-[10px] font-bold"
                      >
                        {product.inStock ? "En Stock" : "Sin Stock"}
                      </Badge>
                    </div>
                  </div>

                  <Link
                    href={`/products/${product.id}`}
                    className="font-bold text-sm text-foreground hover:text-primary transition-colors line-clamp-2 mb-1.5"
                  >
                    {product.name}
                  </Link>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                    {product.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-border/60">
                  <div className="flex items-baseline justify-between mb-3">
                    <span className="text-lg font-black text-foreground">
                      {formatPrice(product.price)}
                    </span>
                    {product.originalPrice && (
                      <span className="text-xs line-through text-muted-foreground">
                        {formatPrice(product.originalPrice)}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      size="sm"
                      disabled={!product.inStock}
                      onClick={() => handleAddToCart(product)}
                      className="rounded-xl text-xs font-bold gap-1.5"
                    >
                      <ShoppingCart className="size-3.5" /> Al Carrito
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemove(product.id)}
                      className="rounded-xl text-xs font-semibold text-muted-foreground hover:text-destructive hover:border-destructive/40 gap-1.5"
                    >
                      <Trash2 className="size-3.5" /> Quitar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* New Collection Dialog */}
      <Dialog open={newCollectionOpen} onOpenChange={setNewCollectionOpen}>
        <DialogContent className="rounded-3xl max-w-sm">
          <DialogHeader>
            <DialogTitle>Crear Nueva Lista</DialogTitle>
            <DialogDescription>
              Organiza tus proyectos (ej: "Pintura Living", "Herramientas Jardín").
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Input
              placeholder="Nombre de la lista"
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              className="rounded-xl"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setNewCollectionOpen(false)}
              className="rounded-xl"
            >
              Cancelar
            </Button>
            <Button onClick={handleCreateCollection} className="rounded-xl">
              Crear Lista
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WishlistPage;
