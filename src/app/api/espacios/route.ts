import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const idGrupo = searchParams.get("idGrupo");
  const idTipoEspacio = searchParams.get("idTipoEspacio");

  const includeInactive = searchParams.get("includeInactive") === "true";

  const espacios = await prisma.espacio.findMany({
    where: {
      ...(includeInactive ? {} : { activo: true }),
      ...(idGrupo ? { idGrupo: parseInt(idGrupo) } : {}),
      ...(idTipoEspacio ? { idTipoEspacio: parseInt(idTipoEspacio) } : {}),
    },
    include: { grupo: true, tipoEspacio: true },
    orderBy: { espacio: "asc" },
  });

  return NextResponse.json(espacios);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  if (session.user?.role !== "ADMIN") return NextResponse.json({ error: "Prohibido" }, { status: 403 });

  const { espacio, piso, idGrupo, idTipoEspacio } = await req.json();
  const nuevo = await prisma.espacio.create({ data: { espacio, piso: piso ?? null, idGrupo, idTipoEspacio } });
  return NextResponse.json(nuevo, { status: 201 });
}
