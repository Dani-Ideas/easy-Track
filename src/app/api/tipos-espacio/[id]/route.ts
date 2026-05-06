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
  if (body.nombre            !== undefined) data.nombre            = body.nombre;
  if (body.categoriaEvaluacion !== undefined) data.categoriaEvaluacion = body.categoriaEvaluacion;
  if (body.activo            !== undefined) data.activo            = body.activo;

  const tipo = await prisma.tipoEspacio.update({ where: { id }, data });

  if (body.activo !== undefined) {
    await prisma.espacio.updateMany({ where: { idTipoEspacio: id }, data: { activo: body.activo } });
    // Cascade to grupos that only serve this tipo
    const gruposIds = await prisma.espacio
      .findMany({ where: { idTipoEspacio: id }, select: { idGrupo: true }, distinct: ["idGrupo"] })
      .then((rows) => rows.map((r) => r.idGrupo));
    if (gruposIds.length) {
      await prisma.grupo.updateMany({ where: { id: { in: gruposIds } }, data: { activo: body.activo } });
    }
  }

  return NextResponse.json(tipo);
}
