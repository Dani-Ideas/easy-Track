import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id: idStr } = await params;
  const id = parseInt(idStr);
  const body = await req.json();

  if ("activo" in body && session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Solo administradores pueden desactivar ubicaciones" }, { status: 403 });
  }

  const data: Record<string, unknown> = {};
  if (body.nombre !== undefined) data.nombre = body.nombre;
  if (body.activo !== undefined) data.activo = body.activo;

  const grupo = await prisma.grupo.update({ where: { id }, data });

  if (body.activo !== undefined) {
    await prisma.espacio.updateMany({ where: { idGrupo: id }, data: { activo: body.activo } });
  }

  return NextResponse.json(grupo);
}
