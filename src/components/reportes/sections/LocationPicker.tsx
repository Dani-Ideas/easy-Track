"use client";

import { useState, useEffect } from "react";
import { MapPin, ChevronRight, Check } from "lucide-react";
import { FormSectionHeader } from "../FormSectionHeader";
import { cn } from "@/lib/utils";
import type { UseFormReturn } from "react-hook-form";
import type { CategoriaEvaluacion, ReporteFormValues } from "@/lib/validations/reporte.schema";

interface TipoItem {
  id: number;
  nombre: string;
  categoriaEvaluacion: CategoriaEvaluacion;
}

interface GrupoItem {
  id: number;
  nombre: string;
}

interface EspacioItem {
  id: number;
  espacio: string;
  piso: string | null;
}

type Step = "tipo" | "grupo" | "espacio";

interface LocationPickerProps {
  form: UseFormReturn<ReporteFormValues>;
  onCategoriaChange: (cat: CategoriaEvaluacion | null) => void;
}

export function LocationPicker({ form, onCategoriaChange }: LocationPickerProps) {
  const [step, setStep] = useState<Step>("tipo");
  const [tipos, setTipos] = useState<TipoItem[]>([]);
  const [grupos, setGrupos] = useState<GrupoItem[]>([]);
  const [espacios, setEspacios] = useState<EspacioItem[]>([]);
  const [selectedTipo, setSelectedTipo] = useState<TipoItem | null>(null);
  const [selectedGrupo, setSelectedGrupo] = useState<GrupoItem | null>(null);
  const [selectedEspacio, setSelectedEspacio] = useState<EspacioItem | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/tipos-espacio").then((r) => r.json()).then(setTipos);
  }, []);

  function selectTipo(tipo: TipoItem) {
    setSelectedTipo(tipo);
    setSelectedGrupo(null);
    setSelectedEspacio(null);
    setEspacios([]);
    form.setValue("idEspacio", 0);
    form.setValue("tipoUbicacion", "");
    onCategoriaChange(tipo.categoriaEvaluacion);
    setLoading(true);
    fetch(`/api/grupos?idTipoEspacio=${tipo.id}`)
      .then((r) => r.json())
      .then((data) => { setGrupos(data); setLoading(false); });
    setStep("grupo");
  }

  function selectGrupo(grupo: GrupoItem) {
    setSelectedGrupo(grupo);
    setSelectedEspacio(null);
    form.setValue("idEspacio", 0);
    setLoading(true);
    fetch(`/api/espacios?idGrupo=${grupo.id}&idTipoEspacio=${selectedTipo!.id}`)
      .then((r) => r.json())
      .then((data) => { setEspacios(data); setLoading(false); });
    setStep("espacio");
  }

  function selectEspacio(espacio: EspacioItem) {
    setSelectedEspacio(espacio);
    form.setValue("idEspacio", espacio.id, { shouldValidate: true });
    form.setValue("tipoUbicacion", selectedTipo!.nombre, { shouldValidate: true });
  }

  function jumpTo(target: Step) {
    if (target === "tipo") {
      setStep("tipo");
      setSelectedTipo(null);
      setSelectedGrupo(null);
      setSelectedEspacio(null);
      setGrupos([]);
      setEspacios([]);
      form.setValue("idEspacio", 0);
      form.setValue("tipoUbicacion", "");
      onCategoriaChange(null);
    } else if (target === "grupo" && selectedTipo) {
      setStep("grupo");
      setSelectedGrupo(null);
      setSelectedEspacio(null);
      setEspacios([]);
      form.setValue("idEspacio", 0);
    }
  }

  const stepIndex: Record<Step, number> = { tipo: 0, grupo: 1, espacio: 2 };

  const crumbs = [
    { key: "tipo"   as Step, label: selectedTipo?.nombre    ?? "Tipo"    },
    { key: "grupo"  as Step, label: selectedGrupo?.nombre   ?? "Grupo"   },
    { key: "espacio"as Step, label: selectedEspacio?.espacio ?? "Espacio" },
  ];

  return (
    <div className="space-y-4">
      <FormSectionHeader
        icon={MapPin}
        title="Ubicación"
        description="Selecciona tipo, grupo y espacio a inspeccionar"
      />

      {/* Arrow breadcrumb */}
      <nav className="flex" aria-label="Navegación de ubicación">
        {crumbs.map((crumb, i) => {
          const isCurrent = crumb.key === step;
          const isDone    = stepIndex[crumb.key] < stepIndex[step];
          const isFirst   = i === 0;

          return (
            <button
              key={crumb.key}
              type="button"
              onClick={() => isDone ? jumpTo(crumb.key) : undefined}
              disabled={!isDone && !isCurrent}
              className={cn(
                "relative flex items-center justify-center px-4 py-2 text-xs font-medium h-9 min-w-[90px] transition-colors",
                isFirst ? "clip-path-arrow-first rounded-l-md" : "clip-path-arrow -ml-2",
                isCurrent && "bg-primary text-primary-foreground",
                isDone    && "bg-primary/20 text-primary hover:bg-primary/30 cursor-pointer",
                !isCurrent && !isDone && "bg-muted text-muted-foreground cursor-default"
              )}
            >
              <span className={cn("truncate max-w-[80px]", isFirst ? "" : "ml-2")}>
                {crumb.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* List panel — se oculta cuando la selección está completa */}
      {!selectedEspacio && <div className="border rounded-lg overflow-hidden">
        {loading && (
          <p className="p-4 text-sm text-muted-foreground text-center">Cargando...</p>
        )}

        {!loading && step === "tipo" && tipos.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => selectTipo(t)}
            className="w-full flex items-center justify-between px-4 py-3 text-sm hover:bg-accent transition-colors text-left border-b last:border-b-0"
          >
            <span className="font-medium">{t.nombre}</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
          </button>
        ))}

        {!loading && step === "grupo" && grupos.map((g) => (
          <button
            key={g.id}
            type="button"
            onClick={() => selectGrupo(g)}
            className="w-full flex items-center justify-between px-4 py-3 text-sm hover:bg-accent transition-colors text-left border-b last:border-b-0"
          >
            <span className="font-medium">{g.nombre}</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
          </button>
        ))}

        {!loading && step === "espacio" && espacios.map((e) => {
          const isSelected = selectedEspacio?.id === e.id;
          return (
            <button
              key={e.id}
              type="button"
              onClick={() => selectEspacio(e)}
              className={cn(
                "w-full flex items-center justify-between px-4 py-3 text-sm hover:bg-accent transition-colors text-left border-b last:border-b-0",
                isSelected && "bg-primary/10"
              )}
            >
              <div className="flex flex-col gap-0.5">
                <span className={cn("font-medium", isSelected && "text-primary")}>{e.espacio}</span>
                {e.piso && <span className="text-xs text-muted-foreground">{e.piso}</span>}
              </div>
              {isSelected && <Check className="h-4 w-4 text-primary shrink-0" />}
            </button>
          );
        })}

        {!loading && step === "tipo" && tipos.length === 0 && (
          <p className="p-4 text-sm text-muted-foreground text-center">No hay tipos disponibles.</p>
        )}
      </div>}

      {/* Selection summary */}
      {selectedEspacio && selectedTipo && selectedGrupo && (
        <div className="flex items-start gap-2 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2.5 text-sm">
          <Check className="h-4 w-4 mt-0.5 text-primary shrink-0" />
          <div>
            <p className="font-medium text-primary">{selectedEspacio.espacio}</p>
            <p className="text-xs text-muted-foreground">
              {selectedTipo.nombre} · {selectedGrupo.nombre}
              {selectedEspacio.piso ? ` · ${selectedEspacio.piso}` : ""}
            </p>
          </div>
        </div>
      )}

      {form.formState.errors.idEspacio && (
        <p className="text-xs text-destructive">{form.formState.errors.idEspacio.message}</p>
      )}
    </div>
  );
}
