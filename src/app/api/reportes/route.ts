import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { normalizarNombre } from "@/lib/normalizar";

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

  // Resolve user's area for visibility filtering
  const dbUser = session.user?.email
    ? await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { role: true, area: { select: { nombre: true } } },
      })
    : null;
  const userRole = dbUser?.role ?? session.user?.role;
  const areaNombre = dbUser?.area?.nombre;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: Record<string, any> = {
    isDraft: false,
    ...(estado && { estado }),
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

  // Area-based visibility: non-admins only see reports for their area
  if (userRole !== "ADMIN") {
    if (areaNombre && areaNombre !== "General") {
      where.areaResponsable = areaNombre;
    } else {
      // "General" area sees only unassigned PENDIENTE reports
      where.estado = "PENDIENTE";
      where.areaResponsable = null;
    }
  }

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

  const dbUser = session.user?.email
    ? await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } })
    : null;

  const reporte = await prisma.reporte.create({
    data: {
      nombreSolicitante: body.nombreSolicitante,
      fechaInspeccion: new Date(body.fechaInspeccion),
      tipoUbicacion: body.tipoUbicacion,
      idEspacio: body.idEspacio,
      descripcion: body.descripcion,
      evaluacion: body.evaluacion,
      isDraft: body.isDraft ?? false,
      creadoPorId: dbUser?.id ?? null,
    },
  });

  // Auto-registrar solicitante en lista de personal si es nuevo
  if (body.nombreSolicitante?.trim() && !body.isDraft) {
    const nombreNorm = normalizarNombre(body.nombreSolicitante);
    await prisma.personal.upsert({
      where:  { nombreNorm },
      update: {},
      create: { nombre: body.nombreSolicitante.trim(), nombreNorm },
    });
  }

  return NextResponse.json(reporte, { status: 201 });
}
