import {
  formatDate,
  basePrefixes,
  baseSelect,
  baseEuropeFilter,
  baseWikipedia,
  techDates,
} from "./_shared.js";

export default function buildCommunicationQuery(rangeStart, rangeEnd) {
  const from = formatDate(rangeStart);
  const to = formatDate(rangeEnd);

  return `
${basePrefixes()}

${baseSelect()}
  VALUES ?type {
    wd:Q11032    # newspaper
  }

  ?event wdt:P31 ?type .

${techDates(from, to)}

${baseEuropeFilter()}

${baseWikipedia()}
  `.trim();
}
