"use client";

import { useEffect, useState, useCallback } from "react";
import { useUIStore } from "@/store/useUIStore";
import { ReportsTable } from "./ReportsTable";
import { TablePagination } from "./TablePagination";
import { Skeleton } from "@/components/ui/skeleton";

interface ReporteRow {
  id: number;
  fechaCreacion: Date;
  nombreSolicitante: string;
  tipoUbicacion: string;
  estado: string;
  espacio?: {
    espacio: string;
    grupo: { nombre: string };
  } | null;
}

export function DashboardClient() {
  const { filters } = useUIStore();
  const [reportes, setReportes] = useState<ReporteRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchReportes = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.estado) params.set("estado", filters.estado);
    if (filters.tipoUbicacion) params.set("tipoUbicacion", filters.tipoUbicacion);
    if (filters.fechaDesde) params.set("fechaDesde", filters.fechaDesde);
    if (filters.fechaHasta) params.set("fechaHasta", filters.fechaHasta);
    params.set("page", String(filters.page));
    params.set("pageSize", String(filters.pageSize));

    const res = await fetch(`/api/reportes?${params}`);
    if (res.ok) {
      const data = await res.json();
      setReportes(data.data);
      setTotal(data.total);
    }
    setLoading(false);
  }, [filters]);

  useEffect(() => {
    fetchReportes();
  }, [fetchReportes]);

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <ReportsTable reportes={reportes} />
      <TablePagination total={total} />
    </div>
  );
}
