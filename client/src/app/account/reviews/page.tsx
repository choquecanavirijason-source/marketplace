"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Star,
  MessageSquare,
  CheckCircle2,
  Clock,
  Pencil,
  Trash2,
  ThumbsUp,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ImageWithFallback } from "@/components/common/ImageWithFallback";
import { toast } from "sonner";

interface ReviewItem {
  id: string;
  productId: number;
  productName: string;
  productImage: string;
  rating: number;
  title: string;
  comment: string;
  createdAt: string;
  likes: number;
  verifiedPurchase: boolean;
}

interface PendingReviewItem {
  id: string;
  productId: number;
  productName: string;
  productImage: string;
  orderNumber: string;
  purchaseDate: string;
}

const INITIAL_REVIEWS: ReviewItem[] = [
  {
    id: "rev-1",
    productId: 1,
    productName: "Rotomartillo SDS Plus 800W 2.7 Joules",
    productImage: "/images/products/rotomartillo.jpg",
    rating: 5,
    title: "Excelente potencia para perforar losas de hormigón",
    comment:
      "La máquina superó ampliamente mis expectativas. El golpe neumático perfora sin esfuerzo y el cable es de excelente calidad y longitud. Totalmente recomendada.",
    createdAt: "12 de Enero de 2026",
    likes: 14,
    verifiedPurchase: true,
  },
  {
    id: "rev-2",
    productId: 2,
    productName: "Nivel Láser Autonivelante 360° 12 Líneas Verdes",
    productImage: "/images/products/nivel-laser.jpg",
    rating: 4,
    title: "Muy buena visibilidad incluso con luz natural",
    comment:
      "El rayo verde es muy nítido y la batería dura bastante. Viene con trípode y soporte magnético. Muy conforme con la compra.",
    createdAt: "28 de Noviembre de 2025",
    likes: 6,
    verifiedPurchase: true,
  },
];

const INITIAL_PENDING: PendingReviewItem[] = [
  {
    id: "pen-1",
    productId: 3,
    productName: "Caja de Herramientas Plástica 22 Pulgadas con Bandeja",
    productImage: "/images/products/caja.jpg",
    orderNumber: "ORD-94821",
    purchaseDate: "15 de Febrero de 2026",
  },
  {
    id: "pen-2",
    productId: 4,
    productName: "Escalera Articulada de Aluminio 4x3 12 Escalones",
    productImage: "/images/products/escalera.jpg",
    orderNumber: "ORD-94118",
    purchaseDate: "2 de Febrero de 2026",
  },
];

