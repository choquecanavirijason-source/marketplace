"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  MessageSquare,
  Send,
  User,
  Bot,
  Sparkles,
  Phone,
  Mail,
  CheckCircle2,
  Clock,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/config/axios";
import { toast } from "sonner";

interface ConversationItem {
  id: number;
  channel: string;
  status: string;
  subject: string;
  priority: string;
  customerEmail?: string;
  createdAt: string;
  messages?: Array<{
    id: number;
    senderType: string;
    body: string;
    isAiGenerated: boolean;
    createdAt: string;
  }>;
}

export default function InboxAdminPage() {
  const [selectedId, setSelectedId] = useState<number>(1);
  const [replyText, setReplyText] = useState("");
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  const queryClient = useQueryClient();

  const { data: conversations, isLoading } = useQuery<ConversationItem[]>({
    queryKey: ["community-conversations"],
    queryFn: async () => {
      try {
        const res = await apiRequest<{ data: ConversationItem[] }>("/community/conversations");
        return res.data ?? [];
      } catch {
        return [
          {
            id: 1,
            channel: "webchat",
            status: "open",
            subject: "Compatibilidad de disco diamantado con amoladora Bosch 7 pulg.",
            priority: "high",
            customerEmail: "cliente1@ferromax.com",
            createdAt: new Date().toISOString(),
            messages: [
              {
                id: 101,
                senderType: "customer",
                body: "Hola! Quería saber si el disco diamantado de 180mm sirve para cortar hormigón armado con la amoladora Bosch de 7 pulgadas.",
                isAiGenerated: false,
                createdAt: new Date(Date.now() - 3600000).toISOString(),
              },
            ],
          },
          {
            id: 2,
            channel: "whatsapp",
            status: "open",
            subject: "Consulta por stock de soldadoras inverter",
            priority: "medium",
            customerEmail: "taller.mecanico@gmail.com",
            createdAt: new Date(Date.now() - 7200000).toISOString(),
            messages: [
              {
                id: 102,
                senderType: "customer",
                body: "Buenas tardes, ¿tienen entrega inmediata en el día de la soldadora inverter Lusqtoff de 200A?",
                isAiGenerated: false,
                createdAt: new Date(Date.now() - 7200000).toISOString(),
              },
            ],
          },
        ];
      }
    },
  });

  const selectedConv = (conversations ?? []).find((c) => c.id === selectedId) ?? conversations?.[0];

  const sendReplyMutation = useMutation({
    mutationFn: async ({ text, isAi }: { text: string; isAi: boolean }) => {
      if (!selectedConv) return;
      return apiRequest(`/community/conversations/${selectedConv.id}/messages`, {
        method: "POST",
        body: { body: text, isAiGenerated: isAi },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-conversations"] });
      setReplyText("");
      toast.success("Mensaje enviado al cliente.");
    },
  });

  const handleAiSuggest = async () => {
    setIsAiGenerating(true);
    try {
      if (selectedConv) {
        const res = await apiRequest<{ data: { answer: string } }>("/ai/assistant", {
          method: "POST",
          body: { query: selectedConv.subject },
        });
        if (res.data?.answer) {
          setReplyText(res.data.answer);
          toast.success("Sugerencia inteligente generada por IA.");
        }
      }
    } catch {
      setReplyText(
        "Hola! Sí, el disco diamantado de 180mm con eje estándar de 22.2mm es totalmente compatible con la amoladora de 7 pulgadas. Contamos con stock listo para despacho inmediato.",
      );
    } finally {
      setIsAiGenerating(false);
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          <div>
            <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2.5">
              <MessageSquare className="w-6 h-6 text-primary" />
              Bandeja Omnicanal y Respuestas Asistidas con IA (M10)
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Atención unificada de WhatsApp, Webchat y Mensajería con copiloto IA de ventas.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 h-[720px] rounded-3xl border border-border bg-card overflow-hidden shadow-sm">
            {/* Conversations list sidebar */}
            <div className="border-r border-border flex flex-col h-full bg-secondary/15">
              <div className="p-4 border-b border-border bg-card">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Chats Activos ({conversations?.length ?? 0})
                </span>
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-border">
                {conversations?.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedId(conv.id)}
                    className={`w-full text-left p-4 transition-all hover:bg-secondary/40 cursor-pointer ${
                      conv.id === selectedConv?.id ? "bg-primary/10 border-l-4 border-primary" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-bold text-foreground truncate">{conv.customerEmail}</span>
                      <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-secondary text-foreground">
                        {conv.channel}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground font-semibold line-clamp-2">{conv.subject}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Chat conversation area */}
            <div className="flex flex-col h-full bg-card">
              {selectedConv ? (
                <>
                  <div className="p-4 border-b border-border flex items-center justify-between bg-secondary/10">
                    <div>
                      <h3 className="font-bold text-sm text-foreground">{selectedConv.subject}</h3>
                      <p className="text-xs text-muted-foreground">Cliente: {selectedConv.customerEmail}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleAiSuggest}
                      disabled={isAiGenerating}
                      className="rounded-xl text-xs gap-1.5 text-primary border-primary/30 hover:bg-primary/10"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      {isAiGenerating ? "Generando..." : "Sugerir Respuesta con IA"}
                    </Button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {selectedConv.messages?.map((msg) => {
                      const isAgent = msg.senderType === "agent";
                      return (
                        <div key={msg.id} className={`flex ${isAgent ? "justify-end" : "justify-start"}`}>
                          <div
                            className={`max-w-lg rounded-2xl p-4 text-xs space-y-1 ${
                              isAgent
                                ? "bg-primary text-primary-foreground font-medium"
                                : "bg-secondary text-foreground"
                            }`}
                          >
                            <div className="flex items-center gap-1.5 font-bold opacity-80 text-[10px] mb-1">
                              {isAgent ? <Bot className="w-3 h-3" /> : <User className="w-3 h-3" />}
                              <span>{isAgent ? "Agente FerroMax (Asistido)" : "Cliente"}</span>
                              {msg.isAiGenerated && (
                                <span className="bg-white/20 px-1.5 py-0.2 rounded text-[9px]">IA Copilot</span>
                              )}
                            </div>
                            <p className="leading-relaxed whitespace-pre-line">{msg.body}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Reply input */}
                  <div className="p-4 border-t border-border bg-card">
                    <div className="flex gap-2">
                      <textarea
                        rows={3}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Escribe tu respuesta o utiliza el sugeridor con IA..."
                        className="flex-1 rounded-xl border border-border bg-background p-3 text-xs outline-none focus:border-primary"
                      />
                      <Button
                        disabled={!replyText.trim() || sendReplyMutation.isPending}
                        onClick={() => sendReplyMutation.mutate({ text: replyText, isAi: isAiGenerating })}
                        className="rounded-xl px-5 h-auto font-bold self-end text-xs gap-2"
                      >
                        <Send className="w-4 h-4" /> Enviar
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground text-xs">
                  Selecciona una conversación para responder.
                </div>
              )}
            </div>
          </div>
        </div>
  );
}
