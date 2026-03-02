import {
  prefixes,
  selectBase,
  europeFilter,
  dateFilterP580,
  wikipediaAndLabels,
  formatDate,
} from "./_shared.js";

export default function buildRevolutionsUprisingsQuery(rangeStart, rangeEnd) {
  const from = formatDate(rangeStart);
  const to = formatDate(rangeEnd);

  return `
${prefixes()}

${selectBase()}
  VALUES ?type {
    wd:Q152786  # revolution
    wd:Q467011  # rebellion
  }

  ?event wdt:P31 ?type .

${dateFilterP580(from, to)}

${europeFilter()}

${wikipediaAndLabels()}
  `.trim();
}
