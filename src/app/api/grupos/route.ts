import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const idTipoEspacio  = searchParams.get("idTipoEspacio");
  const includeInactive = searchParams.get("includeInactive") === "true";

  const grupos = await prisma.grupo.findMany({
    where: {
      ...(includeInactive ? {} : { activo: true }),
      ...(idTipoEspacio
        ? { espacios: { some: { idTipoEspacio: parseInt(idTipoEspacio) } } }
        : {}),
    },
    orderBy: { nombre: "asc" },
  });

  return NextResponse.json(grupos);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  if (session.user?.role !== "ADMIN") return NextResponse.json({ error: "Prohibido" }, { status: 403 });

  const { nombre } = await req.json();
  const grupo = await prisma.grupo.create({ data: { nombre } });
  return NextResponse.json(grupo, { status: 201 });
}
