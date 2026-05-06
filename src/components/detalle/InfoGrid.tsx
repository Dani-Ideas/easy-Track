import { UserAvatar } from "@/components/ui/UserAvatar";
import { formatDate } from "@/lib/utils/formatDate";

interface InfoGridProps {
  nombreSolicitante: string;
  fechaInspeccion: Date;
  tipoUbicacion: string;
  edificio?: string;
  espacio?: string;
}

export function InfoGrid({
  nombreSolicitante,
  fechaInspeccion,
  tipoUbicacion,
  edificio,
  espacio,
}: InfoGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <InfoItem label="Solicitante">
        <div className="flex items-center gap-2">
          <UserAvatar name={nombreSolicitante} size="sm" />
          <span className="font-medium text-sm">{nombreSolicitante}</span>
        </div>
      </InfoItem>
      <InfoItem label="Fecha de inspección">
        <span className="text-sm">{formatDate(fechaInspeccion)}</span>
      </InfoItem>
      <InfoItem label="Tipo de ubicación">
        <span className="text-sm">{tipoUbicacion}</span>
      </InfoItem>
      <InfoItem label="Edificio / Espacio">
        <span className="text-sm">
          {edificio}
          {espacio && (
            <span className="text-muted-foreground"> / {espacio}</span>
          )}
        </span>
      </InfoItem>
    </div>
  );
}

function InfoItem({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        {label}
      </p>
      {children}
    </div>
  );
}
