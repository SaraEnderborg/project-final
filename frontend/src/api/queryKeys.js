export const qk = {
  layers: ["layers"],
  timelineEvents: (layerId, viewport, filters) => [
    "timelineEvents",
    layerId,
    viewport,
    filters,
  ],
  eventDetails: (eventId) => ["eventDetails", eventId],
  savedComparisons: ["savedComparisons"],
  wikidataEntitySearch: (query) => ["wikidataEntitySearch", query],
};
