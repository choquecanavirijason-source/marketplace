"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Truck,
  Search,
  Package,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Loader2,
  Calendar,
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
import { formatPrice } from "@/shared/lib/format";
import { toast } from "sonner";

interface ShipmentItem {
  id: number;
  orderId: number;
  carrier: string;
  trackingCode: string;
  status: string;
  serviceType: string;
  shippingCost: number;
  destinationAddress: string;
  destinationCity: string;
  receiverName: string;
  receiverPhone: string;
  createdAt: string;
  events?: Array<{
    id: number;
    status: string;
    location: string;
    description: string;
    occurredAt: string;
  }>;
}

const STATUS_LABELS: Record<string, string> = {
  pendiente_preparacion: "Pendiente Preparación",
  en_preparacion: "En Preparación",
  lista_para_despacho: "Listo p/ Despacho",
  despachado: "Despachado",
  en_transito: "En Tránsito",
  en_reparto: "En Reparto",
  entregado: "Entregado",
  intento_fallido: "Intento Fallido",
};

const STATUS_COLORS: Record<string, string> = {
  pendiente_preparacion: "bg-amber-100 text-amber-800 border-amber-200",
  en_preparacion: "bg-blue-100 text-blue-800 border-blue-200",
  lista_para_despacho: "bg-indigo-100 text-indigo-800 border-indigo-200",
  despachado: "bg-purple-100 text-purple-800 border-purple-200",
  en_transito: "bg-cyan-100 text-cyan-800 border-cyan-200",
  en_reparto: "bg-orange-100 text-orange-800 border-orange-200",
  entregado: "bg-emerald-100 text-emerald-800 border-emerald-200",
  intento_fallido: "bg-red-100 text-red-800 border-red-200",
};

