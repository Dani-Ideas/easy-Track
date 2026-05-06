import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const areas = await prisma.area.findMany({
    orderBy: { nombre: "asc" },
  });
  return NextResponse.json(areas);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  if (session.user?.role !== "ADMIN") return NextResponse.json({ error: "Prohibido" }, { status: 403 });

  const { nombre } = await req.json();
  if (!nombre?.trim()) return NextResponse.json({ error: "nombre requerido" }, { status: 400 });

  const existe = await prisma.area.findUnique({ where: { nombre: nombre.trim() } });
  if (existe) return NextResponse.json({ error: "El área ya existe" }, { status: 409 });

  const area = await prisma.area.create({ data: { nombre: nombre.trim() } });
  return NextResponse.json(area, { status: 201 });
}
