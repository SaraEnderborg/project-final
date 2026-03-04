export const queryKeys = {
  layers: ["layers"],
  layerEvents: (layerId, params = {}) => [
    "layers",
    layerId,
    "events",
    params.from ?? null,
    params.to ?? null,
    params.category ?? null,
    params.tag ?? null,
  ],
  savedComparisons: ["savedComparisons"],
};
