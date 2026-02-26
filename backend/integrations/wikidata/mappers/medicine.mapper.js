// backend/integrations/wikidata/mappers/medicine.mapper.js

import { buildEventDoc } from "./_mapperUtils.js";

function mapCategory(instanceLabel) {
  if (!instanceLabel) return "medical_breakthroughs";
  const label = instanceLabel.toLowerCase();

  if (
    label.includes("epidemic") ||
    label.includes("pandemic") ||
    label.includes("plague")
  ) {
    return "major_epidemics_pandemics";
  }
  if (label.includes("vaccine") || label.includes("vaccination")) {
    return "vaccines";
  }
  if (
    label.includes("public health") ||
    label.includes("sanitation") ||
    label.includes("hygiene")
  ) {
    return "public_health_reforms";
  }
  if (label.includes("hospital") || label.includes("clinic")) {
    return "hospital_systems";
  }
  if (
    label.includes("bacteria") ||
    label.includes("germ") ||
    label.includes("bacteriology") ||
    label.includes("microb")
  ) {
    return "germ_theory_bacteriology";
  }

  return "medical_breakthroughs";
}

export default function mapMedicineEvent(row, layerId) {
  return buildEventDoc(row, layerId, mapCategory);
}
