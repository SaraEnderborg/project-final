// backend/api/layers/layers.service.js
import Layer from "../../models/Layer.js";
import Event from "../../models/Event.js";

export async function getPublicLayers() {
  return Layer.find({ isPublic: true, ownerId: null })
    .sort({ createdAt: 1 })
    .lean();
}

export async function getLayerEvents(layerId, { from, to, category, tag }) {
  const layer = await Layer.findById(layerId).lean();
  if (!layer) {
    const err = new Error("Layer not found");
    err.status = 404;
    throw err;
  }

  const fromDate = from ? new Date(from) : layer.rangeStart;
  const toDate = to ? new Date(to) : layer.rangeEnd;

  if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) {
    const err = new Error("Invalid date format. Use YYYY-MM-DD");
    err.status = 400;
    throw err;
  }

  const query = {
    layerId: layer._id,
    startDate: { $gte: fromDate, $lte: toDate },
  };

  if (category) query.category = category;
  if (tag) query.tags = tag;

  const events = await Event.find(query).sort({ startDate: 1 }).lean();

  return {
    layer: {
      _id: layer._id,
      name: layer.name,
      slug: layer.slug,
      region: layer.region,
      categories: layer.categories,
    },
    from: fromDate,
    to: toDate,
    count: events.length,
    events,
  };
}
