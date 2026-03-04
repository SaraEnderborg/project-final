import { create } from "zustand";

const DEFAULT_RANGE = [1500, 2000];

export const useUiStore = create((set, get) => ({
  // Zoom
  yearRange: DEFAULT_RANGE,
  setYearRange: (range) => set({ yearRange: range }),
  resetYearRange: () => set({ yearRange: DEFAULT_RANGE }),

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
      set({ selectedLayerIds: [...prev.slice(1), id] });
      return;
    }

    set({ selectedLayerIds: [...prev, id] });
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
