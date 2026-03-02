import {
  prefixes,
  selectBase,
  europeFilter,
  dateFilterAlliance,
  wikipediaAndLabels,
  formatDate,
} from "./_shared.js";

export default function buildMilitaryAlliancesQuery(rangeStart, rangeEnd) {
  const from = formatDate(rangeStart);
  const to = formatDate(rangeEnd);

  return `
${prefixes()}

${selectBase()}
  # military alliance (includes subclasses)
  ?event wdt:P31/wdt:P279* wd:Q1127126 .

${dateFilterAlliance(from, to)}

${europeFilter()}

${wikipediaAndLabels()}
  `.trim();
}
