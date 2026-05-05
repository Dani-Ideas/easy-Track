"use client";

import { useUIStore } from "@/store/useUIStore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RotateCcw } from "lucide-react";

const tiposUbicacion = ["Aulas", "Baños", "Laboratorios", "Áreas Comunes", "Oficinas"];

export function ReportsFilters() {
  const { filters, setFilter, resetFilters } = useUIStore();

  const hasActiveFilters =
    filters.estado || filters.tipoUbicacion || filters.fechaDesde || filters.fechaHasta;

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="space-y-1">
        <Label className="text-xs">Tipo de ubicación</Label>
        <Select
          value={filters.tipoUbicacion || "all"}
          onValueChange={(v) => setFilter("tipoUbicacion", v === "all" ? "" : v)}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Todas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {tiposUbicacion.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Estado</Label>
        <Select
          value={filters.estado || "all"}
          onValueChange={(v) => setFilter("estado", v === "all" ? "" : v)}
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="PENDIENTE">Pendiente</SelectItem>
            <SelectItem value="EN_PROCESO">En Proceso</SelectItem>
            <SelectItem value="ATENDIDO">Atendido</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Desde</Label>
        <Input
          type="date"
          className="w-36"
          value={filters.fechaDesde}
          onChange={(e) => setFilter("fechaDesde", e.target.value)}
        />
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Hasta</Label>
        <Input
          type="date"
          className="w-36"
          value={filters.fechaHasta}
          onChange={(e) => setFilter("fechaHasta", e.target.value)}
        />
      </div>

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={resetFilters} className="gap-2">
          <RotateCcw className="h-3.5 w-3.5" />
          Limpiar
        </Button>
      )}
    </div>
  );
}
