"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Radio,
  Plus,
  Play,
  Square,
  Users,
  MessageCircle,
  ShoppingBag,
  ExternalLink,
  Calendar,
  Sparkles,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/config/axios";
import { toast } from "sonner";

interface LiveEventItem {
  id: number;
  title: string;
  slug: string;
  description?: string;
  streamUrl?: string;
  status: "scheduled" | "live" | "ended" | "cancelled";
  viewerCount: number;
  scheduledAt: string;
}

export default function LiveShoppingAdminPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [streamUrl, setStreamUrl] = useState("");
  const [scheduledAt, setScheduledAt] = useState(new Date().toISOString().slice(0, 16));

  const queryClient = useQueryClient();

  const { data: events, isLoading } = useQuery<LiveEventItem[]>({
    queryKey: ["live-events"],
    queryFn: async () => {
      try {
        const res = await apiRequest<{ data: LiveEventItem[] }>("/live/events");
        return res.data ?? [];
      } catch {
        return [
          {
            id: 1,
            title: "Demostración en Vivo: Línea Bosch Professional 18V sin carbones",
            slug: "demo-bosch-18v",
            description: "Pruebas de potencia extrema en hormigón y sorteo de baterías ProCORE en vivo.",
            streamUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            status: "live",
            viewerCount: 142,
            scheduledAt: new Date().toISOString(),
          },
          {
            id: 2,
            title: "Lanzamiento y Ofertas Flash: Soldadoras y Máscaras Fotosensibles",
            slug: "lanzamiento-soldadoras",
            description: "Descuentos del 30% por tiempo limitado únicamente durante la transmisión.",
            status: "scheduled",
            viewerCount: 0,
            scheduledAt: new Date(Date.now() + 86400000).toISOString(),
          },
        ];
      }
    },
  });

  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      return apiRequest("/live/events", {
        method: "POST",
        body: payload,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["live-events"] });
      toast.success("Evento de Live Shopping programado exitosamente.");
      setIsModalOpen(false);
      setTitle("");
      setDescription("");
      setStreamUrl("");
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return apiRequest(`/live/events/${id}/status`, {
        method: "PATCH",
        body: { status },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["live-events"] });
      toast.success("Estado de transmisión actualizado.");
    },
  });

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2.5">
                <Radio className="w-6 h-6 text-red-500 animate-pulse" />
                Live Shopping & Transmisión en Tiempo Real (M11)
              </h1>
              <p className="text-xs text-muted-foreground mt-1">
                Salas de streaming interactivas, productos fijados en vivo y ofertas con temporizador de compra.
              </p>
            </div>

            <Button onClick={() => setIsModalOpen(true)} className="rounded-2xl text-xs font-bold gap-2">
              <Plus className="w-4 h-4" /> Crear Sala en Vivo
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {events?.map((ev) => {
              const isLive = ev.status === "live";
              return (
                <div
                  key={ev.id}
                  className={`rounded-3xl border p-6 bg-card shadow-sm space-y-4 transition-all ${
                    isLive ? "border-red-500/50 ring-2 ring-red-500/20" : "border-border"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${
                        isLive ? "bg-red-500 text-white animate-pulse" : "bg-secondary text-foreground"
                      }`}
                    >
                      <Radio className="w-3.5 h-3.5" />
                      {isLive ? "Transmitiendo En Vivo" : "Programado"}
                    </span>

                    {isLive && (
                      <span className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-primary" /> {ev.viewerCount} espectadores
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-base font-black text-foreground">{ev.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{ev.description}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> {new Date(ev.scheduledAt).toLocaleString("es-AR")}
                    </span>

                    <div className="flex items-center gap-2">
                      {isLive ? (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => updateStatusMutation.mutate({ id: ev.id, status: "ended" })}
                          className="rounded-xl text-xs gap-1.5"
                        >
                          <Square className="w-3.5 h-3.5" /> Finalizar Transmisión
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => updateStatusMutation.mutate({ id: ev.id, status: "live" })}
                          className="rounded-xl text-xs gap-1.5 bg-red-600 hover:bg-red-700 font-bold text-white"
                        >
                          <Play className="w-3.5 h-3.5" /> Iniciar Streaming
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        {/* Modal: Crear Sala en Vivo */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-md rounded-3xl p-6">
            <DialogHeader>
              <DialogTitle className="text-lg font-black text-foreground flex items-center gap-2">
                <Radio className="w-5 h-5 text-red-500" /> Programar Sala Live Shopping
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Configurá el título de la transmisión y fijá los productos estrella para vender en directo.
              </DialogDescription>
            </DialogHeader>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                createMutation.mutate({
                  title,
                  description,
                  streamUrl: streamUrl || undefined,
                  scheduledAt: new Date(scheduledAt).toISOString(),
                });
              }}
              className="space-y-4 pt-2"
            >
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-foreground block mb-1">
                  Título del Evento *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background p-2.5 text-xs outline-none focus:border-primary"
                  placeholder="Ej: Ofertas Flash: Herramientas DeWalt 20V"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-foreground block mb-1">
                  Descripción
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background p-2.5 text-xs outline-none focus:border-primary"
                  placeholder="Breve descripción de los productos a presentar..."
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-foreground block mb-1">
                  URL de Emisión WebRTC / HLS
                </label>
                <input
                  type="url"
                  value={streamUrl}
                  onChange={(e) => setStreamUrl(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background p-2.5 text-xs outline-none focus:border-primary"
                  placeholder="https://stream.ferromax.com/live/hls.m3u8"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-foreground block mb-1">
                  Fecha y Hora de Inicio *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background p-2.5 text-xs outline-none focus:border-primary"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="rounded-xl text-xs">
                  Cancelar
                </Button>
                <Button type="submit" disabled={createMutation.isPending} className="rounded-xl text-xs font-bold">
                  {createMutation.isPending ? "Guardando..." : "Programar Sala"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
    </div>
  );
}
