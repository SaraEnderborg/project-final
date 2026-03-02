export default function buildMedicineQuery(rangeStart, rangeEnd) {
  const from = rangeStart.toISOString().split("T")[0];
  const to = rangeEnd.toISOString().split("T")[0];

  return `
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
PREFIX schema: <http://schema.org/>

SELECT DISTINCT
  ?event ?eventLabel ?eventDescription
  ?startDate ?endDate
  ?countryLabel ?locationLabel
  ?type ?typeLabel
  ?article
WHERE {
  VALUES ?type {
    wd:Q44512     # epidemic
    wd:Q1516910   # plague epidemic
    wd:Q2723958   # influenza pandemic
    wd:Q178561    # pandemic
    wd:Q1369832   # disease outbreak
    wd:Q11461     # vaccine
    wd:Q796194    # medical procedure
    wd:Q7314688   # medical discovery
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
