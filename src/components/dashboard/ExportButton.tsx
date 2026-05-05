"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportReportesToExcel } from "@/lib/utils/exportToExcel";
import { useUIStore } from "@/store/useUIStore";

export function ExportButton() {
  const [loading, setLoading] = useState(false);
  const { filters } = useUIStore();

  async function handleExport() {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.estado) params.set("estado", filters.estado);
    if (filters.tipoUbicacion) params.set("tipoUbicacion", filters.tipoUbicacion);
    if (filters.fechaDesde) params.set("fechaDesde", filters.fechaDesde);
    if (filters.fechaHasta) params.set("fechaHasta", filters.fechaHasta);
    params.set("pageSize", "1000");

    const res = await fetch(`/api/reportes?${params}`);
    if (res.ok) {
      const { data } = await res.json();
      exportReportesToExcel(
        data.map((r: { id: number; fechaCreacion: string; fechaInspeccion: string; nombreSolicitante: string; tipoUbicacion: string; espacio: { espacio: string } | null; estado: string; areaResponsable?: string | null; fechaResolucion?: string | null }) => ({
          ...r,
          fechaCreacion: new Date(r.fechaCreacion),
          fechaInspeccion: new Date(r.fechaInspeccion),
          espacio: r.espacio?.espacio,
        }))
      );
    }
    setLoading(false);
  }

  return (
    <Button variant="outline" size="sm" onClick={handleExport} disabled={loading} className="gap-2">
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      Exportar
    </Button>
  );
}
