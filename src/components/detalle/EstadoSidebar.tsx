"use client";

import { useState } from "react";
import { PlayCircle, CheckCircle2, UserCircle, UserPlus, Check, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { AsignarTareaModal } from "./AsignarTareaModal";
import { formatDateTime } from "@/lib/utils/formatDate";
import { useIdentidad } from "@/components/layout/IdentidadGuard";
import { cn } from "@/lib/utils";

interface PersonEntry { id: number; nombre: string; rol: string | null }

const ROL_LABEL: Record<string, string> = {
  STAFF:   "Jefe de Área",
  TECNICO: "Técnico",
};

interface EstadoSidebarProps {
  reporteId:                  number;
  estado:                     string;
  areaResponsable?:           string | null;
  personalResponsableId?:     number | null;
  personalResponsableNombre?: string | null;
  observaciones?:             string | null;
  fechaAtencion?:             Date | null;
  fechaResolucion?:           Date | null;
  userRole?:                  string;
  userAreaNombre?:            string | null;
}

export function EstadoSidebar({
  reporteId,
  estado,
  areaResponsable,
  personalResponsableNombre,
  observaciones,
  fechaAtencion,
  fechaResolucion,
  userRole,
  userAreaNombre,
}: EstadoSidebarProps) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);

  // Assign-person dialog state
  const [assignOpen,         setAssignOpen]         = useState(false);
  const [persons,            setPersons]            = useState<PersonEntry[]>([]);
  const [selectedPerson,     setSelectedPerson]     = useState<PersonEntry | null>(null);
  const [loadingPersons,     setLoadingPersons]     = useState(false);
  const [savingAssign,       setSavingAssign]       = useState(false);

  const identidad = useIdentidad();

  const isAdmin        = userRole === "ADMIN";
  // Jefe de área cuya área coincide con el área responsable del reporte
  const isMatchingStaff = userRole === "STAFF"
    && !!areaResponsable
    && !!userAreaNombre
    && areaResponsable === userAreaNombre;
  // Persona física asignada como responsable (comparación por nombre de identidad)
  const isAssignedPerson = !!identidad
    && !!personalResponsableNombre
    && identidad === personalResponsableNombre;

  // PENDIENTE → EN_PROCESO: solo admin puede asignar área y responsable
  const canInitiate = isAdmin && estado === "PENDIENTE";
  // EN_PROCESO → ATENDIDO: admin, jefe de área correspondiente, o el responsable asignado
  const canResolve  = estado === "EN_PROCESO" && (isAdmin || isMatchingStaff || isAssignedPerson);
  // Assign/change responsible person: admin or matching staff while EN_PROCESO
  const canAssignPerson = estado === "EN_PROCESO" && (isAdmin || isMatchingStaff);

  async function openAssignDialog() {
    setSelectedPerson(null);
    setAssignOpen(true);
    if (!areaResponsable) return;
    setLoadingPersons(true);
    // Resolve area name → id, then load personal
    const areasRes = await fetch("/api/areas").then((r) => r.ok ? r.json() : []);
    const area = (Array.isArray(areasRes) ? areasRes : [])
      .find((a: { id: number; nombre: string }) => a.nombre === areaResponsable);
    if (!area) { setLoadingPersons(false); return; }
    const people = await fetch(`/api/personal?areaId=${area.id}`)
      .then((r) => r.ok ? r.json() : [])
      .catch(() => []);
    setPersons(Array.isArray(people) ? people : []);
    setLoadingPersons(false);
  }

  async function handleAssignSubmit() {
    if (!selectedPerson) return;
    setSavingAssign(true);
    const res = await fetch(`/api/reportes/${reporteId}`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({
        personalResponsableId: selectedPerson.id,
        usuarioReal: identidad ?? undefined,
        skipTimestamp: true,
      }),
    });
    if (res.ok) { setAssignOpen(false); router.refresh(); }
    setSavingAssign(false);
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Estado del Reporte</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <StatusBadge estado={estado} />

          {canInitiate && (
            <Button
              onClick={() => setModalOpen(true)}
              className="w-full gap-2"
              variant="outline"
              size="sm"
            >
              <PlayCircle className="h-4 w-4" />
              Asignar e iniciar atención
            </Button>
          )}

          {canResolve && (
            <Button
              onClick={() => setModalOpen(true)}
              className="w-full gap-2"
              size="sm"
            >
              <CheckCircle2 className="h-4 w-4" />
              Marcar como resuelto
            </Button>
          )}

          {canAssignPerson && (
            <Button
              onClick={openAssignDialog}
              className="w-full gap-2"
              variant="outline"
              size="sm"
            >
              <UserPlus className="h-4 w-4" />
              {personalResponsableNombre ? "Cambiar responsable" : "Asignar responsable"}
            </Button>
          )}

          {/* Info for non-privileged users on PENDIENTE */}
          {!isAdmin && estado === "PENDIENTE" && (
            <p className="text-xs text-muted-foreground">
              Esperando asignación de área por el administrador.
            </p>
          )}
        </CardContent>
      </Card>

      {(areaResponsable || personalResponsableNombre || observaciones || fechaAtencion) && (
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
            {personalResponsableNombre && (
              <div>
                <p className="text-xs text-muted-foreground">Responsable asignado</p>
                <p className="font-medium flex items-center gap-1.5">
                  <UserCircle className="h-3.5 w-3.5 text-muted-foreground" />
                  {personalResponsableNombre}
                </p>
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

      {/* Assign / change responsible person dialog */}
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {personalResponsableNombre ? "Cambiar responsable" : "Asignar responsable"}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Selecciona el técnico responsable del reporte
            </DialogDescription>
          </DialogHeader>

          <div className="py-1">
            <div className="border rounded-lg overflow-hidden divide-y max-h-52 overflow-y-auto">
              {loadingPersons && (
                <p className="p-4 text-center text-sm text-muted-foreground">Cargando...</p>
              )}
              {!loadingPersons && persons.length === 0 && (
                <p className="p-4 text-center text-sm text-muted-foreground">
                  Sin personal registrado en esta área.
                </p>
              )}
              {!loadingPersons && persons.map((person) => {
                const isSelected = selectedPerson?.id === person.id;
                return (
                  <button
                    key={person.id}
                    type="button"
                    onClick={() => setSelectedPerson(person)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors",
                      isSelected ? "bg-primary/10 hover:bg-primary/15" : "hover:bg-muted/50",
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{person.nombre}</p>
                      {person.rol && (
                        <p className="text-xs text-muted-foreground">
                          {ROL_LABEL[person.rol] ?? person.rol}
                        </p>
                      )}
                    </div>
                    {isSelected && <Check className="h-4 w-4 text-primary shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignOpen(false)}>Cancelar</Button>
            <Button onClick={handleAssignSubmit} disabled={savingAssign || !selectedPerson}>
              {savingAssign && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
