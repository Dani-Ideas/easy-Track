"use client";

import { useEffect, useState } from "react";
import { ClipboardCheck, Wrench, Droplets, Zap, Hammer, Flower2, Settings } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { FormSectionHeader } from "../FormSectionHeader";
import { StarRating } from "../StarRating";
import { Label } from "@/components/ui/label";
import type { UseFormReturn } from "react-hook-form";
import type { CategoriaEvaluacion, ReporteFormValues } from "@/lib/validations/reporte.schema";

interface Area {
  id: number;
  nombre: string;
}

interface EvaluacionSectionProps {
  form:      UseFormReturn<ReporteFormValues>;
  categoria: CategoriaEvaluacion | null;
}

const AREA_ICONS: Record<string, LucideIcon> = {
  limpieza:      Droplets,
  electricidad:  Zap,
  plomería:      Wrench,
  plomeria:      Wrench,
  carpintería:   Hammer,
  carpinteria:   Hammer,
  jardinería:    Flower2,
  jardineria:    Flower2,
  mantenimiento: Settings,
};

function areaIcon(nombre: string): LucideIcon {
  return AREA_ICONS[nombre.toLowerCase()] ?? Wrench;
}

export function EvaluacionSection({ form, categoria }: EvaluacionSectionProps) {
  const [areas, setAreas] = useState<Area[]>([]);

  useEffect(() => {
    fetch("/api/areas")
      .then((r) => r.json())
      .then((data: Area[]) =>
        setAreas(data.filter((a) => a.nombre.toLowerCase() !== "general"))
      );
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ev  = (form.watch("evaluacion") ?? {}) as Record<string, number>;
  const set = (key: string, val: number) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    form.setValue(`evaluacion.${key}` as any, val, { shouldValidate: true });

  if (!categoria) {
    return (
      <div className="space-y-4">
        <FormSectionHeader
          icon={ClipboardCheck}
          title="Criterios de Evaluación"
          description="Selecciona el tipo de ubicación para ver los criterios"
        />
        <p className="text-sm text-muted-foreground text-center py-4 border rounded-lg">
          Los criterios aparecerán cuando elijas el tipo de ubicación.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <FormSectionHeader
        icon={ClipboardCheck}
        title="Criterios de Evaluación"
        description="Califica del 1 al 5 cada área de responsabilidad"
      />
      <div className="grid gap-3 sm:grid-cols-2">
        {areas.map((area) => {
          const Icon = areaIcon(area.nombre);
          const key  = `area_${area.id}`;
          return (
            <div key={area.id} className="space-y-2 rounded-lg border p-4">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <Icon className="h-4 w-4 text-muted-foreground" />
                {area.nombre}
              </Label>
              <StarRating
                value={(ev[key] as number) ?? 0}
                onChange={(v) => set(key, v)}
              />
              <p className="text-xs text-muted-foreground">1 = deficiente · 5 = excelente</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
