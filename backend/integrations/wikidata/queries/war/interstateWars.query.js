import {
  prefixes,
  selectBase,
  europeFilter,
  dateFilterP580,
  wikipediaAndLabels,
  formatDate,
} from "./_shared.js";

export default function buildInterstateWarsQuery(rangeStart, rangeEnd) {
  const from = formatDate(rangeStart);
  const to = formatDate(rangeEnd);

  return `
${prefixes()}

${selectBase()}
  VALUES ?type {
    wd:Q198       # war
    wd:Q1261499   # military conflict
  }

  ?event wdt:P31 ?type .

  # Exclude categories handled by other queries
  FILTER NOT EXISTS { ?event wdt:P31 wd:Q8465 }      # civil war
  FILTER NOT EXISTS { ?event wdt:P31 wd:Q152786 }    # revolution
  FILTER NOT EXISTS { ?event wdt:P31 wd:Q467011 }    # rebellion
  FILTER NOT EXISTS { ?event wdt:P31 wd:Q13418847 }  # genocide
  FILTER NOT EXISTS { ?event wdt:P31 wd:Q188055 }    # massacre

${dateFilterP580(from, to)}

${europeFilter()}

${wikipediaAndLabels()}
  `.trim();
}
