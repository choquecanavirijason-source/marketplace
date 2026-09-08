"use client";

import { useState } from "react";
import {
  Receipt,
  Download,
  Search,
  Filter,
  FileText,
  Building2,
  CheckCircle2,
  Calendar,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatPrice } from "@/shared/lib/format";
import { toast } from "sonner";

interface Invoice {
  id: string;
  invoiceNumber: string;
  type: "A" | "B";
  orderId: string;
  date: string;
  netAmount: number;
  vatAmount: number;
  totalAmount: number;
  status: "issued" | "paid";
  businessName: string;
  taxId: string;
}

const SAMPLE_INVOICES: Invoice[] = [
  {
    id: "inv-1",
    invoiceNumber: "0001-00049281",
    type: "A",
    orderId: "ORD-94821",
    date: "15 de Febrero de 2026",
    netAmount: 74379.34,
    vatAmount: 15619.66,
    totalAmount: 89999,
    status: "paid",
    businessName: "CONSTRUCTORA ANDINA S.A.",
    taxId: "30-71234567-8",
  },
  {
    id: "inv-2",
    invoiceNumber: "0001-00048892",
    type: "B",
    orderId: "ORD-94118",
    date: "2 de Febrero de 2026",
    netAmount: 37603.3,
    vatAmount: 7896.7,
    totalAmount: 45500,
    status: "paid",
    businessName: "Consumidor Final",
    taxId: "20-38491029-4",
  },
  {
    id: "inv-3",
    invoiceNumber: "0001-00047510",
    type: "A",
    orderId: "ORD-93502",
    date: "18 de Enero de 2026",
    netAmount: 56942.15,
    vatAmount: 11957.85,
    totalAmount: 68900,
    status: "paid",
    businessName: "CONSTRUCTORA ANDINA S.A.",
    taxId: "30-71234567-8",
  },
  {
    id: "inv-4",
    invoiceNumber: "0001-00046124",
    type: "B",
    orderId: "ORD-92891",
    date: "28 de Diciembre de 2025",
    netAmount: 26776.86,
    vatAmount: 5623.14,
    totalAmount: 32400,
    status: "paid",
    businessName: "Consumidor Final",
    taxId: "20-38491029-4",
  },
];

const AccountInvoicesPage = () => {
  const [invoices, setInvoices] = useState<Invoice[]>(SAMPLE_INVOICES);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const filteredInvoices = invoices.filter((inv) => {
    const matchesQuery =
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.businessName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || inv.type === typeFilter;
    return matchesQuery && matchesType;
  });

  const handleDownloadPdf = (invoiceNumber: string) => {
    toast.success(`Descargando comprobante ${invoiceNumber}.pdf...`);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div className="flex items-center gap-2.5">
          <div className="size-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            <Receipt className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              Facturación & Comprobantes
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Descarga facturas electrónicas oficiales AFIP/DGI de todas tus compras
            </p>
          </div>
        </div>
      </div>

      {/* Fiscal Info Alert */}
      <div className="p-4 rounded-2xl border border-border/70 bg-muted/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <Building2 className="size-4 text-primary shrink-0" />
          <span className="text-muted-foreground">
            Datos fiscales para Factura A: <strong className="text-foreground">Configurados en Modo Empresa</strong>
          </span>
        </div>
        <Button asChild variant="outline" size="sm" className="rounded-xl text-xs font-semibold h-8 self-start sm:self-center">
          <a href="/account/company">Gestionar CUIT & Datos Fiscales</a>
        </Button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por Nº factura, pedido o razón social..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 rounded-xl text-xs"
          />
        </div>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-44 rounded-xl text-xs">
            <SelectValue placeholder="Tipo de Factura" />
          </SelectTrigger>
          <SelectContent className="rounded-xl text-xs">
            <SelectItem value="all">Todos los tipos</SelectItem>
            <SelectItem value="A">Factura A (Con IVA)</SelectItem>
            <SelectItem value="B">Factura B (Final)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Invoices List */}
      {filteredInvoices.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-3xl border border-dashed border-border/80 bg-muted/20">
          <div className="size-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4 text-muted-foreground">
            <Receipt className="size-8" />
          </div>
          <h3 className="text-base font-bold text-foreground mb-1">
            No se encontraron comprobantes
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Prueba ajustando los filtros de búsqueda o el tipo de factura.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredInvoices.map((inv) => (
            <Card
              key={inv.id}
              className="border-border/70 hover:border-border transition-all overflow-hidden"
            >
              <CardContent className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black text-sm shrink-0">
                    {inv.type}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-foreground text-sm">
                        Factura {inv.type} Nº {inv.invoiceNumber}
                      </span>
                      <Badge variant="outline" className="text-[10px] font-bold text-emerald-600 border-emerald-500/30">
                        {inv.status === "paid" ? "Pagada" : "Emitida"}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Pedido: <span className="font-mono font-semibold text-foreground">{inv.orderId}</span> • Emitida el {inv.date}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Receptor: <span className="text-foreground">{inv.businessName}</span> (CUIT: {inv.taxId})
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between md:justify-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-border/50">
                  <div className="text-left md:text-right">
                    <p className="text-[10px] text-muted-foreground uppercase font-semibold">
                      Neto: {formatPrice(inv.netAmount)} + IVA (21%): {formatPrice(inv.vatAmount)}
                    </p>
                    <p className="text-base font-black text-foreground">
                      {formatPrice(inv.totalAmount)}
                    </p>
                  </div>

                  <Button
                    size="sm"
                    onClick={() => handleDownloadPdf(inv.invoiceNumber)}
                    className="rounded-xl text-xs font-bold gap-1.5 h-9 shrink-0"
                  >
                    <Download className="size-3.5" /> Descargar PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AccountInvoicesPage;
