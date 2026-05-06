import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDateTime } from "@/lib/utils/formatDate";

interface ReporteHeaderProps {
  id: number;
  estado: string;
  fechaCreacion: Date;
  fechaAtencion?: Date | null;
  fechaResolucion?: Date | null;
}

export function ReporteHeader({
  id,
  estado,
  fechaCreacion,
  fechaAtencion,
  fechaResolucion,
}: ReporteHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">
            Reporte #{String(id).padStart(5, "0")}
          </h1>
          <StatusBadge estado={estado} className="text-sm" />
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-muted-foreground">
          <span>Creado: {formatDateTime(fechaCreacion)}</span>
          {fechaAtencion && (
            <span>Atendido: {formatDateTime(fechaAtencion)}</span>
          )}
          {fechaResolucion && (
            <span>Resuelto: {formatDateTime(fechaResolucion)}</span>
          )}
        </div>
      </div>
    </div>
  );
}
