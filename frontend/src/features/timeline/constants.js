export const CATEGORY_COLORS = {
  // War
  interstate_wars: "#c0392b",
  civil_wars: "#e67e22",
  revolutions_uprisings: "#f1c40f",
  genocides_mass_violence: "#8e1a1a",
  military_alliances: "#3498db",
  // Medicine
  major_epidemics_pandemics: "#9b59b6",
  vaccines: "#27ae60",
  medical_breakthroughs: "#1abc9c",
  public_health_reforms: "#16a085",
  hospital_systems: "#2980b9",
  germ_theory_bacteriology: "#6c3483",
};

export const LAYER_ACCENT = {
  war_organized_violence_europe: "#c0392b",
  medicine_disease_europe: "#9b59b6",
};

export const RANGE_START = new Date("1500-01-01").getTime();
export const RANGE_END = new Date("2000-01-01").getTime();
export const RANGE_SPAN = RANGE_END - RANGE_START;

export function dateToPercent(date) {
  const t = new Date(date).getTime();
  return ((t - RANGE_START) / RANGE_SPAN) * 100;
}

export function formatYear(date) {
  return new Date(date).getFullYear();
}
