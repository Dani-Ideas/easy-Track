import { Star, AlertCircle, Wrench, Droplets, Zap, Hammer, Flower2, Settings } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Area { id: number; nombre: string; }

interface EvaluacionChecklistProps {
  evaluacion: Record<string, number> | null;
  areas: Area[];
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

function ratingLabel(value: number): { text: string; className: string } {
  if (value >= 4) return { text: "Bueno",      className: "text-emerald-600 dark:text-emerald-400" };
  if (value >= 3) return { text: "Regular",     className: "text-amber-600 dark:text-amber-400"    };
  return            { text: "Deficiente",  className: "text-destructive"                       };
}

export function EvaluacionChecklist({ evaluacion, areas }: EvaluacionChecklistProps) {
  const rated = areas.filter((a) => {
    const v = evaluacion?.[`area_${a.id}`];
    return typeof v === "number" && v > 0;
  });

  if (!evaluacion || rated.length === 0) {
    return (
      <div className="flex items-center gap-2 py-4 text-muted-foreground">
        <AlertCircle className="h-4 w-4" />
        <span className="text-sm">Sin evaluación registrada</span>
      </div>
    );
  }

  return (
    <div>
      {rated.map((area) => {
        const rating          = evaluacion[`area_${area.id}`] as number;
        const Icon            = areaIcon(area.nombre);
        const { text, className } = ratingLabel(rating);
        return (
          <div
            key={area.id}
            className="flex items-center justify-between py-2.5 border-b last:border-0"
          >
            <div className="flex items-center gap-2">
              <Icon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{area.nombre}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={cn(
                      "h-3.5 w-3.5",
                      s <= rating
                        ? "fill-amber-400 text-amber-400"
                        : "text-muted-foreground/20"
                    )}
                  />
                ))}
              </div>
              <span className={cn("text-xs font-medium w-16 text-right", className)}>
                {text}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
