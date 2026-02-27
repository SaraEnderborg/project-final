import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../api/queryKeys";
import { fetchLayers, fetchLayerEvents } from "./api";

export function useLayers() {
  return useQuery({
    queryKey: queryKeys.layers,
    queryFn: fetchLayers,
  });
}

export function useLayerEvents(layerId, params = {}) {
  return useQuery({
    queryKey: queryKeys.layerEvents(layerId, params),
    queryFn: () => fetchLayerEvents(layerId, params),
    enabled: !!layerId,
  });
}
