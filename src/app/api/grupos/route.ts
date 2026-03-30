import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const grupos = await prisma.grupo.findMany({ orderBy: { nombre: "asc" } });
  return NextResponse.json(grupos);
}
