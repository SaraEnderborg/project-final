import {
  basePrefixes,
  baseSelect,
  baseDates,
  baseEuropeFilter,
  baseWikipedia,
  formatDate,
} from "./_shared.js";

export default function buildEpidemicsQuery(rangeStart, rangeEnd) {
  const from = formatDate(rangeStart);
  const to = formatDate(rangeEnd);

  return `
${basePrefixes()}

${baseSelect()}
  VALUES ?type {
    wd:Q44512     # epidemic
    wd:Q1516910   # plague epidemic
    wd:Q2723958   # influenza pandemic
    wd:Q178561    # pandemic
    wd:Q1369832   # disease outbreak
  }

  ?event wdt:P31 ?type .

${baseDates(from, to)}

  # Exclude military conflicts (safety)
  FILTER NOT EXISTS { ?event wdt:P31/wdt:P279* wd:Q180684 . }

${baseEuropeFilter()}

${baseWikipedia()}
  `.trim();
}
