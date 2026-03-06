import {
  formatDate,
  basePrefixes,
  baseSelect,
  baseEuropeFilter,
  baseWikipedia,
  techDates,
} from "./_shared.js";

export default function buildIndustrialQuery(rangeStart, rangeEnd) {
  const from = formatDate(rangeStart);
  const to = formatDate(rangeEnd);

  return `
${basePrefixes()}

${baseSelect()}
  VALUES ?type {
    wd:Q820477   # mine
    wd:Q190117   # ironworks
  }

  ?event wdt:P31 ?type .

${techDates(from, to)}

${baseEuropeFilter()}

${baseWikipedia()}
  `.trim();
}
