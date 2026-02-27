import { http } from "../../api/http";

export async function fetchLayers() {
  const data = await http("/api/layers");
  return data.response;
}

export async function fetchLayerEvents(layerId, { from, to, category } = {}) {
  const params = new URLSearchParams();
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  if (category) params.set("category", category);

  const query = params.toString() ? `?${params.toString()}` : "";
  const data = await http(`/api/layers/${layerId}/events${query}`);
  return data.response;
}
