"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Send, Save } from "lucide-react";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { reporteFormSchema, type CategoriaEvaluacion, type ReporteFormValues } from "@/lib/validations/reporte.schema";
import { useReporteFormStore } from "@/store/useReporteFormStore";
import { DraftBanner } from "./DraftBanner";
import { InfoGeneralSection } from "./sections/InfoGeneralSection";
import { LocationPicker } from "./sections/LocationPicker";
import { EvaluacionSection } from "./sections/EvaluacionSection";
import { ComentariosSection } from "./sections/ComentariosSection";
import { useIdentidad } from "@/components/layout/IdentidadGuard";

export function ReporteForm() {
  const router = useRouter();
  const { hasDraft, draft, saveDraft, clearDraft } = useReporteFormStore();
  const [submitting, setSubmitting] = useState(false);
  const [categoriaEvaluacion, setCategoriaEvaluacion] = useState<CategoriaEvaluacion | null>(null);
  const identidad = useIdentidad();

  const form = useForm<ReporteFormValues>({
    resolver: zodResolver(reporteFormSchema),
    defaultValues: {
      nombreSolicitante: identidad ?? "",
      fechaInspeccion: new Date().toISOString().split("T")[0],
      tipoUbicacion: "",
      idEspacio: 0,
      descripcion: "",
      evaluacion: {},
    },
  });

  function restoreDraft() {
    if (!draft) return;
    setCategoriaEvaluacion(draft.categoriaEvaluacion);
    form.reset({
      nombreSolicitante: draft.nombreSolicitante,
      fechaInspeccion:   draft.fechaInspeccion || new Date().toISOString().split("T")[0],
      tipoUbicacion:     draft.tipoUbicacion,
      idEspacio:         draft.idEspacio ?? 0,
      descripcion:       draft.descripcion,
      evaluacion:        draft.evaluacion,
    });
  }

  function handleCategoriaChange(cat: CategoriaEvaluacion | null) {
    setCategoriaEvaluacion(cat);
    form.setValue("evaluacion", {});
  }

  function handleSaveDraft() {
    const values = form.getValues();
    saveDraft({
      nombreSolicitante:   values.nombreSolicitante,
      fechaInspeccion:     values.fechaInspeccion,
      tipoUbicacion:       values.tipoUbicacion,
      idEspacio:           values.idEspacio,
      descripcion:         values.descripcion ?? "",
      categoriaEvaluacion,
      evaluacion:          values.evaluacion,
    });
  }

  async function onSubmit(values: ReporteFormValues) {
    setSubmitting(true);
    const res = await fetch("/api/reportes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...values, isDraft: false }),
    });

    if (res.ok) {
      clearDraft();
      const reporte = await res.json();
      router.push(`/reportes/${reporte.id}`);
    } else {
      setSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {hasDraft && <DraftBanner onRestore={restoreDraft} />}

        <Card>
          <CardContent className="pt-6 space-y-8">
            <InfoGeneralSection form={form} />
            <Separator />
            <LocationPicker form={form} onCategoriaChange={handleCategoriaChange} />
            <Separator />
            <EvaluacionSection form={form} categoria={categoriaEvaluacion} />
            <Separator />
            <ComentariosSection form={form} />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={handleSaveDraft} className="gap-2">
            <Save className="h-4 w-4" />
            Guardar borrador
          </Button>
          <Button type="submit" disabled={submitting} className="gap-2">
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Enviar reporte
          </Button>
        </div>
      </form>
    </Form>
  );
}
