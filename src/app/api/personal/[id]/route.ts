import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const { areaId, rol } = await req.json();

  const updated = await prisma.personal.update({
    where: { id: parseInt(id) },
    data: {
      ...(areaId !== undefined && { areaId: areaId ? parseInt(areaId) : null }),
      ...(rol !== undefined && { rol: rol ?? null }),
    },
    include: { area: { select: { id: true, nombre: true } } },
  });
  return NextResponse.json(updated);
}
