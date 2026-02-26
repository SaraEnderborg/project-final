import { buildEventDoc } from "./_mapperUtils.js";

/**
 * Maps a Wikidata instance label to a war layer category slug.
 *
 * @param {string} instanceLabel - Instance type label from Wikidata (e.g. "civil war", "genocide")
 * @returns {string} Category slug
 */
function mapCategory(instanceLabel) {
  if (!instanceLabel) return "interstate_wars";
  const label = instanceLabel.toLowerCase();

  if (label.includes("civil war")) return "civil_wars";
  if (label.includes("genocide") || label.includes("massacre"))
    return "genocides_mass_violence";
  if (
    label.includes("revolution") ||
    label.includes("uprising") ||
    label.includes("revolt") ||
    label.includes("rebellion")
  )
    return "revolutions_uprisings";

  return "interstate_wars";
}

/**
 * Maps a Wikidata SPARQL result row to a war Event document.
 *
 * @param {Object} row - SPARQL result row from Wikidata
 * @param {string} layerId - MongoDB ObjectId for the war layer
 * @returns {Object|null} Event document, or null if the row is invalid
 */
export default function mapWarEvent(row, layerId) {
  return buildEventDoc(row, layerId, mapCategory);
}
