import {
  prefixes,
  selectBase,
  europeFilter,
  dateFilterP580,
  wikipediaAndLabels,
  formatDate,
} from "./_shared.js";

export default function buildGenocidesMassViolenceQuery(rangeStart, rangeEnd) {
  const from = formatDate(rangeStart);
  const to = formatDate(rangeEnd);

  return `
${prefixes()}

${selectBase()}
  VALUES ?type {
    wd:Q13418847  # genocide
  }

  ?event wdt:P31 ?type .

  # Guard rails: keep this bucket pedagogically clean
  FILTER NOT EXISTS { ?event wdt:P31 wd:Q152786 }   # revolution
  FILTER NOT EXISTS { ?event wdt:P31 wd:Q467011 }   # rebellion
  FILTER NOT EXISTS { ?event wdt:P31 wd:Q8465 }     # civil war
  FILTER NOT EXISTS { ?event wdt:P31 wd:Q198 }      # war
  FILTER NOT EXISTS { ?event wdt:P31 wd:Q1261499 }  # military conflict

${dateFilterP580(from, to)}

${europeFilter()}

${wikipediaAndLabels()}
  `.trim();
}

// NOTE:- massacre (wd:Q188055) intentionally excluded due to noise
//  wd:Q188055 # massacre- picks up on the wrong things, possibly add “ethnic cleansing” later move massacre out of war (or make it opt-in later)
