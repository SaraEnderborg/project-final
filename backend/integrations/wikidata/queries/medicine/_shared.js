export {
  formatDate,
  basePrefixes,
  baseSelect,
  baseEuropeFilter,
  baseDates,
  baseWikipedia,
} from "../_shared.js";

// Backwards-compatible aliases (om några medicine queries använder andra namn)
export { basePrefixes as prefixes } from "../_shared.js";
export { baseSelect as selectBase } from "../_shared.js";
export { baseEuropeFilter as europeFilter } from "../_shared.js";
export { baseDates as dateFilterP580 } from "../_shared.js";
export { baseWikipedia as wikipediaAndLabels } from "../_shared.js";
