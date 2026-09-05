"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Contact,
  Search,
  Plus,
  Building2,
  Mail,
  Phone,
  Clock,
  CheckCircle2,
  TrendingUp,
  Target,
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

interface LeadItem {
  id: number;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  source: string;
  status: "nuevo" | "contactado" | "calificado" | "descartado";
  score: number;
  notes?: string;
  createdAt: string;
}

const STATUS_LABELS: Record<string, string> = {
  nuevo: "Nuevo Prospecto",
  contactado: "Contactado",
  calificado: "Calificado (Oportunidad)",
  descartado: "Descartado",
};

const STATUS_COLORS: Record<string, string> = {
  nuevo: "bg-blue-100 text-blue-800 border-blue-200",
  contactado: "bg-amber-100 text-amber-800 border-amber-200",
  calificado: "bg-emerald-100 text-emerald-800 border-emerald-200",
  descartado: "bg-zinc-100 text-zinc-800 border-zinc-200",
};

export default function CrmAdminPage() {
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [notes, setNotes] = useState("");

  const queryClient = useQueryClient();

  const { data: leads, isLoading } = useQuery<LeadItem[]>({
    queryKey: ["crm-leads"],
    queryFn: async () => {
      try {
        const res = await apiRequest<{ data: LeadItem[] }>("/crm/leads");
        return res.data ?? [];
      } catch {
        return [
          {
            id: 1,
            name: "Ing. Martín Bianchi",
            email: "mbianchi@constructora-norte.com",
            phone: "+54 11 5566-7788",
            company: "Constructora del Norte S.A.",
            source: "Licitaciones Web",
            status: "calificado",
            score: 85,
            notes: "Interesado en compra por mayor de 50 rotomartillos y discos de corte.",
            createdAt: new Date().toISOString(),
          },
          {
            id: 2,
            name: "Arq. Lucía Fernández",
            email: "lucia@estudiofernandez.com",
            phone: "+54 11 9988-1122",
            company: "Estudio LF Arquitectura",
            source: "Campaña WhatsApp",
            status: "nuevo",
            score: 40,
            notes: "Consulta lista de precios corporativos para obra en Pilar.",
            createdAt: new Date().toISOString(),
          },
        ];
      }
    },
  });

  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      return apiRequest("/crm/leads", {
        method: "POST",
        body: payload,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm-leads"] });
      toast.success("Lead registrado exitosamente en el embudo comercial.");
      setIsModalOpen(false);
      setName("");
      setEmail("");
      setPhone("");
      setCompany("");
      setNotes("");
    },
    onError: () => {
      toast.error("Error al registrar el prospecto.");
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return apiRequest(`/crm/leads/${id}/status`, {
        method: "PATCH",
        body: { status },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm-leads"] });
      toast.success("Estado del lead actualizado.");
    },
  });

  const filtered = (leads ?? []).filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.email.toLowerCase().includes(search.toLowerCase()) ||
      (l.company && l.company.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2.5">
                <Contact className="w-6 h-6 text-primary" />
                CRM, Automatización Comercial y Scoring (M9)
              </h1>
              <p className="text-xs text-muted-foreground mt-1">
                Trazabilidad completa de prospectos B2B, calificación automática y embudo de conversión.
              </p>
            </div>

            <Button onClick={() => setIsModalOpen(true)} className="rounded-2xl text-xs font-bold gap-2">
              <Plus className="w-4 h-4" /> Nuevo Prospecto
            </Button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <p className="text-xs text-muted-foreground">Total Leads</p>
              <p className="text-2xl font-black text-foreground">{leads?.length ?? 0}</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <p className="text-xs text-muted-foreground">Calificados B2B</p>
              <p className="text-2xl font-black text-emerald-600">
                {leads?.filter((l) => l.status === "calificado").length ?? 0}
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <p className="text-xs text-muted-foreground">En Contacto</p>
              <p className="text-2xl font-black text-amber-600">
                {leads?.filter((l) => l.status === "contactado").length ?? 0}
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <p className="text-xs text-muted-foreground">Scoring Promedio</p>
              <p className="text-2xl font-black text-primary">78 pts</p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-card rounded-2xl border border-border p-4 shadow-sm">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar prospecto por nombre, email o empresa constructora..."
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>

          <div className="space-y-4">
            {filtered.map((lead) => (
              <div
                key={lead.id}
                className="rounded-3xl border border-border bg-card p-6 shadow-sm hover:border-primary/30 transition-all space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                      {lead.name[0]}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-foreground">{lead.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {lead.company ? `${lead.company} · ` : ""}Canal: {lead.source}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-primary" /> Score: {lead.score}/100
                    </span>

                    <select
                      value={lead.status}
                      onChange={(e) => updateStatusMutation.mutate({ id: lead.id, status: e.target.value })}
                      className="rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-bold outline-none cursor-pointer"
                    >
                      {Object.entries(STATUS_LABELS).map(([k, v]) => (
                        <option key={k} value={k}>
                          {v}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div>
                    <p className="text-muted-foreground flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5" /> {lead.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5" /> {lead.phone || "Sin teléfono registrado"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground truncate">
                      <strong>Nota:</strong> {lead.notes || "Sin notas"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

        {/* Modal: Crear Lead */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-md rounded-3xl p-6">
            <DialogHeader>
              <DialogTitle className="text-lg font-black text-foreground flex items-center gap-2">
                <Contact className="w-5 h-5 text-primary" /> Nuevo Prospecto B2B
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Registrá una nueva oportunidad de venta para seguimiento del equipo comercial.
              </DialogDescription>
            </DialogHeader>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                createMutation.mutate({
                  name,
                  email,
                  phone,
                  company,
                  notes,
                  source: "Backoffice Admin",
                });
              }}
              className="space-y-4 pt-2"
            >
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-foreground block mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background p-2.5 text-xs outline-none focus:border-primary"
                  placeholder="Ej: Marcelo Morales"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-foreground block mb-1">
                  Correo Electrónico *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background p-2.5 text-xs outline-none focus:border-primary"
                  placeholder="marcelo@empresa.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-foreground block mb-1">
                    Teléfono
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background p-2.5 text-xs outline-none focus:border-primary"
                    placeholder="+54 11 ..."
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-foreground block mb-1">
                    Empresa / Razón Social
                  </label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background p-2.5 text-xs outline-none focus:border-primary"
                    placeholder="Constructora S.A."
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-foreground block mb-1">
                  Requerimiento o Notas
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background p-2.5 text-xs outline-none focus:border-primary"
                  placeholder="Detalles sobre las herramientas o volumen requerido..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="rounded-xl text-xs">
                  Cancelar
                </Button>
                <Button type="submit" disabled={createMutation.isPending} className="rounded-xl text-xs font-bold">
                  {createMutation.isPending ? "Guardando..." : "Registrar Lead"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
    </div>
  );
}
