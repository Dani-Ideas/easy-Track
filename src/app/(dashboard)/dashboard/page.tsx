import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ClipboardList, Clock, CheckCircle2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { ReportsFilters } from "@/components/dashboard/ReportsFilters";
import { DashboardClient } from "@/components/dashboard/DashboardClient";
import { ExportButton } from "@/components/dashboard/ExportButton";

async function getStats() {
  const [total, pendientes, atendidosRecientes] = await Promise.all([
    prisma.reporte.count({ where: { isDraft: false } }),
    prisma.reporte.count({ where: { estado: "PENDIENTE", isDraft: false } }),
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
  return { total, pendientes, atendidosRecientes };
}

export default async function DashboardPage() {
  await auth();
  const stats = await getStats();

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Panel Principal</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Gestión de reportes de instalaciones
          </p>
        </div>
        <Button asChild className="gap-2 self-start sm:self-auto">
          <Link href="/reportes/nuevo">
            <Plus className="h-4 w-4" />
            Nuevo reporte
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatsCard
          title="Total de reportes"
          value={stats.total}
          icon={ClipboardList}
          iconColor="text-primary"
        />
        <StatsCard
          title="Pendientes de acción"
          value={stats.pendientes}
          description="Requieren atención"
          icon={Clock}
          iconColor="text-amber-500"
        />
        <StatsCard
          title="Atendidos recientes"
          value={stats.atendidosRecientes}
          description="Últimos 7 días"
          icon={CheckCircle2}
          iconColor="text-emerald-500"
        />
      </div>

      {/* Reports table */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <CardTitle className="text-base">Reportes</CardTitle>
            <ExportButton />
          </div>
          <ReportsFilters />
        </CardHeader>
        <CardContent className="p-0">
          <DashboardClient />
        </CardContent>
      </Card>
    </div>
  );
}
