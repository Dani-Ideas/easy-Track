import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { normalizarNombre } from "@/lib/normalizar";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const areaId  = searchParams.get("areaId");
  // disponibleParaRol=TECNICO → rol IS NULL OR (rol = TECNICO AND areaId = X)
  const disponibleParaRol = searchParams.get("disponibleParaRol");
  const disponibleParaAreaId = searchParams.get("areaIdRol"); // paired with disponibleParaRol

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let where: Record<string, any> = {};

  if (disponibleParaRol) {
    where = {
      OR: [
        { rol: null },
        {
          rol: disponibleParaRol,
          ...(disponibleParaAreaId ? { areaId: parseInt(disponibleParaAreaId) } : {}),
        },
      ],
    };
  } else if (areaId) {
    where = { areaId: parseInt(areaId) };
  }

  const personal = await prisma.personal.findMany({
    where,
    orderBy: { nombre: "asc" },
    include: { area: { select: { id: true, nombre: true } } },
  });
  return NextResponse.json(personal);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { nombre, areaId, rol } = await req.json();
  if (!nombre?.trim()) return NextResponse.json({ error: "Nombre requerido" }, { status: 400 });

  const nombreNorm = normalizarNombre(nombre);
  const existente  = await prisma.personal.findUnique({
    where: { nombreNorm },
    include: { area: { select: { id: true, nombre: true } } },
  });
  if (existente) return NextResponse.json(existente);

  const nuevo = await prisma.personal.create({
    data: {
      nombre:    nombre.trim(),
      nombreNorm,
      areaId:    areaId ? parseInt(areaId) : null,
      rol:       rol ?? null,
    },
    include: { area: { select: { id: true, nombre: true } } },
  });
  return NextResponse.json(nuevo, { status: 201 });
}
