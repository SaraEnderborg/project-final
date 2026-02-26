/**
 * Extracts a Wikidata QID from an entity URI.
 * e.g. "http://www.wikidata.org/entity/Q362" → "Q362"
 *
 * @param {string} uri
 * @returns {string|null}
 */
export function extractQid(uri) {
  if (!uri) return null;
  const match = uri.match(/Q\d+$/);
  return match ? match[0] : null;
}

/**
 * Builds an Event document from a Wikidata SPARQL result row.
 * Used by all mappers (war, medicine, science, etc.).
 *
 * @param {Object} row - SPARQL result row from Wikidata
 * @param {string} layerId - MongoDB ObjectId for the layer
 * @param {Function} mapCategory - Category mapping function specific to the layer
 * @returns {Object|null} Event document, or null if the row is invalid
 */
export function buildEventDoc(row, layerId, mapCategory) {
  const qid = extractQid(row.event?.value);
  if (!qid) return null;

  const title = row.eventLabel?.value;
  if (!title || title === qid) return null;

  const startDate = row.startDate?.value ? new Date(row.startDate.value) : null;
  if (!startDate || isNaN(startDate.getTime())) return null;

  const endDate = row.endDate?.value ? new Date(row.endDate.value) : null;
  const location = row.locationLabel?.value || row.countryLabel?.value || null;

  const sources = [];
  if (row.article?.value) {
    sources.push({ label: "Wikipedia (en)", url: row.article.value });
  }
  sources.push({
    label: "Wikidata",
    url: `https://www.wikidata.org/wiki/${qid}`,
  });

  return {
    layerId,
    title,
    summary: row.eventDescription?.value || null,
    startDate,
    endDate: endDate || null,
    category: mapCategory(row.instanceLabel?.value),
    tags: [],
    location,
    sources,
    wikimedia: null,
    externalIds: { wikidataQid: qid },
    lastSyncedAt: new Date(),
  };
}
