export function formatDate(date) {
  return date.toISOString().split("T")[0];
}

export function basePrefixes() {
  return `
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
PREFIX schema: <http://schema.org/>
  `.trim();
}

export function baseSelect() {
  return `
SELECT DISTINCT
  ?event ?eventLabel ?eventDescription
  ?startDate ?endDate
  ?countryLabel ?locationLabel
  ?type ?typeLabel
  ?article
WHERE {
  `.trim();
}

export function baseEuropeFilter() {
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

export function baseDates(from, to) {
  return `
  {
    ?event wdt:P580 ?startDate .
  } UNION {
    ?event wdt:P577 ?startDate .
  }

  FILTER(?startDate >= "${from}"^^xsd:dateTime)
  FILTER(?startDate <= "${to}"^^xsd:dateTime)

  OPTIONAL { ?event wdt:P582 ?endDate . }
  `.trim();
}

export function baseWikipedia() {
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
