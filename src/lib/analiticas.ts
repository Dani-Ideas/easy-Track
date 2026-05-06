import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export interface AnaliticasData {
  kpis: {
    total: number;
    pendientes: number;
    enProceso: number;
    atendidos: number;
    nuevosSemana: number;
    tiempoPromedioHoras: number | null;
  };
  tendencia: { fecha: string; total: number }[];
  porArea: {
    area: string;
    total: number;
    atendidos: number;
    tiempoPromedioHoras: number | null;
  }[];
  porEdificio: { edificio: string; total: number }[];
  porTipoEspacio: { tipo: string; total: number }[];
}

type RawTendencia = { fecha: Date; total: bigint };
type RawArea = {
  area: string;
  total: bigint;
  atendidos: bigint;
  tiempoPromedioHoras: number | null;
};
type RawEdificio = { edificio: string; total: bigint };
type RawTipo = { tipo: string; total: bigint };
type RawAvg = { promedio: number | null };

export async function fetchAnaliticasData(
  desde: Date,
  hasta: Date,
): Promise<AnaliticasData> {
  const semanaAtras = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [total, pendientes, enProceso, atendidos, nuevosSemana] =
    await Promise.all([
      prisma.reporte.count({ where: { isDraft: false, fechaCreacion: { gte: desde, lte: hasta } } }),
      prisma.reporte.count({ where: { isDraft: false, estado: "PENDIENTE", fechaCreacion: { gte: desde, lte: hasta } } }),
      prisma.reporte.count({ where: { isDraft: false, estado: "EN_PROCESO", fechaCreacion: { gte: desde, lte: hasta } } }),
      prisma.reporte.count({ where: { isDraft: false, estado: "ATENDIDO", fechaCreacion: { gte: desde, lte: hasta } } }),
      prisma.reporte.count({ where: { isDraft: false, fechaCreacion: { gte: semanaAtras } } }),
    ]);

  const [avgRows, tendenciaRows, areaRows, edificioRows, tipoRows] =
    await Promise.all([
      prisma.$queryRaw<RawAvg[]>(Prisma.sql`
        SELECT AVG(TIMESTAMPDIFF(HOUR, fechaCreacion, fechaResolucion)) AS promedio
        FROM Reporte
        WHERE isDraft = 0
          AND estado = 'ATENDIDO'
          AND fechaResolucion IS NOT NULL
          AND fechaCreacion BETWEEN ${desde} AND ${hasta}
      `),
      prisma.$queryRaw<RawTendencia[]>(Prisma.sql`
        SELECT DATE(fechaCreacion) AS fecha, COUNT(*) AS total
        FROM Reporte
        WHERE isDraft = 0
          AND fechaCreacion BETWEEN ${desde} AND ${hasta}
        GROUP BY DATE(fechaCreacion)
        ORDER BY fecha ASC
      `),
      prisma.$queryRaw<RawArea[]>(Prisma.sql`
        SELECT
          areaResponsable AS area,
          COUNT(*) AS total,
          SUM(CASE WHEN estado = 'ATENDIDO' THEN 1 ELSE 0 END) AS atendidos,
          AVG(CASE WHEN estado = 'ATENDIDO' AND fechaResolucion IS NOT NULL
              THEN TIMESTAMPDIFF(HOUR, fechaCreacion, fechaResolucion)
              END) AS tiempoPromedioHoras
        FROM Reporte
        WHERE isDraft = 0
          AND areaResponsable IS NOT NULL
          AND fechaCreacion BETWEEN ${desde} AND ${hasta}
        GROUP BY areaResponsable
        ORDER BY total DESC
      `),
      prisma.$queryRaw<RawEdificio[]>(Prisma.sql`
        SELECT g.nombre AS edificio, COUNT(r.id) AS total
        FROM Reporte r
        JOIN Espacio e ON r.idEspacio = e.id
        JOIN Grupo g ON e.idGrupo = g.id
        WHERE r.isDraft = 0
          AND r.fechaCreacion BETWEEN ${desde} AND ${hasta}
        GROUP BY g.nombre
        ORDER BY total DESC
        LIMIT 10
      `),
      prisma.$queryRaw<RawTipo[]>(Prisma.sql`
        SELECT te.nombre AS tipo, COUNT(r.id) AS total
        FROM Reporte r
        JOIN Espacio e ON r.idEspacio = e.id
        JOIN TipoEspacio te ON e.idTipoEspacio = te.id
        WHERE r.isDraft = 0
          AND r.fechaCreacion BETWEEN ${desde} AND ${hasta}
        GROUP BY te.nombre
        ORDER BY total DESC
      `),
    ]);

  return {
    kpis: {
      total,
      pendientes,
      enProceso,
      atendidos,
      nuevosSemana,
      tiempoPromedioHoras:
        avgRows[0]?.promedio != null ? Math.round(avgRows[0].promedio) : null,
    },
    tendencia: tendenciaRows.map((r) => ({
      fecha: new Date(r.fecha).toISOString().slice(0, 10),
      total: Number(r.total),
    })),
    porArea: areaRows.map((r) => ({
      area: r.area,
      total: Number(r.total),
      atendidos: Number(r.atendidos),
      tiempoPromedioHoras:
        r.tiempoPromedioHoras != null ? Math.round(Number(r.tiempoPromedioHoras)) : null,
    })),
    porEdificio: edificioRows.map((r) => ({
      edificio: r.edificio,
      total: Number(r.total),
    })),
    porTipoEspacio: tipoRows.map((r) => ({
      tipo: r.tipo,
      total: Number(r.total),
    })),
  };
}

export function presetRange(preset: "7d" | "30d" | "90d" | "all"): { desde: Date; hasta: Date } {
  const hasta = new Date();
  hasta.setHours(23, 59, 59, 999);
  const desde = new Date();
  if (preset === "7d")  { desde.setDate(desde.getDate() - 6); }
  else if (preset === "30d") { desde.setDate(desde.getDate() - 29); }
  else if (preset === "90d") { desde.setDate(desde.getDate() - 89); }
  else { desde.setFullYear(2000, 0, 1); } // "all"
  desde.setHours(0, 0, 0, 0);
  return { desde, hasta };
}
