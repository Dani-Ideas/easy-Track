import * as XLSX from "xlsx";
import { formatDate } from "./formatDate";
import { estadoLabels } from "./statusUtils";
import type { EstadoReporte } from "./statusUtils";

interface ReporteExport {
  id: number;
  fechaCreacion: Date;
  fechaInspeccion: Date;
  nombreSolicitante: string;
  tipoUbicacion: string;
  espacio?: string;
  estado: string;
  areaResponsable?: string | null;
  fechaResolucion?: Date | null;
}

export function exportReportesToExcel(
  reportes: ReporteExport[],
  filename = "reportes_faciltrack"
) {
  const rows = reportes.map((r) => ({
    ID: r.id,
    "Fecha Creación": formatDate(r.fechaCreacion),
    "Fecha Inspección": formatDate(r.fechaInspeccion),
    Solicitante: r.nombreSolicitante,
    "Tipo Ubicación": r.tipoUbicacion,
    Espacio: r.espacio ?? "",
    Estado: estadoLabels[r.estado as EstadoReporte] ?? r.estado,
    "Área Responsable": r.areaResponsable ?? "",
    "Fecha Resolución": r.fechaResolucion ? formatDate(r.fechaResolucion) : "",
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Reportes");

  // Auto-width columns
  const colWidths = Object.keys(rows[0] ?? {}).map((key) => ({
    wch: Math.max(key.length, 15),
  }));
  ws["!cols"] = colWidths;

  XLSX.writeFile(wb, `${filename}.xlsx`);
}
