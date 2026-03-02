import {
  basePrefixes,
  baseSelect,
  baseDates,
  baseEuropeFilter,
  baseWikipedia,
  formatDate,
} from "./_shared.js";

export default function buildVaccinesQuery(rangeStart, rangeEnd) {
  const from = formatDate(rangeStart);
  const to = formatDate(rangeEnd);

  return `
${basePrefixes()}

${baseSelect()}
  VALUES ?type {
    wd:Q134808   # vaccination
  }

  ?event wdt:P31 ?type .

${baseDates(from, to)}

  FILTER NOT EXISTS { ?event wdt:P31/wdt:P279* wd:Q180684 . }

${baseEuropeFilter()}

${baseWikipedia()}
  `.trim();
}
