// backend/integrations/wikidata/queries/war.query.js

/**
 * Returns a SPARQL query for fetching wars and organized violence in Europe
 * from Wikidata within a given date range.
 *
 * @param {Date} rangeStart
 * @param {Date} rangeEnd
 * @returns {string} SPARQL query
 */
export default function buildWarQuery(rangeStart, rangeEnd) {
  const from = rangeStart.toISOString().split("T")[0];
  const to = rangeEnd.toISOString().split("T")[0];

  return `
SELECT DISTINCT
  ?event ?eventLabel ?eventDescription
  ?startDate ?endDate
  ?countryLabel ?locationLabel
  ?instance ?instanceLabel
  ?article
WHERE {
  VALUES ?type {
    wd:Q198       # war
    wd:Q8465      # civil war
    wd:Q13418847  # genocide
    wd:Q467011    # rebellion
    wd:Q152786    # revolution
    wd:Q1261499   # military conflict
    wd:Q188055    # massacre
  }

  ?event wdt:P31 ?type .
  ?event wdt:P580 ?startDate .

  FILTER(?startDate >= "${from}"^^xsd:dateTime)
  FILTER(?startDate <= "${to}"^^xsd:dateTime)

  {
    ?event wdt:P17 ?country .
    ?country wdt:P30 wd:Q46 .
  } UNION {
    ?event wdt:P276 ?location .
    ?location wdt:P30 wd:Q46 .
  } UNION {
    ?event wdt:P30 wd:Q46 .
  }

  OPTIONAL { ?event wdt:P582 ?endDate . }
  OPTIONAL { ?event wdt:P17 ?country . }
  OPTIONAL { ?event wdt:P276 ?location . }
  OPTIONAL { ?event wdt:P31 ?instance . }

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
