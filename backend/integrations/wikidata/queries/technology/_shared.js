export {
  formatDate,
  basePrefixes,
  baseSelect,
  baseEuropeFilter,
  baseWikipedia,
} from "../_shared.js";

// Backwards-compatible aliases
export { basePrefixes as prefixes } from "../_shared.js";
export { baseSelect as selectBase } from "../_shared.js";
export { baseEuropeFilter as europeFilter } from "../_shared.js";
export { baseWikipedia as wikipediaAndLabels } from "../_shared.js";

// Technology-specific date filter.
// Inventions and discoveries use P571 (inception) rather than
// P580 (start time) or P577 (publication date), so include all three.
export function techDates(from, to) {
  return `
  {
    ?event wdt:P571 ?startDate .
  } UNION {
    ?event wdt:P580 ?startDate .
  } UNION {
    ?event wdt:P577 ?startDate .
  }
  FILTER(?startDate >= "${from}"^^xsd:dateTime)
  FILTER(?startDate <= "${to}"^^xsd:dateTime)
  OPTIONAL { ?event wdt:P582 ?endDate . }
  `.trim();
}