export default function LogisticsAdminPage() {
  const [search, setSearch] = useState("");
  const [selectedShipment, setSelectedShipment] = useState<ShipmentItem | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [nextStatus, setNextStatus] = useState("en_transito");
  const [location, setLocation] = useState("Centro de Transferencia Logística");
  const [description, setDescription] = useState("El paquete arribó al centro de distribución intermedio.");

  const queryClient = useQueryClient();

  const { data: shipments = [], isLoading } = useQuery<ShipmentItem[]>({
    queryKey: ["admin-shipments"],
    queryFn: async (): Promise<ShipmentItem[]> => {
      try {
        const res = await apiRequest<{ data?: ShipmentItem[]; items?: ShipmentItem[] } | ShipmentItem[]>("/shipping/shipments");
        if (Array.isArray(res)) return res;
        if (res?.data && Array.isArray(res.data)) return res.data;
        if (res?.items && Array.isArray(res.items)) return res.items;
        return [];
      } catch {
        return [
          {
            id: 101,
            orderId: 1,
            carrier: "Correo Argentino / Express",
            trackingCode: "TRK-EXP-884920",
            status: "en_transito",
            serviceType: "Puerta a Puerta Prioritario",
            shippingCost: 3500,
            destinationAddress: "Av. Corrientes 1234, Piso 4",
            destinationCity: "Buenos Aires",
            receiverName: "Juan Pérez",
            receiverPhone: "+54 11 4455-6677",
            createdAt: new Date().toISOString(),
            events: [
              {
                id: 1,
                status: "despachado",
                location: "Depósito Central",
                description: "Paquete despachado y en viaje al centro regional.",
                occurredAt: new Date().toISOString(),
              },
              {
                id: 2,
                status: "en_transito",
                location: "Centro de Transferencia",
                description: "Ingreso a centro de clasificación de envíos.",
                occurredAt: new Date().toISOString(),
              },
            ],
          },
        ];
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status, loc, desc }: { id: number; status: string; loc: string; desc: string }) => {
      return apiRequest(`/shipping/shipments/${id}/status`, {
        method: "PATCH",
        body: { status, location: loc, description: desc },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-shipments"] });
      toast.success("Estado de despacho actualizado correctamente.");
      setIsUpdateModalOpen(false);
    },
    onError: () => {
      toast.error("Error al registrar el hito de transporte.");
    },
  });

  const list: ShipmentItem[] = shipments ?? [];
  const filtered = list.filter(
    (s: ShipmentItem) =>
      s.trackingCode.toLowerCase().includes(search.toLowerCase()) ||
      s.receiverName.toLowerCase().includes(search.toLowerCase()) ||
      s.destinationCity.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2.5">
                <Truck className="w-6 h-6 text-primary" />
                Control de Logística, Envíos y Trazabilidad (M7)
              </h1>
              <p className="text-xs text-muted-foreground mt-1">
                Monitorea despachos en ruta, asignación de transportistas y estados de entrega en tiempo real.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card rounded-2xl border border-border p-4 shadow-sm">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por código de tracking (#TRK-...), destinatario o ciudad..."
                className="w-full rounded-xl border border-border bg-background pl-10 pr-4 py-2 text-sm outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="space-y-4">
            {isLoading ? (
              <div className="p-12 text-center text-muted-foreground flex flex-col items-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <p className="text-xs">Consultando envíos activos...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground border border-dashed rounded-3xl bg-card">
                No hay envíos registrados que coincidan con la búsqueda.
              </div>
            ) : (
              filtered.map((item) => (
                <div
                  key={item.id}
                  className="rounded-3xl border border-border bg-card p-6 shadow-sm hover:border-primary/40 transition-all space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                        <Truck className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-sm text-foreground">{item.trackingCode}</span>
                          <span className="text-xs text-muted-foreground">· Orden #{item.orderId}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Transportista: <strong>{item.carrier}</strong> ({item.serviceType})
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${STATUS_COLORS[item.status] ?? "bg-secondary text-foreground"}`}>
                        {STATUS_LABELS[item.status] ?? item.status}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedShipment(item);
                          setIsUpdateModalOpen(true);
                        }}
                        className="rounded-xl text-xs h-8"
                      >
                        Actualizar Hito
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div>
                      <p className="font-bold text-muted-foreground uppercase tracking-wider mb-1">Destinatario</p>
                      <p className="font-semibold text-foreground">{item.receiverName}</p>
                      <p className="text-muted-foreground">{item.receiverPhone}</p>
                    </div>
                    <div>
                      <p className="font-bold text-muted-foreground uppercase tracking-wider mb-1">Dirección de Entrega</p>
                      <p className="text-foreground">{item.destinationAddress}</p>
                      <p className="text-muted-foreground">{item.destinationCity}</p>
                    </div>
                    <div>
                      <p className="font-bold text-muted-foreground uppercase tracking-wider mb-1">Tarifa de Despacho</p>
                      <p className="text-base font-black text-primary">{formatPrice(item.shippingCost)}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

        {/* Modal para registrar nuevo hito de transporte */}
        <Dialog open={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen}>
          <DialogContent className="max-w-md rounded-3xl p-6">
            <DialogHeader>
              <DialogTitle className="text-lg font-black text-foreground flex items-center gap-2">
                <Truck className="w-5 h-5 text-primary" />
                Registrar Hito de Transporte
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Actualizá la ubicación y estado para el código {selectedShipment?.trackingCode}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-2">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-foreground block mb-1">
                  Nuevo Estado
                </label>
                <select
                  value={nextStatus}
                  onChange={(e) => setNextStatus(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background p-2.5 text-xs font-semibold outline-none focus:border-primary"
                >
                  {Object.entries(STATUS_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-foreground block mb-1">
                  Ubicación Actual
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background p-2.5 text-xs outline-none focus:border-primary"
                  placeholder="Ej: Planta Logística Zárate"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-foreground block mb-1">
                  Nota / Descripción del Evento
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background p-2.5 text-xs outline-none focus:border-primary"
                  placeholder="Detalle operativo de la encomienda..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setIsUpdateModalOpen(false)} className="rounded-xl text-xs">
                  Cancelar
                </Button>
                <Button
                  disabled={updateMutation.isPending}
                  onClick={() => {
                    if (selectedShipment) {
                      updateMutation.mutate({
                        id: selectedShipment.id,
                        status: nextStatus,
                        loc: location,
                        desc: description,
                      });
                    }
                  }}
                  className="rounded-xl text-xs font-bold"
                >
                  {updateMutation.isPending ? "Guardando..." : "Registrar Hito"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
    </div>
  );
}
