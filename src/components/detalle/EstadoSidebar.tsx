"use client";

import { useState } from "react";
import { PlayCircle, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { AsignarTareaModal } from "./AsignarTareaModal";
import { formatDateTime } from "@/lib/utils/formatDate";

interface EstadoSidebarProps {
  reporteId: number;
  estado: string;
  areaResponsable?: string | null;
  observaciones?: string | null;
  fechaAtencion?: Date | null;
  fechaResolucion?: Date | null;
  userRole?: string;
}

export function EstadoSidebar({
  reporteId,
  estado,
  areaResponsable,
  observaciones,
  fechaAtencion,
  fechaResolucion,
  userRole,
}: EstadoSidebarProps) {
  const [modalOpen, setModalOpen] = useState(false);

  const canManage = userRole === "ADMIN" || userRole === "TECNICO";
  const canTransition = canManage && estado !== "ATENDIDO";

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Estado del Reporte</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <StatusBadge estado={estado} />

          {canTransition && (
            <Button
              onClick={() => setModalOpen(true)}
              className="w-full gap-2"
              variant={estado === "EN_PROCESO" ? "default" : "outline"}
              size="sm"
            >
              {estado === "PENDIENTE" ? (
                <>
                  <PlayCircle className="h-4 w-4" />
                  Iniciar atención
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Marcar como resuelto
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>

      {(areaResponsable || observaciones || fechaAtencion) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Registro de Atención</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {areaResponsable && (
              <div>
                <p className="text-xs text-muted-foreground">Área responsable</p>
                <p className="font-medium">{areaResponsable}</p>
              </div>
            )}
            {fechaAtencion && (
              <div>
                <p className="text-xs text-muted-foreground">Fecha de inicio</p>
                <p>{formatDateTime(fechaAtencion)}</p>
              </div>
            )}
            {fechaResolucion && (
              <div>
                <p className="text-xs text-muted-foreground">Fecha de resolución</p>
                <p>{formatDateTime(fechaResolucion)}</p>
              </div>
            )}
            {observaciones && (
              <div>
                <p className="text-xs text-muted-foreground">Observaciones</p>
                <p className="text-muted-foreground leading-relaxed">{observaciones}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <AsignarTareaModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        reporteId={reporteId}
        estadoActual={estado}
      />
    </div>
  );
}
