import { buildEventDoc, extractQid } from "./_mapperUtils.js";

/**
 * Maps a Wikidata type QID (from VALUES ?type) to a war layer category slug.
 *
 * @param {string} typeUri
 * @returns {string}
 */
function mapCategoryFromTypeUri(typeUri) {
  if (!typeUri) return "interstate_wars";
  const qid = extractQid(typeUri); // "Q8465"

  if (qid === "Q8465") return "civil_wars";
  if (qid === "Q13418847" || qid === "Q188055")
    return "genocides_mass_violence";
  if (qid === "Q152786" || qid === "Q467011") return "revolutions_uprisings";

  return "interstate_wars";
}

export default function mapWarEvent(row, layerId) {
  // buildEventDoc will call mapCategory(...) with whatever is passed it
  // so we pass a function that reads row.type.value
  return buildEventDoc(row, layerId, () =>
    mapCategoryFromTypeUri(row?.type?.value),
  );
}
