import {
  prefixes,
  selectBase,
  europeFilter,
  dateFilterP580,
  wikipediaAndLabels,
  formatDate,
} from "./_shared.js";

export default function buildCivilWarsQuery(rangeStart, rangeEnd) {
  const from = formatDate(rangeStart);
  const to = formatDate(rangeEnd);

  return `
${prefixes()}

${selectBase()}
  VALUES ?type {
    wd:Q8465  # civil war
  }

  ?event wdt:P31 ?type .

${dateFilterP580(from, to)}

${europeFilter()}

${wikipediaAndLabels()}
  `.trim();
}
