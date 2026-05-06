"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ChevronRight, Plus, Pencil, Eye, EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type CategoriaEvaluacion = "SALONES" | "SANITARIOS" | "AREAS_COMUNES";

interface TipoItem {
  id: number;
  nombre: string;
  categoriaEvaluacion: CategoriaEvaluacion;
  activo: boolean;
}
interface GrupoItem  { id: number; nombre: string; activo: boolean }
interface EspacioItem { id: number; espacio: string; piso: string | null; activo: boolean }

type Step = "tipo" | "grupo" | "espacio";
type AnyItem = TipoItem | GrupoItem | EspacioItem;

// ─── Component ────────────────────────────────────────────────────────────────

interface EdificioManagerProps { isAdmin: boolean }

export function EdificioManager({ isAdmin }: EdificioManagerProps) {
  // ── navigation ──────────────────────────────────────────────────────────────
  const [step,          setStep]          = useState<Step>("tipo");
  const [selectedTipo,  setSelectedTipo]  = useState<TipoItem | null>(null);
  const [selectedGrupo, setSelectedGrupo] = useState<GrupoItem | null>(null);

  // ── data ────────────────────────────────────────────────────────────────────
  const [tipos,    setTipos]    = useState<TipoItem[]>([]);
  const [grupos,   setGrupos]   = useState<GrupoItem[]>([]);
  const [espacios, setEspacios] = useState<EspacioItem[]>([]);
  const [loading,  setLoading]  = useState(false);

  // ── dialog ──────────────────────────────────────────────────────────────────
  const [open,          setOpen]          = useState(false);
  const [dialogMode,    setDialogMode]    = useState<"add" | "edit">("add");
  const [editTarget,    setEditTarget]    = useState<AnyItem | null>(null);
  const [formNombre,    setFormNombre]    = useState("");
  const [formPiso,      setFormPiso]      = useState("");
  const [formCategoria, setFormCategoria] = useState<CategoriaEvaluacion>("SALONES");
  const [saving,        setSaving]        = useState(false);

  // ── loaders ─────────────────────────────────────────────────────────────────
  const loadTipos = useCallback(() => {
    setLoading(true);
    fetch("/api/tipos-espacio?includeInactive=true")
      .then((r) => r.json())
      .then((d) => { setTipos(d); setLoading(false); });
  }, []);

  const loadGrupos = useCallback((tipoId: number) => {
    setLoading(true);
    fetch(`/api/grupos?idTipoEspacio=${tipoId}&includeInactive=true`)
      .then((r) => r.json())
      .then((d) => { setGrupos(d); setLoading(false); });
  }, []);

  const loadEspacios = useCallback((grupoId: number, tipoId: number) => {
    setLoading(true);
    fetch(`/api/espacios?idGrupo=${grupoId}&idTipoEspacio=${tipoId}&includeInactive=true`)
      .then((r) => r.json())
      .then((d) => { setEspacios(d); setLoading(false); });
  }, []);

  useEffect(() => { loadTipos(); }, [loadTipos]);

  // ── navigation handlers ──────────────────────────────────────────────────────
  function selectTipo(tipo: TipoItem) {
    setSelectedTipo(tipo);
    setSelectedGrupo(null);
    setEspacios([]);
    loadGrupos(tipo.id);
    setStep("grupo");
  }

  function selectGrupo(grupo: GrupoItem) {
    setSelectedGrupo(grupo);
    loadEspacios(grupo.id, selectedTipo!.id);
    setStep("espacio");
  }

  function jumpTo(target: Step) {
    if (target === "tipo") {
      setStep("tipo");
      setSelectedTipo(null);
      setSelectedGrupo(null);
      setGrupos([]);
      setEspacios([]);
    } else if (target === "grupo" && selectedTipo) {
      setStep("grupo");
      setSelectedGrupo(null);
      setEspacios([]);
    }
  }

  // ── reload helper ────────────────────────────────────────────────────────────
  function reloadCurrent() {
    if (step === "tipo")    loadTipos();
    else if (step === "grupo")   loadGrupos(selectedTipo!.id);
    else                         loadEspacios(selectedGrupo!.id, selectedTipo!.id);
  }

  // ── toggle activo ────────────────────────────────────────────────────────────
  async function toggleActivo(item: AnyItem) {
    const newActivo = !(item as { activo: boolean }).activo;

    // Optimistic update — visual change is immediate
    if (step === "tipo")
      setTipos((prev) => prev.map((t) => t.id === item.id ? { ...t, activo: newActivo } : t));
    else if (step === "grupo")
      setGrupos((prev) => prev.map((g) => g.id === item.id ? { ...g, activo: newActivo } : g));
    else
      setEspacios((prev) => prev.map((e) => e.id === item.id ? { ...e, activo: newActivo } : e));

    const endpoint =
      step === "tipo"    ? `/api/tipos-espacio/${item.id}`
      : step === "grupo" ? `/api/grupos/${item.id}`
      :                    `/api/espacios/${item.id}`;

    const res = await fetch(endpoint, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activo: newActivo }),
    });

    // Revert if server rejected
    if (!res.ok) reloadCurrent();
  }

  // ── dialog helpers ────────────────────────────────────────────────────────────
  function openAdd() {
    setDialogMode("add");
    setEditTarget(null);
    setFormNombre("");
    setFormPiso("");
    setFormCategoria("SALONES");
    setOpen(true);
  }

  function openEdit(item: AnyItem) {
    setDialogMode("edit");
    setEditTarget(item);
    if (step === "tipo") {
      const t = item as TipoItem;
      setFormNombre(t.nombre);
      setFormCategoria(t.categoriaEvaluacion);
    } else if (step === "grupo") {
      setFormNombre((item as GrupoItem).nombre);
    } else {
      const e = item as EspacioItem;
      setFormNombre(e.espacio);
      setFormPiso(e.piso ?? "");
    }
    setOpen(true);
  }

  async function handleSave() {
    if (!formNombre.trim()) return;
    setSaving(true);

    if (dialogMode === "add") {
      if (step === "tipo") {
        await fetch("/api/tipos-espacio", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nombre: formNombre.trim(), categoriaEvaluacion: formCategoria }),
        });
      } else if (step === "grupo") {
        await fetch("/api/grupos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nombre: formNombre.trim() }),
        });
      } else {
        await fetch("/api/espacios", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            espacio: formNombre.trim(),
            piso: formPiso.trim() || null,
            idGrupo: selectedGrupo!.id,
            idTipoEspacio: selectedTipo!.id,
          }),
        });
      }
    } else {
      const endpoint =
        step === "tipo"    ? `/api/tipos-espacio/${editTarget!.id}`
        : step === "grupo" ? `/api/grupos/${editTarget!.id}`
        :                    `/api/espacios/${editTarget!.id}`;

      const body =
        step === "tipo"
          ? { nombre: formNombre.trim(), categoriaEvaluacion: formCategoria }
          : step === "grupo"
          ? { nombre: formNombre.trim() }
          : { espacio: formNombre.trim(), piso: formPiso.trim() || null };

      await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    }

    setSaving(false);
    setOpen(false);
    reloadCurrent();
  }

  // ── render helpers ────────────────────────────────────────────────────────────
  const stepIndex: Record<Step, number> = { tipo: 0, grupo: 1, espacio: 2 };

  const crumbs = [
    { key: "tipo"    as Step, label: selectedTipo?.nombre    ?? "Tipo"    },
    { key: "grupo"   as Step, label: selectedGrupo?.nombre   ?? "Grupo"   },
    { key: "espacio" as Step, label: "Espacio"                            },
  ];

  const addLabels: Record<Step, string> = {
    tipo:    "Agregar tipo",
    grupo:   "Agregar grupo",
    espacio: "Agregar espacio",
  };

  const dialogTitle =
    dialogMode === "add"
      ? `Nuevo ${step === "tipo" ? "tipo" : step === "grupo" ? "grupo" : "espacio"}`
      : `Editar ${step === "tipo" ? "tipo" : step === "grupo" ? "grupo" : "espacio"}`;

  const list: AnyItem[] = step === "tipo" ? tipos : step === "grupo" ? grupos : espacios;

  const categoriaOptions: { value: CategoriaEvaluacion; label: string }[] = [
    { value: "SALONES",       label: "Salones"      },
    { value: "SANITARIOS",    label: "Sanitarios"   },
    { value: "AREAS_COMUNES", label: "Áreas Comunes"},
  ];

  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <nav className="flex" aria-label="Nivel actual">
        {crumbs.map((crumb, i) => {
          const isCurrent = crumb.key === step;
          const isDone    = stepIndex[crumb.key] < stepIndex[step];
          return (
            <button
              key={crumb.key}
              type="button"
              onClick={() => isDone ? jumpTo(crumb.key) : undefined}
              disabled={!isDone && !isCurrent}
              className={cn(
                "relative flex items-center justify-center px-4 py-2 text-xs font-medium h-9 min-w-[90px] transition-colors select-none",
                i === 0 ? "clip-path-arrow-first rounded-l-md" : "clip-path-arrow -ml-2",
                isCurrent  && "bg-primary text-primary-foreground",
                isDone     && "bg-primary/20 text-primary hover:bg-primary/30 cursor-pointer",
                !isCurrent && !isDone && "bg-muted text-muted-foreground cursor-default"
              )}
            >
              <span className={cn("truncate max-w-[80px]", i > 0 && "ml-2")}>
                {crumb.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* List panel */}
      <div className="border rounded-lg overflow-hidden divide-y">
        {loading && (
          <p className="p-6 text-center text-sm text-muted-foreground">Cargando...</p>
        )}

        {!loading && list.map((item) => {
          const activo      = (item as { activo: boolean }).activo;
          const hasChildren = step !== "espacio";
          const label =
            step === "espacio"
              ? (item as EspacioItem).espacio
              : step === "grupo"
              ? (item as GrupoItem).nombre
              : (item as TipoItem).nombre;

          return (
            <div key={item.id} className="flex items-center gap-2 px-4 py-3">
              {/* Clickable label (navigate to children) */}
              <button
                type="button"
                disabled={!hasChildren}
                onClick={() => {
                  if (step === "tipo")  selectTipo(item as TipoItem);
                  if (step === "grupo") selectGrupo(item as GrupoItem);
                }}
                className={cn(
                  "flex-1 flex flex-col min-w-0 text-left",
                  hasChildren && "cursor-pointer group"
                )}
              >
                <span className={cn(
                  "text-sm font-medium truncate transition-colors",
                  !activo   && "line-through text-muted-foreground",
                  hasChildren && activo && "group-hover:text-primary"
                )}>
                  {label}
                </span>
                {step === "espacio" && (item as EspacioItem).piso && (
                  <span className="text-xs text-muted-foreground">{(item as EspacioItem).piso}</span>
                )}
                {step === "tipo" && (
                  <span className="text-xs text-muted-foreground">
                    {categoriaOptions.find(c => c.value === (item as TipoItem).categoriaEvaluacion)?.label}
                  </span>
                )}
              </button>

              {/* Badge */}
              <Badge
                variant={activo ? "default" : "secondary"}
                className="shrink-0 text-[10px] hidden sm:flex"
              >
                {activo ? "Activo" : "Inactivo"}
              </Badge>

              {/* Admin actions */}
              {isAdmin && (
                <div className="flex items-center gap-0.5 shrink-0">
                  <Button
                    size="icon" variant="ghost" className="h-8 w-8"
                    title="Editar nombre"
                    onClick={() => openEdit(item)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="icon" variant="ghost" className="h-8 w-8"
                    title={activo ? "Desactivar" : "Activar"}
                    onClick={() => toggleActivo(item)}
                  >
                    {activo
                      ? <Eye    className="h-3.5 w-3.5" />
                      : <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />}
                  </Button>
                </div>
              )}

              {/* Navigate arrow */}
              {hasChildren && (
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 pointer-events-none" />
              )}
            </div>
          );
        })}

        {!loading && list.length === 0 && (
          <p className="p-6 text-center text-sm text-muted-foreground">
            Sin elementos. {isAdmin && "Agrega el primero con el botón de abajo."}
          </p>
        )}
      </div>

      {/* Add button — admin only */}
      {isAdmin && (
        <Button variant="outline" size="sm" className="gap-2" onClick={openAdd}>
          <Plus className="h-4 w-4" />
          {addLabels[step]}
        </Button>
      )}

      {/* Add / Edit dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogDescription className="sr-only">{dialogTitle}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-1">
            {/* Nombre — shown for all levels */}
            <div className="space-y-1.5">
              <Label htmlFor="dlg-nombre">
                {step === "espacio" ? "Nombre del espacio" : "Nombre"}
              </Label>
              <Input
                id="dlg-nombre"
                value={formNombre}
                onChange={(e) => setFormNombre(e.target.value)}
                placeholder={
                  step === "tipo"    ? "Ej. Aula"
                  : step === "grupo" ? "Ej. Bloque A1"
                  :                   "Ej. B1-001"
                }
                onKeyDown={(e) => e.key === "Enter" && handleSave()}
                autoFocus
              />
            </div>

            {/* Categoria — only for tipo */}
            {step === "tipo" && (
              <div className="space-y-1.5">
                <Label>Categoría de evaluación</Label>
                <Select
                  value={formCategoria}
                  onValueChange={(v) => setFormCategoria(v as CategoriaEvaluacion)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categoriaOptions.map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Piso — only for espacio */}
            {step === "espacio" && (
              <div className="space-y-1.5">
                <Label htmlFor="dlg-piso">Piso (opcional)</Label>
                <Input
                  id="dlg-piso"
                  value={formPiso}
                  onChange={(e) => setFormPiso(e.target.value)}
                  placeholder="Ej. 1er Piso"
                  onKeyDown={(e) => e.key === "Enter" && handleSave()}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving || !formNombre.trim()}>
              {saving ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
