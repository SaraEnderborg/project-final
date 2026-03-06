import { buildEventDoc, extractQid } from "./_mapperUtils.js";

/**
 * Maps a Wikidata type QID (from VALUES ?type) to a technology layer category slug.
 *
 * @param {string} typeUri
 * @returns {string}
 */
function mapCategoryFromTypeUri(typeUri) {
  if (!typeUri) return "scientific_invention";
  const qid = extractQid(typeUri);

  // Industrial
  if (
    qid === "Q235544" || // steam engine
    qid === "Q40558" || // factory
    qid === "Q11422" || // industry
    qid === "Q131569" || // engine
    qid === "Q187939" // spinning machine
  )
    return "industrial";

  // Communication
  if (
    qid === "Q11035" || // communication
    qid === "Q33999" || // telephone
    qid === "Q13218387" || // telegraph
    qid === "Q14116" || // printing press
    qid === "Q427626" || // radio technology
    qid === "Q15411420" // broadcasting
  )
    return "communication";

  // Transport
  if (
    qid === "Q870" || // railway
    qid === "Q11008" || // locomotive
    qid === "Q41207" || // steamship
    qid === "Q1420" || // automobile
    qid === "Q11436" || // aircraft
    qid === "Q752392" // canal
  )
    return "transport";

  // Default
  return "scientific_invention";
}

export default function mapTechnologyEvent(row, layerId) {
  // buildEventDoc will call mapCategory(...) with whatever is passed it
  // so we pass a function that reads row.type.value
  return buildEventDoc(row, layerId, () =>
    mapCategoryFromTypeUri(row?.type?.value),
  );
}
