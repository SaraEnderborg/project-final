export const queryKeys = {
  layers: ["layers"],
  layerEvents: (layerId, params) => ["layers", layerId, "events", params],
  savedComparisons: ["savedComparisons"],
};
