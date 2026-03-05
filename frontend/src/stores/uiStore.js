import { create } from "zustand";

const DEFAULT_RANGE = [1500, 2000];

export const useUiStore = create((set, get) => ({
  // Zoom
  yearRange: DEFAULT_RANGE,
  setYearRange: (range) => set({ yearRange: range }),
  resetYearRange: () => set({ yearRange: DEFAULT_RANGE }),
  visualZoom: 1,
  setVisualZoom: (z) => set({ visualZoom: z }),
  resetVisualZoom: () => set({ visualZoom: 1 }),

  // Layer selection (max 2)
  selectedLayerIds: [],

  toggleLayer: (id) => {
    const prev = get().selectedLayerIds;

    // remove
    if (prev.includes(id)) {
      set((state) => {
        const nextSelected = state.selectedLayerIds.filter((x) => x !== id);
        const nextCats = { ...state.categoryByLayerId };
        delete nextCats[id];
        return { selectedLayerIds: nextSelected, categoryByLayerId: nextCats };
      });
      return;
    }

    // add (max 2)
    if (prev.length >= 2) {
      const nextSelected = [...prev.slice(1), id];

      const removedId = prev[0];
      set((state) => {
        const nextCats = { ...state.categoryByLayerId };
        delete nextCats[removedId];
        return { selectedLayerIds: nextSelected, categoryByLayerId: nextCats };
      });
      return;
    }

    set({ selectedLayerIds: [...prev, id] });
  },

  // - enforces max 2 layers
  // - removes category filters for layers not selected
  setSelectedLayerIds: (ids = []) => {
    const safe = Array.isArray(ids) ? ids.slice(-2) : [];
    set((state) => {
      const nextCats = { ...state.categoryByLayerId };
      for (const key of Object.keys(nextCats)) {
        if (!safe.includes(key)) delete nextCats[key];
      }
      return { selectedLayerIds: safe, categoryByLayerId: nextCats };
    });
  },

  setCategoryByLayerId: (map = {}) => {
    set({ categoryByLayerId: map && typeof map === "object" ? map : {} });
  },

  // Category filter per layer
  categoryByLayerId: {},

  setCategoryForLayer: (layerId, value) =>
    set((state) => ({
      categoryByLayerId: {
        ...state.categoryByLayerId,
        [layerId]: value || null,
      },
    })),
}));
