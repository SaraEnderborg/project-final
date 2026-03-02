export function formatDate(date) {
  return date.toISOString().split("T")[0];
}

export function prefixes() {
  return `
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
PREFIX schema: <http://schema.org/>
  `.trim();
}

export function selectBase() {
  return `
SELECT DISTINCT
  ?event ?eventLabel ?eventDescription
  ?startDate ?endDate
  ?countryLabel ?locationLabel
  ?article
WHERE {
  `.trim();
}

export function europeFilter() {
  return `
  {
    ?event wdt:P17 ?country .
    ?country wdt:P30 wd:Q46 .
  } UNION {
    ?event wdt:P276 ?location .
    ?location wdt:P30 wd:Q46 .
  } UNION {
    ?event wdt:P30 wd:Q46 .
  }

  OPTIONAL { ?event wdt:P17 ?country . }
  OPTIONAL { ?event wdt:P276 ?location . }
  `.trim();
}

export function dateFilterP580(from, to) {
  return `
  ?event wdt:P580 ?startDate .

  FILTER(?startDate >= "${from}"^^xsd:dateTime)
  FILTER(?startDate <= "${to}"^^xsd:dateTime)

  OPTIONAL { ?event wdt:P582 ?endDate . }
  `.trim();
}

export function dateFilterAlliance(from, to) {
  // Alliances/treaties often use inception (P571) or point-in-time (P585) instead of P580.
  return `
  {
    ?event wdt:P580 ?startDate .
  } UNION {
    ?event wdt:P571 ?startDate .
  } UNION {
    ?event wdt:P585 ?startDate .
  }

  FILTER(?startDate >= "${from}"^^xsd:dateTime)
  FILTER(?startDate <= "${to}"^^xsd:dateTime)

  OPTIONAL { ?event wdt:P582 ?endDate . }
  `.trim();
}

export function wikipediaAndLabels() {
  return `
  OPTIONAL {
    ?article schema:about ?event .
    ?article schema:inLanguage "en" .
    FILTER(STRSTARTS(STR(?article), "https://en.wikipedia.org/"))
  }

  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
ORDER BY ?startDate
LIMIT 2000
  `.trim();
}
