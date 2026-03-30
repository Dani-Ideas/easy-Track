import { cn } from "@/lib/utils";
import {
  estadoLabels,
  estadoColors,
  type EstadoReporte,
} from "@/lib/utils/statusUtils";

interface StatusBadgeProps {
  estado: string;
  className?: string;
}

export function StatusBadge({ estado, className }: StatusBadgeProps) {
  const label = estadoLabels[estado as EstadoReporte] ?? estado;
  const colorClass = estadoColors[estado as EstadoReporte] ?? "";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        colorClass,
        className
      )}
    >
      {label}
    </span>
  );
}