const ReviewsPage = () => {
  const [activeTab, setActiveTab] = useState<"published" | "pending">("published");
  const [reviews, setReviews] = useState<ReviewItem[]>(INITIAL_REVIEWS);
  const [pending, setPending] = useState<PendingReviewItem[]>(INITIAL_PENDING);

  // Review modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPending, setSelectedPending] = useState<PendingReviewItem | null>(null);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewComment, setReviewComment] = useState("");

  const handleOpenReviewModal = (item: PendingReviewItem) => {
    setSelectedPending(item);
    setRating(5);
    setReviewTitle("");
    setReviewComment("");
    setModalOpen(true);
  };

  const handleSubmitReview = () => {
    if (!reviewComment.trim()) {
      toast.error("Por favor escribe tu opinión sobre el producto.");
      return;
    }
    if (!selectedPending) return;

    const newReview: ReviewItem = {
      id: `rev-${Date.now()}`,
      productId: selectedPending.productId,
      productName: selectedPending.productName,
      productImage: selectedPending.productImage,
      rating,
      title: reviewTitle.trim() || "Excelente producto",
      comment: reviewComment.trim(),
      createdAt: "Hoy",
      likes: 0,
      verifiedPurchase: true,
    };

    setReviews((prev) => [newReview, ...prev]);
    setPending((prev) => prev.filter((p) => p.id !== selectedPending.id));
    setModalOpen(false);
    toast.success("¡Gracias! Tu reseña ha sido publicada exitosamente.");
  };

  const handleDeleteReview = (id: string) => {
    setReviews((prev) => prev.filter((r) => r.id !== id));
    toast.success("Reseña eliminada.");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div className="flex items-center gap-2.5">
          <div className="size-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <Star className="size-5 fill-amber-500" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              Mis Reseñas y Valoraciones
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Comparte tu experiencia para ayudar a otros clientes a elegir el mejor equipamiento
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border/80 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("published")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "published"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <CheckCircle2 className="size-4" />
          <span>Publicadas ({reviews.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("pending")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "pending"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <Clock className="size-4" />
          <span>Pendientes de valorar ({pending.length})</span>
        </button>
      </div>

      {/* Tab: Published */}
      {activeTab === "published" && (
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <div className="text-center py-16 px-4 rounded-3xl border border-dashed border-border/80 bg-muted/20">
              <div className="size-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4 text-muted-foreground">
                <MessageSquare className="size-8" />
              </div>
              <h3 className="text-base font-bold text-foreground mb-1">
                Aún no has publicado reseñas
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto mb-6">
                Califica los productos de tus compras anteriores para sumar puntos y ayudar a la comunidad.
              </p>
              {pending.length > 0 && (
                <Button
                  onClick={() => setActiveTab("pending")}
                  className="rounded-xl font-bold text-xs"
                >
                  Ver compras pendientes de calificar
                </Button>
              )}
            </div>
          ) : (
            reviews.map((rev) => (
              <Card key={rev.id} className="border-border/70 hover:border-border transition-all">
                <CardContent className="p-5 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <ImageWithFallback
                        src={rev.productImage}
                        alt={rev.productName}
                        className="size-12 rounded-xl object-contain bg-muted p-1 shrink-0"
                      />
                      <div>
                        <Link
                          href={`/products/${rev.productId}`}
                          className="text-xs sm:text-sm font-bold text-foreground hover:text-primary transition-colors"
                        >
                          {rev.productName}
                        </Link>
                        <div className="flex items-center gap-2 mt-0.5">
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`size-3.5 ${
                                  star <= rev.rating
                                    ? "text-amber-500 fill-amber-500"
                                    : "text-muted-foreground/30"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-[11px] text-muted-foreground">• {rev.createdAt}</span>
                          {rev.verifiedPurchase && (
                            <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-500/30 font-bold">
                              Compra Verificada
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteReview(rev.id)}
                      className="rounded-xl text-xs text-muted-foreground hover:text-destructive self-end sm:self-center h-8"
                    >
                      <Trash2 className="size-3.5 mr-1" /> Eliminar
                    </Button>
                  </div>

                  <div className="bg-muted/30 p-3.5 rounded-xl border border-border/40">
                    <h4 className="text-xs font-bold text-foreground mb-1">{rev.title}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{rev.comment}</p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Tab: Pending */}
      {activeTab === "pending" && (
        <div className="space-y-4">
          {pending.length === 0 ? (
            <div className="text-center py-16 px-4 rounded-3xl border border-dashed border-border/80 bg-muted/20">
              <div className="size-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4 text-emerald-500">
                <CheckCircle2 className="size-8" />
              </div>
              <h3 className="text-base font-bold text-foreground mb-1">
                ¡Estás al día con tus opiniones!
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                No tienes productos pendientes de valorar. Cuando recibas nuevos pedidos podrás calificarlos aquí.
              </p>
            </div>
          ) : (
            pending.map((item) => (
              <Card key={item.id} className="border-border/70 hover:border-primary/40 transition-all">
                <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <ImageWithFallback
                      src={item.productImage}
                      alt={item.productName}
                      className="size-14 rounded-xl object-contain bg-muted p-1.5 shrink-0"
                    />
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-foreground line-clamp-1">
                        {item.productName}
                      </h4>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Pedido: <span className="font-mono font-semibold">{item.orderNumber}</span> • Entregado el {item.purchaseDate}
                      </p>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleOpenReviewModal(item)}
                    className="rounded-xl font-bold text-xs gap-1.5 shrink-0"
                  >
                    <Star className="size-3.5 fill-current" /> Calificar Producto
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Review Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="rounded-3xl max-w-lg">
          <DialogHeader>
            <DialogTitle>Dejar Reseña del Producto</DialogTitle>
            <DialogDescription>
              {selectedPending?.productName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <Label className="text-xs font-bold mb-2 block">Puntuación general</Label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`size-7 ${
                        star <= (hoverRating || rating)
                          ? "text-amber-500 fill-amber-500"
                          : "text-muted-foreground/30"
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-bold ml-2 text-foreground">
                  {rating === 5 && "Excelente"}
                  {rating === 4 && "Muy bueno"}
                  {rating === 3 && "Bueno"}
                  {rating === 2 && "Regular"}
                  {rating === 1 && "Malo"}
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="review-title" className="text-xs font-bold">
                Título breve de tu opinión (opcional)
              </Label>
              <Input
                id="review-title"
                placeholder="Ej: Calidad superior, fácil de instalar..."
                value={reviewTitle}
                onChange={(e) => setReviewTitle(e.target.value)}
                className="rounded-xl text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="review-comment" className="text-xs font-bold">
                Tu opinión detallada
              </Label>
              <Textarea
                id="review-comment"
                placeholder="¿Qué te pareció el material, la potencia, la terminación? ¿Lo recomendarías a un colega?"
                rows={4}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="rounded-xl text-xs"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setModalOpen(false)}
              className="rounded-xl text-xs"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmitReview}
              className="rounded-xl text-xs font-bold"
            >
              Publicar Reseña
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReviewsPage;
