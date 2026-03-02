import {
  basePrefixes,
  baseSelect,
  baseEuropeFilter,
  baseWikipedia,
  formatDate,
} from "./_shared.js";

export default function buildHospitalsQuery(rangeStart, rangeEnd) {
  const from = formatDate(rangeStart);
  const to = formatDate(rangeEnd);

  return `
${basePrefixes()}

${baseSelect()}
  VALUES ?type {
    wd:Q16917     # hospital
    wd:Q1774898   # clinic
  }

  ?event wdt:P31 ?type .

  {
    ?event wdt:P571 ?startDate .  # inception for institutions
  } UNION {
    ?event wdt:P580 ?startDate .
  } UNION {
    ?event wdt:P577 ?startDate .
  }

  FILTER(?startDate >= "${from}"^^xsd:dateTime)
  FILTER(?startDate <= "${to}"^^xsd:dateTime)

  OPTIONAL { ?event wdt:P582 ?endDate . }

  FILTER NOT EXISTS { ?event wdt:P31/wdt:P279* wd:Q180684 . }

${baseEuropeFilter()}

${baseWikipedia()}
  `.trim();
}
