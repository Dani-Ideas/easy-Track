"use client";

import { useEffect, useRef, useState } from "react";
import {
  ClipboardCheck, ChevronLeft, ChevronRight,
  Wrench, Droplets, Zap, Hammer, Flower2, Settings,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { FormSectionHeader } from "../FormSectionHeader";
import { StarRating } from "../StarRating";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { UseFormReturn } from "react-hook-form";
import type { CategoriaEvaluacion, ReporteFormValues } from "@/lib/validations/reporte.schema";

interface Area { id: number; nombre: string; }

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

interface EvaluacionSectionProps {
  form:      UseFormReturn<ReporteFormValues>;
  categoria: CategoriaEvaluacion | null;
}

export function EvaluacionSection({ form, categoria }: EvaluacionSectionProps) {
  const [areas, setAreas]       = useState<Area[]>([]);
  const [current, setCurrent]   = useState(0);
  const [slideDir, setSlideDir] = useState<"left" | "right">("left");
  const touchStartX              = useRef<number | null>(null);
  const advanceTimer             = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch("/api/areas")
      .then((r) => r.json())
      .then((data: Area[]) =>
        setAreas(data.filter((a) => a.nombre.toLowerCase() !== "general"))
      );
  }, []);

  useEffect(() => { setCurrent(0); }, [categoria]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ev  = (form.watch("evaluacion") ?? {}) as Record<string, number>;
  const set = (key: string, val: number) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    form.setValue(`evaluacion.${key}` as any, val, { shouldValidate: true });

  function keyFor(area: Area)    { return `area_${area.id}`; }
  function ratingFor(area: Area) { return (ev[keyFor(area)] as number) ?? 0; }

  function goNext() {
    if (current < areas.length - 1) {
      setSlideDir("left");
      setCurrent((c) => c + 1);
    }
  }
  function goPrev() {
    if (current > 0) {
      setSlideDir("right");
      setCurrent((c) => c - 1);
    }
  }

  function handleStarChange(area: Area, val: number) {
    set(keyFor(area), val);
    if (current < areas.length - 1) {
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
      advanceTimer.current = setTimeout(() => {
        setSlideDir("left");
        setCurrent((c) => c + 1);
        advanceTimer.current = null;
      }, 380);
    }
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }
  function handleTouchEnd(e: React.TouchEvent, area: Area) {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) < 50) return;
    if (dx > 0) {
      goPrev();
    } else {
      if (ratingFor(area) > 0) goNext();
    }
  }

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

  if (areas.length === 0) {
    return (
      <div className="space-y-4">
        <FormSectionHeader
          icon={ClipboardCheck}
          title="Criterios de Evaluación"
          description="Califica del 1 al 5 cada área de responsabilidad"
        />
        <p className="p-4 text-sm text-muted-foreground text-center border rounded-lg">
          Cargando...
        </p>
      </div>
    );
  }

  const area      = areas[current];
  const Icon      = areaIcon(area.nombre);
  const rating    = ratingFor(area);
  const canGoNext = current < areas.length - 1 && rating > 0;
  const canGoPrev = current > 0;

  return (
    <div className="space-y-4">
      <FormSectionHeader
        icon={ClipboardCheck}
        title="Criterios de Evaluación"
        description="Califica del 1 al 5 cada área de responsabilidad"
      />

      {/* Progress dots */}
      <div className="flex justify-center gap-1.5">
        {areas.map((a, i) => {
          const r = (ev[keyFor(a)] as number) ?? 0;
          return (
            <div
              key={a.id}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                i === current  ? "w-6 bg-primary"      :
                r > 0          ? "w-2 bg-primary/40"   :
                                 "w-2 bg-muted"
              )}
            />
          );
        })}
      </div>

      {/* Card */}
      <div className="overflow-hidden rounded-lg">
        <div
          key={current}
          className={cn(
            "border rounded-lg p-6 space-y-4",
            slideDir === "left"
              ? "animate-in slide-in-from-right duration-200"
              : "animate-in slide-in-from-left duration-200"
          )}
          onTouchStart={handleTouchStart}
          onTouchEnd={(e) => handleTouchEnd(e, area)}
        >
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Icon className="h-4 w-4 text-muted-foreground" />
              {area.nombre}
            </Label>
            <span className="text-xs text-muted-foreground">
              {current + 1} / {areas.length}
            </span>
          </div>

          <div className="flex flex-col items-center gap-2 py-2">
            <StarRating value={rating} onChange={(v) => handleStarChange(area, v)} />
            <p className="text-xs text-muted-foreground">1 = deficiente · 5 = excelente</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          type="button"
          onClick={goPrev}
          disabled={!canGoPrev}
          className={cn(
            "flex items-center gap-1 text-sm px-3 py-1.5 rounded-md transition-colors",
            canGoPrev
              ? "text-foreground hover:bg-accent"
              : "text-muted-foreground/30 cursor-default"
          )}
        >
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </button>

        <button
          type="button"
          onClick={goNext}
          disabled={!canGoNext}
          className={cn(
            "flex items-center gap-1 text-sm px-3 py-1.5 rounded-md transition-colors",
            canGoNext
              ? "text-foreground hover:bg-accent"
              : "text-muted-foreground/30 cursor-default"
          )}
        >
          Siguiente
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
