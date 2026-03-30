import type { LucideIcon } from "lucide-react";
import { FileX } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title?: string;
  description?: string;
}

export function EmptyState({
  icon: Icon = FileX,
  title = "Sin resultados",
  description = "No se encontraron registros con los filtros actuales.",
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Icon className="h-12 w-12 text-muted-foreground/40 mb-4" />
      <p className="font-medium text-muted-foreground">{title}</p>
      <p className="text-sm text-muted-foreground/70 mt-1">{description}</p>
    </div>
  );
}
