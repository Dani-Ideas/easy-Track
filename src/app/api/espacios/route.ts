import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const idGrupo = searchParams.get("idGrupo");
  const idTipoEspacio = searchParams.get("idTipoEspacio");

  const espacios = await prisma.espacio.findMany({
    where: {
      ...(idGrupo ? { idGrupo: parseInt(idGrupo) } : {}),
      ...(idTipoEspacio ? { idTipoEspacio: parseInt(idTipoEspacio) } : {}),
    },
    include: { grupo: true, tipoEspacio: true },
    orderBy: { espacio: "asc" },
  });

  return NextResponse.json(espacios);
}
