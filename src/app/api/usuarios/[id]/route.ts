import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  if (session.user?.role !== "ADMIN") return NextResponse.json({ error: "Prohibido" }, { status: 403 });

  const { id } = await params;
  const { role, areaId } = await req.json();

  const target = await prisma.user.findUnique({ where: { id }, select: { role: true } });
  if (!target) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });

  const newRole = role ?? target.role;

  // ADMIN accounts always keep "General" area — ignore any areaId sent
  let resolvedAreaId: number | null | undefined = undefined;
  if (newRole === "ADMIN") {
    const generalArea = await prisma.area.findUnique({ where: { nombre: "General" } });
    resolvedAreaId = generalArea?.id ?? null;
  } else if (areaId !== undefined) {
    resolvedAreaId = areaId ? parseInt(areaId) : null;
  }

  const user = await prisma.user.update({
    where: { id },
    data: {
      ...(role !== undefined && { role }),
      ...(resolvedAreaId !== undefined && { areaId: resolvedAreaId }),
    },
    select: { id: true, name: true, email: true, role: true, area: { select: { id: true, nombre: true } } },
  });
  return NextResponse.json(user);
}
