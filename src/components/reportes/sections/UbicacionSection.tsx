"use client";

import { MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormSectionHeader } from "../FormSectionHeader";
import type { UseFormReturn } from "react-hook-form";
import type { ReporteFormValues } from "@/lib/validations/reporte.schema";

interface TipoEspacio {
  id: number;
  nombre: string;
}

interface Grupo {
  id: number;
  nombre: string;
}

interface Espacio {
  id: number;
  espacio: string;
  grupo: Grupo;
}

interface UbicacionSectionProps {
  form: UseFormReturn<ReporteFormValues>;
}

export function UbicacionSection({ form }: UbicacionSectionProps) {
  const [tipos, setTipos] = useState<TipoEspacio[]>([]);
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [espacios, setEspacios] = useState<Espacio[]>([]);
  const [selectedGrupo, setSelectedGrupo] = useState<string>("");

  useEffect(() => {
    Promise.all([
      fetch("/api/tipos-espacio").then((r) => r.json()),
      fetch("/api/grupos").then((r) => r.json()),
    ]).then(([t, g]) => {
      setTipos(t);
      setGrupos(g);
    });
  }, []);

  useEffect(() => {
    if (!selectedGrupo) {
      setEspacios([]);
      return;
    }
    fetch(`/api/espacios?idGrupo=${selectedGrupo}`)
      .then((r) => r.json())
      .then(setEspacios);
  }, [selectedGrupo]);

  return (
    <div className="space-y-4">
      <FormSectionHeader
        icon={MapPin}
        title="Ubicación"
        description="Selecciona el tipo, edificio y espacio específico"
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <FormField
          control={form.control}
          name="tipoUbicacion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de ubicación</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {tipos.map((t) => (
                    <SelectItem key={t.id} value={t.nombre}>
                      {t.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormItem>
          <FormLabel>Edificio / Grupo</FormLabel>
          <Select
            value={selectedGrupo}
            onValueChange={(v) => {
              setSelectedGrupo(v);
              form.setValue("idEspacio", 0);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar..." />
            </SelectTrigger>
            <SelectContent>
              {grupos.map((g) => (
                <SelectItem key={g.id} value={String(g.id)}>
                  {g.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormItem>

        <FormField
          control={form.control}
          name="idEspacio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Espacio específico</FormLabel>
              <Select
                onValueChange={(v) => field.onChange(parseInt(v))}
                value={field.value ? String(field.value) : ""}
                disabled={!selectedGrupo}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {espacios.map((e) => (
                    <SelectItem key={e.id} value={String(e.id)}>
                      {e.espacio}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
