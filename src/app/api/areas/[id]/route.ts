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
  const { nombre, activo } = await req.json();

  const area = await prisma.area.findUnique({ where: { id: parseInt(id) } });
  if (!area) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  // Protect "General" from being renamed or deactivated
  if (area.nombre === "General") {
    return NextResponse.json({ error: "El área General no puede modificarse" }, { status: 400 });
  }

  const updated = await prisma.area.update({
    where: { id: parseInt(id) },
    data: {
      ...(nombre !== undefined && { nombre: nombre.trim() }),
      ...(activo !== undefined && { activo }),
    },
  });
  return NextResponse.json(updated);
}
