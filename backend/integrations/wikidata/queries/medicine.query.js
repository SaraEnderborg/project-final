/**
 * Returns a SPARQL query for fetching medicine and disease events in Europe
 * from Wikidata within a given date range.
 *
 * @param {Date} rangeStart
 * @param {Date} rangeEnd
 * @returns {string} SPARQL query
 */
export default function buildMedicineQuery(rangeStart, rangeEnd) {
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
    wd:Q1369832   # epidemic
    wd:Q178561    # pandemic
    wd:Q130003    # infectious disease outbreak
    wd:Q11461     # vaccine
    wd:Q796194    # medical procedure
    wd:Q7314688   # medical discovery
    wd:Q726097    # medical treatment
    wd:Q4916596   # public health intervention
  }
  ?event wdt:P31 ?type .

  {
    ?event wdt:P580 ?startDate .
  } UNION {
    ?event wdt:P577 ?startDate .
  }

  FILTER(?startDate >= "${from}"^^xsd:dateTime)
  FILTER(?startDate <= "${to}"^^xsd:dateTime)

  # Exclude military conflicts
  FILTER NOT EXISTS { ?event wdt:P31/wdt:P279* wd:Q180684 . }

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
