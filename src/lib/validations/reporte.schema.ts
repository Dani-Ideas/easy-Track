import { z } from "zod";

export type CategoriaEvaluacion = "SALONES" | "SANITARIOS" | "AREAS_COMUNES";

// ─── Criterios por categoría (fuente: datos_anonimizados_espacios.pdf) ────────

export const evaluacionSalonesSchema = z.object({
  limpieza:       z.boolean(),
  mobiliario:     z.boolean(),
  pantalla:       z.boolean(),
  pizarron:       z.boolean(),
  bote_basura:    z.boolean(),
  nivel_uso_bote: z.number().min(1).max(5),
});

export const evaluacionSanitariosSchema = z.object({
  limpieza_general:      z.boolean(),
  estado_sanitarios:     z.boolean(),
  papel_higienico:       z.boolean(),
  jabon:                 z.boolean(),
  toallas_papel:         z.boolean(),
  funcionamiento_llaves: z.number().int().min(0),
  botes_basura:          z.boolean(),
});

export const evaluacionAreasSchema = z.object({
  limpieza_general:    z.boolean(),
  estado_jardineria:   z.boolean(),
  mobiliario_exterior: z.boolean(),
  botes_basura:        z.boolean(),
  iluminacion:         z.boolean(),
  accesibilidad:       z.boolean(),
});

export type EvaluacionSalones   = z.infer<typeof evaluacionSalonesSchema>;
export type EvaluacionSanitarios = z.infer<typeof evaluacionSanitariosSchema>;
export type EvaluacionAreas     = z.infer<typeof evaluacionAreasSchema>;
export type Evaluacion          = EvaluacionSalones | EvaluacionSanitarios | EvaluacionAreas;

// ─── Form schema principal ────────────────────────────────────────────────────

export const reporteFormSchema = z.object({
  nombreSolicitante: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(50, "Máximo 50 caracteres"),
  fechaInspeccion: z.string().min(1, "La fecha es requerida"),
  tipoUbicacion:   z.string().min(1, "El tipo de ubicación es requerido"),
  idEspacio:       z.number().positive("El espacio es requerido"),
  descripcion:     z.string().max(500, "Máximo 500 caracteres").optional(),
  evaluacion:      z.record(z.string(), z.union([z.boolean(), z.number()])),
});

export type ReporteFormValues = z.infer<typeof reporteFormSchema>;
