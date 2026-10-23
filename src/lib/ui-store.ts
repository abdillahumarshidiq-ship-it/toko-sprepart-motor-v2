"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface MotorOption {
  id: string;
  brand: string;
  model: string;
  yearFrom: number | null;
  yearTo: number | null;
  slug: string;
}

interface CatalogFilters {
  q: string;
  categoryId: string;
  brandId: string;
  stok: string; // READY / MENIPIS / KOSONG / ""
  tipe: string; // ORI / OEM / KW1 / ""
  page: number;
}

interface UIState {
  selectedMotor: MotorOption | null;
  filters: CatalogFilters;
  isAdmin: boolean;

  // actions
  setMotor: (m: MotorOption | null) => void;
  setFilter: <K extends keyof CatalogFilters>(k: K, v: CatalogFilters[K]) => void;
  resetFilters: () => void;
  setAdmin: (v: boolean) => void;
}

const initialFilters: CatalogFilters = {
  q: "",
  categoryId: "",
  brandId: "",
  stok: "",
  tipe: "",
  page: 1,
};

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      selectedMotor: null,
      filters: initialFilters,
      isAdmin: false,

      setMotor: (m) => set({ selectedMotor: m, filters: { ...initialFilters } }),
      setFilter: (k, v) =>
        set((s) => ({
          filters: { ...s.filters, [k]: v, page: k === "page" ? (v as number) : 1 },
        })),
      resetFilters: () => set({ filters: initialFilters }),
      setAdmin: (v) => set({ isAdmin: v }),
    }),
    {
      name: "sijambul-merah-ui",
      partialize: (s) => ({ selectedMotor: s.selectedMotor }) as Partial<UIState>,
    }
  )
);
