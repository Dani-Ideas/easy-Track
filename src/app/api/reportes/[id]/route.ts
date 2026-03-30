import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const reporte = await prisma.reporte.findUnique({
    where: { id: parseInt(id) },
    include: {
      espacio: { include: { grupo: true, tipoEspacio: true } },
      creadoPor: { select: { name: true, email: true } },
    },
  });

  if (!reporte) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  return NextResponse.json(reporte);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const updateData: Record<string, unknown> = {};

  if (body.estado !== undefined) updateData.estado = body.estado;
  if (body.areaResponsable !== undefined) updateData.areaResponsable = body.areaResponsable;
  if (body.observaciones !== undefined) updateData.observaciones = body.observaciones;

  if (body.estado === "EN_PROCESO" && !body.skipTimestamp) {
    updateData.fechaAtencion = new Date();
  }
  if (body.estado === "ATENDIDO") {
    updateData.fechaResolucion = new Date();
  }

  const reporte = await prisma.reporte.update({
    where: { id: parseInt(id) },
    data: updateData,
    include: {
      espacio: { include: { grupo: true, tipoEspacio: true } },
    },
  });

  return NextResponse.json(reporte);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.reporte.delete({ where: { id: parseInt(id) } });

  return NextResponse.json({ ok: true });
}
