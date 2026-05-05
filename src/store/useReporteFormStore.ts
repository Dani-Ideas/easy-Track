import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface EvaluacionDraft {
  limpieza: number;
  seguridad: number;
  iluminacion: boolean;
  equipo: boolean;
}

interface ReporteFormDraft {
  nombreSolicitante: string;
  fechaInspeccion: string;
  tipoUbicacion: string;
  idEspacio: number | null;
  descripcion: string;
  evaluacion: EvaluacionDraft;
  lastSaved: string | null;
}

interface ReporteFormStore {
  draft: ReporteFormDraft | null;
  hasDraft: boolean;
  saveDraft: (data: Partial<ReporteFormDraft>) => void;
  clearDraft: () => void;
}

const defaultEvaluacion: EvaluacionDraft = {
  limpieza: 0,
  seguridad: 0,
  iluminacion: false,
  equipo: false,
};

export const useReporteFormStore = create<ReporteFormStore>()(
  persist(
    (set, get) => ({
      draft: null,
      hasDraft: false,
      saveDraft: (data) => {
        const current = get().draft;
        const base = current ?? {
          nombreSolicitante: "",
          fechaInspeccion: "",
          tipoUbicacion: "",
          idEspacio: null,
          descripcion: "",
          evaluacion: defaultEvaluacion,
          lastSaved: null,
        };
        set({
          draft: { ...base, ...data, lastSaved: new Date().toISOString() },
          hasDraft: true,
        });
      },
      clearDraft: () => set({ draft: null, hasDraft: false }),
    }),
    {
      name: "faciltrack-reporte-draft",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
