import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const includeInactive = req.nextUrl.searchParams.get("includeInactive") === "true";

  const tipos = await prisma.tipoEspacio.findMany({
    where: includeInactive ? undefined : { activo: true },
    orderBy: { nombre: "asc" },
  });
  return NextResponse.json(tipos);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  if (session.user?.role !== "ADMIN") return NextResponse.json({ error: "Prohibido" }, { status: 403 });

  const { nombre, categoriaEvaluacion } = await req.json();
  const tipo = await prisma.tipoEspacio.create({ data: { nombre, categoriaEvaluacion } });
  return NextResponse.json(tipo, { status: 201 });
}
