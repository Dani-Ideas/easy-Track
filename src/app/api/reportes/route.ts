import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const estado = searchParams.get("estado") || undefined;
  const tipoUbicacion = searchParams.get("tipoUbicacion") || undefined;
  const fechaDesde = searchParams.get("fechaDesde") || undefined;
  const fechaHasta = searchParams.get("fechaHasta") || undefined;
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const pageSize = Math.min(50, parseInt(searchParams.get("pageSize") ?? "10"));

  const where = {
    isDraft: false,
    ...(estado && { estado: estado as "PENDIENTE" | "EN_PROCESO" | "ATENDIDO" }),
    ...(tipoUbicacion && { tipoUbicacion }),
    ...(fechaDesde || fechaHasta
      ? {
          fechaCreacion: {
            ...(fechaDesde && { gte: new Date(fechaDesde) }),
            ...(fechaHasta && { lte: new Date(fechaHasta + "T23:59:59") }),
          },
        }
      : {}),
  };

  const [data, total] = await Promise.all([
    prisma.reporte.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { fechaCreacion: "desc" },
      include: {
        espacio: { include: { grupo: true, tipoEspacio: true } },
      },
    }),
    prisma.reporte.count({ where }),
  ]);

  return NextResponse.json({ data, total, page, pageSize });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();

  const reporte = await prisma.reporte.create({
    data: {
      nombreSolicitante: body.nombreSolicitante,
      fechaInspeccion: new Date(body.fechaInspeccion),
      tipoUbicacion: body.tipoUbicacion,
      idEspacio: body.idEspacio,
      descripcion: body.descripcion,
      evaluacion: body.evaluacion,
      urlImagenes: body.urlImagenes ?? [],
      isDraft: body.isDraft ?? false,
      creadoPorId: session.user?.id,
    },
  });

  return NextResponse.json(reporte, { status: 201 });
}
