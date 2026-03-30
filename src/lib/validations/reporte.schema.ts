import { z } from "zod";

export const evaluacionSchema = z.object({
  limpieza: z.number().min(1).max(5),
  seguridad: z.number().min(1).max(5),
  iluminacion: z.boolean(),
  equipo: z.boolean(),
});

export const reporteFormSchema = z.object({
  nombreSolicitante: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(50, "Máximo 50 caracteres"),
  fechaInspeccion: z.string().min(1, "La fecha es requerida"),
  tipoUbicacion: z.string().min(1, "El tipo de ubicación es requerido"),
  idEspacio: z.number().positive("El espacio es requerido"),
  descripcion: z.string().max(500, "Máximo 500 caracteres").optional(),
  evaluacion: evaluacionSchema,
  urlImagenes: z.array(z.string()),
});

export type ReporteFormValues = z.infer<typeof reporteFormSchema>;
