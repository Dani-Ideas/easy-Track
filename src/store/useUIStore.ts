import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface DashboardFilters {
  tipoUbicacion: string;
  estado: string;
  fechaDesde: string;
  fechaHasta: string;
  page: number;
  pageSize: number;
}

const defaultFilters: DashboardFilters = {
  tipoUbicacion: "",
  estado: "",
  fechaDesde: "",
  fechaHasta: "",
  page: 1,
  pageSize: 10,
};

interface UIStore {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  filters: DashboardFilters;
  setFilter: <K extends keyof DashboardFilters>(
    key: K,
    value: DashboardFilters[K]
  ) => void;
  resetFilters: () => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      filters: defaultFilters,
      setFilter: (key, value) =>
        set((state) => ({
          filters: { ...state.filters, [key]: value, page: 1 },
        })),
      resetFilters: () => set({ filters: defaultFilters }),
    }),
    {
      name: "faciltrack-ui",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ sidebarCollapsed: state.sidebarCollapsed }),
    }
  )
);
