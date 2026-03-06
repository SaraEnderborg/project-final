import {
  formatDate,
  basePrefixes,
  baseSelect,
  baseEuropeFilter,
  baseWikipedia,
  techDates,
} from "./_shared.js";

export default function buildTransportQuery(rangeStart, rangeEnd) {
  const from = formatDate(rangeStart);
  const to = formatDate(rangeEnd);

  return `
${basePrefixes()}

${baseSelect()}
  VALUES ?type {
    wd:Q728937   # steam locomotive / railway line
    wd:Q12284    # canal
    wd:Q44782    # port
  }

  ?event wdt:P31 ?type .

${techDates(from, to)}

${baseEuropeFilter()}

${baseWikipedia()}
  `.trim();
}
