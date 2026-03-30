import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const tipos = await prisma.tipoEspacio.findMany({ orderBy: { nombre: "asc" } });
  return NextResponse.json(tipos);
}
