import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PageBreadcrumb } from "@/components/layout/Breadcrumb";
import { ReporteHeader } from "@/components/detalle/ReporteHeader";
import { InfoGrid } from "@/components/detalle/InfoGrid";
import { EvaluacionChecklist } from "@/components/detalle/EvaluacionChecklist";
import { EstadoSidebar } from "@/components/detalle/EstadoSidebar";
import { BitacoraPanel } from "@/components/detalle/BitacoraPanel";

async function getReporte(id: number) {
  return prisma.reporte.findUnique({
    where: { id },
    include: {
      espacio: { include: { grupo: true, tipoEspacio: true } },
      creadoPor: { select: { name: true, email: true } },
      personalResponsable: { select: { id: true, nombre: true } },
      logAcciones: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          createdAt: true,
          usuarioLogin: true,
          usuarioReal: true,
          accion: true,
          detalle: true,
          ip: true,
          dispositivo: true,
        },
      },
    },
  });
}

export default async function ReporteDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const { id } = await params;
  const reporteId = parseInt(id);

  if (isNaN(reporteId)) notFound();

  const [reporte, areas, userArea] = await Promise.all([
    getReporte(reporteId),
    prisma.area.findMany({ orderBy: { nombre: "asc" }, select: { id: true, nombre: true } }),
    session?.user?.areaId
      ? prisma.area.findUnique({
          where: { id: session.user.areaId },
          select: { nombre: true },
        })
      : Promise.resolve(null),
  ]);

  if (!reporte) notFound();

  const evaluacion = reporte.evaluacion as Record<string, number> | null;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Breadcrumb + header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <PageBreadcrumb
          segments={[
            { label: "Panel Principal", href: "/dashboard" },
            { label: `Reporte #${String(reporte.id).padStart(5, "0")}` },
          ]}
        />
      </div>

      <ReporteHeader
        id={reporte.id}
        estado={reporte.estado}
        fechaCreacion={reporte.fechaCreacion}
        fechaAtencion={reporte.fechaAtencion}
        fechaResolucion={reporte.fechaResolucion}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        {/* Main content */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Información del Reporte</CardTitle>
            </CardHeader>
            <CardContent>
              <InfoGrid
                nombreSolicitante={reporte.nombreSolicitante}
                fechaInspeccion={reporte.fechaInspeccion}
                tipoUbicacion={reporte.tipoUbicacion}
                edificio={reporte.espacio?.grupo.nombre}
                espacio={reporte.espacio?.espacio}
              />
              {reporte.descripcion && (
                <>
                  <Separator className="my-4" />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                      Descripción
                    </p>
                    <p className="text-sm leading-relaxed">{reporte.descripcion}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Criterios de Evaluación</CardTitle>
            </CardHeader>
            <CardContent>
              <EvaluacionChecklist evaluacion={evaluacion} areas={areas} />
            </CardContent>
          </Card>

          {/* Audit log — admin only */}
          {session?.user?.role === "ADMIN" && (
            <BitacoraPanel logs={reporte.logAcciones} />
          )}
        </div>

        {/* Sidebar */}
        <EstadoSidebar
          reporteId={reporte.id}
          estado={reporte.estado}
          areaResponsable={reporte.areaResponsable}
          personalResponsableId={reporte.personalResponsableId}
          personalResponsableNombre={reporte.personalResponsable?.nombre ?? null}
          observaciones={reporte.observaciones}
          fechaAtencion={reporte.fechaAtencion}
          fechaResolucion={reporte.fechaResolucion}
          userRole={session?.user?.role}
          userAreaNombre={userArea?.nombre ?? null}
        />
      </div>
    </div>
  );
}
