"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Check, Loader2 } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useIdentidad } from "@/components/layout/IdentidadGuard";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AreaEntry    { id: number; nombre: string; activo: boolean }
interface PersonEntry  { id: number; nombre: string; rol: string | null }

const ROL_LABEL: Record<string, string> = {
  STAFF:   "Jefe de Área",
  TECNICO: "Técnico",
};

// ─── Component ────────────────────────────────────────────────────────────────

interface AsignarTareaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reporteId: number;
  estadoActual: string;
}

export function AsignarTareaModal({
  open,
  onOpenChange,
  reporteId,
  estadoActual,
}: AsignarTareaModalProps) {
  const router   = useRouter();
  const identidad = useIdentidad();
  const isIniciar = estadoActual === "PENDIENTE";

  // ── picker state (PENDIENTE only) ─────────────────────────────────────────
  const [pickerStep,     setPickerStep]     = useState<"area" | "person">("area");
  const [selectedArea,   setSelectedArea]   = useState<AreaEntry | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<PersonEntry | null>(null);
  const [areas,          setAreas]          = useState<AreaEntry[]>([]);
  const [persons,        setPersons]        = useState<PersonEntry[]>([]);
  const [listLoading,    setListLoading]    = useState(false);

  // ── shared ────────────────────────────────────────────────────────────────
  const [observaciones, setObservaciones] = useState("");
  const [saving,        setSaving]        = useState(false);

  // Reset + load areas on open
  useEffect(() => {
    if (!open) return;
    setPickerStep("area");
    setSelectedArea(null);
    setSelectedPerson(null);
    setObservaciones("");
    if (!isIniciar) return;
    setListLoading(true);
    fetch("/api/areas")
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => {
        setAreas(Array.isArray(d) ? d.filter((a: AreaEntry) => a.activo) : []);
        setListLoading(false);
      })
      .catch(() => setListLoading(false));
  }, [open, isIniciar]);

  function handleSelectArea(area: AreaEntry) {
    setSelectedArea(area);
    setSelectedPerson(null);
    setPickerStep("person");
    setListLoading(true);
    fetch(`/api/personal?areaId=${area.id}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => { setPersons(Array.isArray(d) ? d : []); setListLoading(false); })
      .catch(() => setListLoading(false));
  }

  // Area is required; person is optional (jefe de área can assign later)
  const canSubmit = isIniciar ? selectedArea !== null : true;

  async function handleSubmit() {
    setSaving(true);
    const body = isIniciar
      ? {
          estado:               "EN_PROCESO",
          areaResponsable:      selectedArea?.nombre,
          personalResponsableId: selectedPerson?.id,
          observaciones:        observaciones.trim() || null,
          usuarioReal:          identidad ?? undefined,
        }
      : {
          estado:       "ATENDIDO",
          observaciones: observaciones.trim() || null,
          usuarioReal:   identidad ?? undefined,
        };

    const res = await fetch(`/api/reportes/${reporteId}`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(body),
    });

    if (res.ok) { onOpenChange(false); router.refresh(); }
    setSaving(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isIniciar ? "Asignar área y responsable" : "Marcar como resuelto"}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {isIniciar
              ? "Selecciona el área responsable y el técnico asignado"
              : "Confirma la resolución del reporte"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1">
          {/* ── Picker — only for PENDIENTE ─────────────────────────────── */}
          {isIniciar && (
            <>
              {/* Breadcrumb */}
              <nav className="flex" aria-label="Paso actual">
                <button
                  type="button"
                  onClick={pickerStep === "person" ? () => { setPickerStep("area"); setSelectedPerson(null); } : undefined}
                  disabled={pickerStep === "area"}
                  className={cn(
                    "relative flex items-center justify-center px-4 py-2 text-xs font-medium h-9 min-w-[90px]",
                    "transition-colors select-none clip-path-arrow-first rounded-l-md",
                    pickerStep === "area"   && "bg-primary text-primary-foreground",
                    pickerStep === "person" && "bg-primary/20 text-primary hover:bg-primary/30 cursor-pointer",
                  )}
                >
                  <span className="truncate max-w-[100px]">
                    {selectedArea?.nombre ?? "Área"}
                  </span>
                </button>
                <div
                  className={cn(
                    "relative flex items-center justify-center px-4 py-2 text-xs font-medium h-9 min-w-[90px]",
                    "select-none clip-path-arrow -ml-2",
                    pickerStep === "person" && !selectedPerson && "bg-primary text-primary-foreground",
                    selectedPerson          && "bg-primary/20 text-primary",
                    pickerStep === "area"   && "bg-muted text-muted-foreground",
                  )}
                >
                  <span className="truncate max-w-[100px] ml-2">
                    {selectedPerson?.nombre ?? "Responsable"}
                  </span>
                </div>
              </nav>

              {/* List panel */}
              <div className="border rounded-lg overflow-hidden divide-y max-h-52 overflow-y-auto">
                {listLoading && (
                  <p className="p-4 text-center text-sm text-muted-foreground">Cargando...</p>
                )}

                {/* Area list */}
                {!listLoading && pickerStep === "area" && areas.map((area) => (
                  <button
                    key={area.id}
                    type="button"
                    onClick={() => handleSelectArea(area)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/50 transition-colors"
                  >
                    <span className="flex-1 text-sm font-medium">{area.nombre}</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </button>
                ))}
                {!listLoading && pickerStep === "area" && areas.length === 0 && (
                  <p className="p-4 text-center text-sm text-muted-foreground">Sin áreas disponibles.</p>
                )}

                {/* Person list */}
                {!listLoading && pickerStep === "person" && persons.map((person) => {
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
                {!listLoading && pickerStep === "person" && persons.length === 0 && (
                  <p className="p-4 text-center text-sm text-muted-foreground">
                    Sin personal registrado en esta área.
                  </p>
                )}
              </div>
            </>
          )}

          {/* ── Observations ────────────────────────────────────────────── */}
          <div className="space-y-1.5">
            <Label>Observaciones técnicas</Label>
            <Textarea
              placeholder="Describe las acciones a tomar o realizadas..."
              className="min-h-[80px]"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={saving || !canSubmit}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isIniciar ? "Iniciar atención" : "Marcar como resuelto"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
