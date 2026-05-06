"use client";

import {
  ClipboardCheck, Trash2, Monitor, PenLine, Package,
  Droplets, ShowerHead, ScrollText, SoapDispenserDroplet, KeyRound,
  Flower2, Armchair, Lightbulb, Accessibility, Layers,
} from "lucide-react";
import { FormSectionHeader } from "../FormSectionHeader";
import { StarRating } from "../StarRating";
import { ToggleField } from "../ToggleField";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { UseFormReturn } from "react-hook-form";
import type { CategoriaEvaluacion, ReporteFormValues } from "@/lib/validations/reporte.schema";

interface EvaluacionSectionProps {
  form:      UseFormReturn<ReporteFormValues>;
  categoria: CategoriaEvaluacion | null;
}

export function EvaluacionSection({ form, categoria }: EvaluacionSectionProps) {
  const ev  = (form.watch("evaluacion") ?? {}) as Record<string, boolean | number>;
  const set = (key: string, val: boolean | number) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    form.setValue(`evaluacion.${key}` as any, val, { shouldValidate: true });

  if (!categoria) {
    return (
      <div className="space-y-4">
        <FormSectionHeader
          icon={ClipboardCheck}
          title="Criterios de Evaluación"
          description="Selecciona el tipo de ubicación para ver los criterios"
        />
        <p className="text-sm text-muted-foreground text-center py-4 border rounded-lg">
          Los criterios aparecerán cuando elijas el tipo de ubicación.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <FormSectionHeader
        icon={ClipboardCheck}
        title="Criterios de Evaluación"
        description="Marca el estado de cada criterio del espacio inspeccionado"
      />

      {categoria === "SALONES" && (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <ToggleField id="limpieza"    label="Limpieza"        checked={Boolean(ev.limpieza)}    onCheckedChange={(v) => set("limpieza", v)} />
            <ToggleField id="mobiliario"  label="Mobiliario"      checked={Boolean(ev.mobiliario)}  onCheckedChange={(v) => set("mobiliario", v)} icon={Armchair} />
            <ToggleField id="pantalla"    label="Pantalla"        checked={Boolean(ev.pantalla)}    onCheckedChange={(v) => set("pantalla", v)} icon={Monitor} />
            <ToggleField id="pizarron"    label="Pizarrón"        checked={Boolean(ev.pizarron)}    onCheckedChange={(v) => set("pizarron", v)} icon={PenLine} />
            <ToggleField id="bote_basura" label="Bote de basura"  checked={Boolean(ev.bote_basura)} onCheckedChange={(v) => set("bote_basura", v)} icon={Trash2} />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Package className="h-4 w-4 text-muted-foreground" />
              Nivel de uso del bote
            </Label>
            <StarRating
              value={(ev.nivel_uso_bote as number) ?? 0}
              onChange={(v) => set("nivel_uso_bote", v)}
            />
            <p className="text-xs text-muted-foreground">1 = casi vacío · 5 = completamente lleno</p>
          </div>
        </>
      )}

      {categoria === "SANITARIOS" && (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <ToggleField id="limpieza_general"  label="Limpieza General"      checked={Boolean(ev.limpieza_general)}  onCheckedChange={(v) => set("limpieza_general", v)} icon={Droplets} />
            <ToggleField id="estado_sanitarios" label="Estado de Sanitarios"  checked={Boolean(ev.estado_sanitarios)} onCheckedChange={(v) => set("estado_sanitarios", v)} icon={ShowerHead} />
            <ToggleField id="papel_higienico"   label="Papel Higiénico"       checked={Boolean(ev.papel_higienico)}   onCheckedChange={(v) => set("papel_higienico", v)} icon={ScrollText} />
            <ToggleField id="jabon"             label="Jabón"                 checked={Boolean(ev.jabon)}             onCheckedChange={(v) => set("jabon", v)} icon={SoapDispenserDroplet} />
            <ToggleField id="toallas_papel"     label="Toallas de Papel"      checked={Boolean(ev.toallas_papel)}     onCheckedChange={(v) => set("toallas_papel", v)} icon={Layers} />
            <ToggleField id="botes_basura"      label="Botes de Basura"       checked={Boolean(ev.botes_basura)}      onCheckedChange={(v) => set("botes_basura", v)} icon={Trash2} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="funcionamiento_llaves" className="flex items-center gap-2 text-sm font-medium">
              <KeyRound className="h-4 w-4 text-muted-foreground" />
              Número de llaves en mal estado
            </Label>
            <Input
              id="funcionamiento_llaves"
              type="number"
              min={0}
              className="w-32"
              value={(ev.funcionamiento_llaves as number) ?? 0}
              onChange={(e) => set("funcionamiento_llaves", parseInt(e.target.value) || 0)}
            />
          </div>
        </>
      )}

      {categoria === "AREAS_COMUNES" && (
        <div className="grid gap-3 sm:grid-cols-2">
          <ToggleField id="limpieza_general"    label="Limpieza General"      checked={Boolean(ev.limpieza_general)}    onCheckedChange={(v) => set("limpieza_general", v)} icon={Droplets} />
          <ToggleField id="estado_jardineria"   label="Estado de Jardinería"  checked={Boolean(ev.estado_jardineria)}   onCheckedChange={(v) => set("estado_jardineria", v)} icon={Flower2} />
          <ToggleField id="mobiliario_exterior" label="Mobiliario Exterior"   checked={Boolean(ev.mobiliario_exterior)} onCheckedChange={(v) => set("mobiliario_exterior", v)} icon={Armchair} />
          <ToggleField id="botes_basura"        label="Botes de Basura"       checked={Boolean(ev.botes_basura)}        onCheckedChange={(v) => set("botes_basura", v)} icon={Trash2} />
          <ToggleField id="iluminacion"         label="Iluminación"           checked={Boolean(ev.iluminacion)}         onCheckedChange={(v) => set("iluminacion", v)} icon={Lightbulb} />
          <ToggleField id="accesibilidad"       label="Accesibilidad"         checked={Boolean(ev.accesibilidad)}       onCheckedChange={(v) => set("accesibilidad", v)} icon={Accessibility} />
        </div>
      )}
    </div>
  );
}
