import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const [total, pendientes, enProceso, atendidos, atendidosRecientes] =
    await Promise.all([
      prisma.reporte.count({ where: { isDraft: false } }),
      prisma.reporte.count({ where: { estado: "PENDIENTE", isDraft: false } }),
      prisma.reporte.count({ where: { estado: "EN_PROCESO", isDraft: false } }),
      prisma.reporte.count({ where: { estado: "ATENDIDO", isDraft: false } }),
      prisma.reporte.count({
        where: {
          estado: "ATENDIDO",
          isDraft: false,
          fechaResolucion: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

  return NextResponse.json({
    total,
    pendientes,
    enProceso,
    atendidos,
    atendidosRecientes,
  });
}
