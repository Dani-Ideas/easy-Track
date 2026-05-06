import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

const USER_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
  area: { select: { id: true, nombre: true } },
} as const;

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  if (session.user?.role !== "ADMIN") return NextResponse.json({ error: "Prohibido" }, { status: 403 });

  const users = await prisma.user.findMany({
    select: USER_SELECT,
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  if (session.user?.role !== "ADMIN") return NextResponse.json({ error: "Prohibido" }, { status: 403 });

  const { name, email, password, role, areaId } = await req.json();
  if (!name || !email || !password) {
    return NextResponse.json({ error: "name, email y password son requeridos" }, { status: 400 });
  }

  const existe = await prisma.user.findUnique({ where: { email } });
  if (existe) return NextResponse.json({ error: "El email ya está registrado" }, { status: 409 });

  // ADMIN always gets "General" area; others default to "General" if no area provided
  const generalArea = await prisma.area.findUnique({ where: { nombre: "General" } });
  const resolvedAreaId = role === "ADMIN"
    ? generalArea?.id
    : (areaId ? parseInt(areaId) : generalArea?.id);

  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, password: hashed, role: role ?? "STAFF", areaId: resolvedAreaId ?? null },
    select: USER_SELECT,
  });
  return NextResponse.json(user, { status: 201 });
}
