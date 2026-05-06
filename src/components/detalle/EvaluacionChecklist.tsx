import { Star, Lightbulb, Wrench, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Evaluacion {
  limpieza: number;
  seguridad: number;
  iluminacion: boolean;
  equipo: boolean;
}

interface EvaluacionChecklistProps {
  evaluacion: Evaluacion | null;
}

function ratingToLabel(value: number): "Bueno" | "Regular" | "Deficiente" {
  if (value >= 4) return "Bueno";
  if (value >= 2) return "Regular";
  return "Deficiente";
}

function RatingItem({
  icon: Icon,
  label,
  rating,
}: {
  icon: LucideIcon;
  label: string;
  rating: number;
}) {
  const status = ratingToLabel(rating);
  return (
    <div className="flex items-center justify-between py-2.5 border-b last:border-0">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star
              key={s}
              className={cn(
                "h-3.5 w-3.5",
                s <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/20"
              )}
            />
          ))}
        </div>
        <span
          className={cn(
            "text-xs font-medium",
            status === "Bueno"
              ? "text-emerald-600 dark:text-emerald-400"
              : status === "Regular"
              ? "text-amber-600 dark:text-amber-400"
              : "text-destructive"
          )}
        >
          {status}
        </span>
      </div>
    </div>
  );
}

function BoolItem({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b last:border-0">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm">{label}</span>
      </div>
      <div className="flex items-center gap-1.5">
        {value ? (
          <>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
              Funcional
            </span>
          </>
        ) : (
          <>
            <XCircle className="h-4 w-4 text-destructive" />
            <span className="text-xs font-medium text-destructive">
              No funcional
            </span>
          </>
        )}
      </div>
    </div>
  );
}

export function EvaluacionChecklist({ evaluacion }: EvaluacionChecklistProps) {
  if (!evaluacion) {
    return (
      <div className="flex items-center gap-2 py-4 text-muted-foreground">
        <AlertCircle className="h-4 w-4" />
        <span className="text-sm">Sin evaluación registrada</span>
      </div>
    );
  }

  return (
    <div>
      <RatingItem icon={Star} label="Limpieza" rating={evaluacion.limpieza} />
      <RatingItem icon={Star} label="Seguridad y cumplimiento" rating={evaluacion.seguridad} />
      <BoolItem icon={Lightbulb} label="Iluminación funcional" value={evaluacion.iluminacion} />
      <BoolItem icon={Wrench} label="Equipo operativo" value={evaluacion.equipo} />
    </div>
  );
}
