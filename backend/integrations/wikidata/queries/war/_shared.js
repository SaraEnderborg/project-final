export {
  formatDate,
  basePrefixes,
  baseSelect,
  baseEuropeFilter,
  baseDates,
  baseWikipedia,
} from "../_shared.js";

// Backwards-compatible aliases (så gamla war queries fortsätter funka)
export { basePrefixes as prefixes } from "../_shared.js";
export { baseSelect as selectBase } from "../_shared.js";
export { baseEuropeFilter as europeFilter } from "../_shared.js";
export { baseDates as dateFilterP580 } from "../_shared.js";
export { baseWikipedia as wikipediaAndLabels } from "../_shared.js";

// War-specific helper (used by e.g. militaryAlliances.query.js)
export function dateFilterAlliance(from, to) {
  return `
  {
    ?event wdt:P571 ?startDate .   # inception
  } UNION {
    ?event wdt:P580 ?startDate .   # start time (fallback)
  }

  FILTER(?startDate >= "${from}"^^xsd:dateTime)
  FILTER(?startDate <= "${to}"^^xsd:dateTime)

  OPTIONAL { ?event wdt:P576 ?endDate . }  # dissolved/abolished
  OPTIONAL { ?event wdt:P582 ?endDate . }  # end time (fallback)
  `.trim();
}
