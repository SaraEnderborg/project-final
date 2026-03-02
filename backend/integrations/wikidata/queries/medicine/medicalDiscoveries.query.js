import {
  basePrefixes,
  baseSelect,
  baseDates,
  baseEuropeFilter,
  baseWikipedia,
  formatDate,
} from "./_shared.js";

/**
 * Fetches major medical discoveries and procedures in Europe
 * within a given date range.
 *
 * Category: medical_breakthroughs
 */
export default function buildMedicalDiscoveriesQuery(rangeStart, rangeEnd) {
  const from = formatDate(rangeStart);
  const to = formatDate(rangeEnd);

  return `
${basePrefixes()}

${baseSelect()}
  VALUES ?type {
    wd:Q7314688   # medical discovery
    wd:Q796194    # medical procedure
  }

  ?event wdt:P31 ?type .

${baseDates(from, to)}

  # Safety: exclude military-related entities
  FILTER NOT EXISTS { ?event wdt:P31/wdt:P279* wd:Q180684 . }

${baseEuropeFilter()}

${baseWikipedia()}
  `.trim();
}
