import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CategoriaEvaluacion } from "@/lib/validations/reporte.schema";

interface ReporteFormDraft {
  nombreSolicitante:   string;
  fechaInspeccion:     string;
  tipoUbicacion:       string;
  idEspacio:           number | null;
  descripcion:         string;
  categoriaEvaluacion: CategoriaEvaluacion | null;
  evaluacion:          Record<string, boolean | number>;
  lastSaved:           string | null;
}

interface ReporteFormStore {
  draft:     ReporteFormDraft | null;
  hasDraft:  boolean;
  saveDraft: (data: Partial<ReporteFormDraft>) => void;
  clearDraft: () => void;
}

export const useReporteFormStore = create<ReporteFormStore>()(
  persist(
    (set, get) => ({
      draft:    null,
      hasDraft: false,
      saveDraft: (data) => {
        const current = get().draft;
        const base = current ?? {
          nombreSolicitante:   "",
          fechaInspeccion:     "",
          tipoUbicacion:       "",
          idEspacio:           null,
          descripcion:         "",
          categoriaEvaluacion: null,
          evaluacion:          {},
          lastSaved:           null,
        };
        set({
          draft:    { ...base, ...data, lastSaved: new Date().toISOString() },
          hasDraft: true,
        });
      },
      clearDraft: () => set({ draft: null, hasDraft: false }),
    }),
    {
      name:    "faciltrack-reporte-draft",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
