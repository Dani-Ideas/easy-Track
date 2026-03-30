import Link from "next/link";
import { Eye } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/utils/formatDate";

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

interface ReportsTableProps {
  reportes: ReporteRow[];
}

export function ReportsTable({ reportes }: ReportsTableProps) {
  if (reportes.length === 0) {
    return <EmptyState />;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Fecha</TableHead>
          <TableHead>Solicitante</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Edificio / Espacio</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead className="w-16" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {reportes.map((r) => (
          <TableRow key={r.id}>
            <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
              {formatDate(r.fechaCreacion)}
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <UserAvatar name={r.nombreSolicitante} size="sm" />
                <span className="text-sm font-medium">{r.nombreSolicitante}</span>
              </div>
            </TableCell>
            <TableCell>
              <span className="text-sm">{r.tipoUbicacion}</span>
            </TableCell>
            <TableCell>
              <div className="text-sm">
                <span className="font-medium">{r.espacio?.grupo.nombre}</span>
                {r.espacio?.espacio && (
                  <span className="text-muted-foreground"> / {r.espacio.espacio}</span>
                )}
              </div>
            </TableCell>
            <TableCell>
              <StatusBadge estado={r.estado} />
            </TableCell>
            <TableCell>
              <Button variant="ghost" size="icon" asChild>
                <Link href={`/reportes/${r.id}`}>
                  <Eye className="h-4 w-4" />
                </Link>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
