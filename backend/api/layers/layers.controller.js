import { getPublicLayers, getLayerEvents } from "./layers.service.js";

export async function listLayers(_req, res) {
  try {
    const layers = await getPublicLayers();
    res.json({
      success: true,
      message: "Layers fetched",
      response: layers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch layers",
      response: error.message,
    });
  }
}

export async function listLayerEvents(req, res) {
  try {
    const data = await getLayerEvents(req.params.id, req.query);
    res.json({
      success: true,
      message: "Events fetched",
      response: data,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || "Failed to fetch events",
      response: null,
    });
  }
}
