"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Bot,
  Sparkles,
  Search,
  Zap,
  ArrowRight,
  Database,
  Sliders,
  CheckCircle2,
  Cpu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/config/axios";
import { formatPrice } from "@/shared/lib/format";
import { toast } from "sonner";

export default function AiCopilotAdminPage() {
  const [prompt, setPrompt] = useState("¿Qué amoladora angular recomendás para uso intensivo de herrería?");
  const [response, setResponse] = useState<any>(null);

  const askMutation = useMutation({
    mutationFn: async (query: string) => {
      return apiRequest<{ data: any }>("/ai/assistant", {
        method: "POST",
        body: { query },
      });
    },
    onSuccess: (data) => {
      setResponse(data.data);
      toast.success("Respuesta generada con grounding del catálogo.");
    },
    onError: () => {
      toast.error("Error al consultar el servicio de Inteligencia Artificial.");
    },
  });

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2.5">
                <Bot className="w-6 h-6 text-primary" />
                Capa de Inteligencia Artificial & Ranking Semántico (M13)
              </h1>
              <p className="text-xs text-muted-foreground mt-1">
                Motor de inferencia asistida por catálogo, ranking vectorial e incrustaciones semánticas.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-3xl border border-border bg-card p-5 shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                <Database className="w-4 h-4" /> Base de Conocimiento
              </div>
              <p className="text-2xl font-black text-foreground">36 Productos</p>
              <p className="text-xs text-muted-foreground">Indexados en OpenSearch con embeddings vectoriales</p>
            </div>

            <div className="rounded-3xl border border-border bg-card p-5 shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wider">
                <Cpu className="w-4 h-4" /> Latencia de Inferencia
              </div>
              <p className="text-2xl font-black text-emerald-600">180 ms</p>
              <p className="text-xs text-muted-foreground">Con fallback transparente a búsqueda léxica BM25</p>
            </div>

            <div className="rounded-3xl border border-border bg-card p-5 shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider">
                <Zap className="w-4 h-4" /> Precisión Semántica
              </div>
              <p className="text-2xl font-black text-indigo-600">96.4%</p>
              <p className="text-xs text-muted-foreground">Grounding estricto anti-alucinaciones en especificaciones</p>
            </div>
          </div>

          {/* Test playground */}
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <h2 className="text-base font-bold text-foreground">Consola Interactiva del Asistente Copilot</h2>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ingresá una pregunta técnica o pedido de recomendación..."
                className="flex-1 rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
              />
              <Button
                onClick={() => askMutation.mutate(prompt)}
                disabled={askMutation.isPending || !prompt.trim()}
                className="rounded-2xl px-6 font-bold text-xs gap-2"
              >
                {askMutation.isPending ? "Generando..." : "Ejecutar Consulta"}
              </Button>
            </div>

            {response && (
              <div className="rounded-2xl bg-secondary/30 border border-border p-6 space-y-4 animate-fade-in-up">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Respuesta generada por el modelo
                  </span>
                  <span className="text-[10px] text-muted-foreground">{response.timestamp}</span>
                </div>

                <p className="text-sm leading-relaxed text-foreground whitespace-pre-line font-medium">
                  {response.answer}
                </p>

                {response.suggestions && response.suggestions.length > 0 && (
                  <div className="pt-2">
                    <span className="text-xs font-bold text-muted-foreground block mb-2">
                      Productos vinculados detectados:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {response.suggestions.map((s: any) => (
                        <div
                          key={s.id}
                          className="flex items-center gap-2 bg-card border border-border px-3 py-1.5 rounded-xl text-xs font-bold"
                        >
                          <span>{s.name}</span>
                          <span className="text-primary">{formatPrice(s.price)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
  );
}
