import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const reporte = await prisma.reporte.findUnique({
    where: { id: parseInt(id) },
    include: {
      espacio: { include: { grupo: true, tipoEspacio: true } },
      creadoPor: { select: { name: true, email: true } },
    },
  });

  if (!reporte) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  return NextResponse.json(reporte);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const reporteId = parseInt(id);
  const body = await req.json();

  const dbUser = session.user?.email
    ? await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { role: true, area: { select: { id: true, nombre: true } } },
      })
    : null;
  const userRole = dbUser?.role ?? session.user?.role;
  const userAreaNombre = dbUser?.area?.nombre ?? null;

  // Capture before-state for audit log and permission checks
  const prev = await prisma.reporte.findUnique({
    where: { id: reporteId },
    select: {
      estado: true,
      areaResponsable: true,
      personalResponsableId: true,
      personalResponsable: { select: { nombre: true } },
    },
  });

  // Mirrors the permission logic in EstadoSidebar.tsx — enforced here since the
  // client-side checks can be bypassed by calling this endpoint directly.
  const isAdmin = userRole === "ADMIN";
  const isMatchingStaff =
    userRole === "STAFF" &&
    !!prev?.areaResponsable &&
    !!userAreaNombre &&
    prev.areaResponsable === userAreaNombre;
  const isAssignedPerson =
    !!body.usuarioReal &&
    !!prev?.personalResponsable?.nombre &&
    body.usuarioReal === prev.personalResponsable.nombre;

  const forbidden = NextResponse.json({ error: "Prohibido" }, { status: 403 });

  // PENDIENTE → EN_PROCESO (asignar área e iniciar atención): solo ADMIN
  if (body.estado === "EN_PROCESO" && !isAdmin) return forbidden;

  // EN_PROCESO → ATENDIDO: ADMIN, jefe del área asignada, o el responsable asignado
  if (body.estado === "ATENDIDO" && !(isAdmin || isMatchingStaff || isAssignedPerson)) {
    return forbidden;
  }

  // Cualquier otra transición de estado (ej. revertir) queda restringida a ADMIN
  if (
    body.estado !== undefined &&
    body.estado !== "EN_PROCESO" &&
    body.estado !== "ATENDIDO" &&
    !isAdmin
  ) {
    return forbidden;
  }

  // Asignar/cambiar área responsable: solo ADMIN
  if (body.areaResponsable !== undefined && !isAdmin) return forbidden;

  // Asignar/cambiar responsable fuera del flujo de inicio: ADMIN o jefe del área
  if (
    body.personalResponsableId !== undefined &&
    body.estado === undefined &&
    !(isAdmin || isMatchingStaff)
  ) {
    return forbidden;
  }

  const updateData: Record<string, unknown> = {};

  if (body.estado !== undefined) updateData.estado = body.estado;
  if (body.areaResponsable !== undefined) updateData.areaResponsable = body.areaResponsable;
  if (body.observaciones !== undefined) updateData.observaciones = body.observaciones;
  if (body.personalResponsableId !== undefined) updateData.personalResponsableId = body.personalResponsableId;

  if (body.estado === "EN_PROCESO" && !body.skipTimestamp) {
    updateData.fechaAtencion = new Date();
  }
  if (body.estado === "ATENDIDO") {
    updateData.fechaResolucion = new Date();
  }

  const reporte = await prisma.reporte.update({
    where: { id: reporteId },
    data: updateData,
    include: {
      espacio: { include: { grupo: true, tipoEspacio: true } },
      personalResponsable: { select: { nombre: true } },
    },
  });

  // Build audit entries for every significant change
  if (session.user?.email) {
    const ip         = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? null;
    const dispositivo = req.headers.get("user-agent") ?? null;
    const base = {
      usuarioLogin: session.user.email,
      usuarioReal:  body.usuarioReal ?? null,
      ip,
      dispositivo,
      reporteId,
      areaId: dbUser?.area?.id ?? null,
    };

    const logs: Parameters<typeof prisma.logAccion.create>[0]["data"][] = [];

    if (body.estado !== undefined && body.estado !== prev?.estado) {
      logs.push({
        ...base,
        accion: `Estado: ${prev?.estado ?? "?"} → ${body.estado}`,
        detalle: body.observaciones ?? null,
      });
    }

    if (body.areaResponsable !== undefined && body.areaResponsable !== prev?.areaResponsable) {
      logs.push({
        ...base,
        accion: prev?.areaResponsable
          ? `Área cambiada: ${prev.areaResponsable} → ${body.areaResponsable}`
          : `Área asignada: ${body.areaResponsable}`,
        detalle: null,
      });
    }

    if (
      body.personalResponsableId !== undefined &&
      body.personalResponsableId !== prev?.personalResponsableId
    ) {
      const newNombre = reporte.personalResponsable?.nombre ?? `#${body.personalResponsableId}`;
      logs.push({
        ...base,
        accion: prev?.personalResponsable?.nombre
          ? `Responsable cambiado: ${prev.personalResponsable.nombre} → ${newNombre}`
          : `Responsable asignado: ${newNombre}`,
        detalle: null,
      });
    }

    if (logs.length > 0) {
      await prisma.logAccion.createMany({ data: logs });
    }
  }

  return NextResponse.json(reporte);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.reporte.delete({ where: { id: parseInt(id) } });

  return NextResponse.json({ ok: true });
}
