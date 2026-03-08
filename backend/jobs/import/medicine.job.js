import "dotenv/config";
import Layer from "../../models/Layer.js";
import Event from "../../models/Event.js";

import buildEpidemicsQuery from "../../integrations/wikidata/queries/medicine/epidemics.query.js";
import buildVaccinesQuery from "../../integrations/wikidata/queries/medicine/vaccines.query.js";
import buildMedicalDiscoveriesQuery from "../../integrations/wikidata/queries/medicine/medicalDiscoveries.query.js";
import buildPublicHealthQuery from "../../integrations/wikidata/queries/medicine/publicHealth.query.js";
import buildGermTheoryQuery from "../../integrations/wikidata/queries/medicine/germTheory.query.js";

import { buildEventDoc } from "../../integrations/wikidata/utils/_mapperUtils.js";
import { startFromCLI } from "./_runImport.js";

const WIKIDATA_ENDPOINT = "https://query.wikidata.org/sparql";
const USER_AGENT =
  "HistoryTimelineApp/1.0 (educational project; contact: sara@example.com)";

/**
 * Fetches raw SPARQL results from Wikidata.
 *
 * @param {string} sparql
 * @returns {Promise<Object[]>}
 */
async function fetchFromWikidata(sparql, { retries = 3 } = {}) {
  const url = new URL(WIKIDATA_ENDPOINT);
  url.searchParams.set("query", sparql);
  url.searchParams.set("format", "json");

  let lastErr;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url.toString(), {
        headers: {
          Accept: "application/sparql-results+json",
          "User-Agent": USER_AGENT,
        },
      });

      if (!response.ok) {
        const text = await response.text();

        if (
          [429, 502, 503, 504].includes(response.status) &&
          attempt < retries
        ) {
          const delayMs = 800 * attempt;
          console.log(
            `Wikidata ${response.status} (attempt ${attempt}/${retries}) – retrying in ${delayMs}ms...`,
          );
          await new Promise((r) => setTimeout(r, delayMs));
          continue;
        }

        throw new Error(`Wikidata responded with ${response.status}: ${text}`);
      }

      const data = await response.json();
      return data.results.bindings;
    } catch (err) {
      lastErr = err;
      if (attempt < retries) {
        const delayMs = 800 * attempt;
        console.log(
          `Fetch failed (attempt ${attempt}/${retries}) – retrying in ${delayMs}ms...`,
        );
        await new Promise((r) => setTimeout(r, delayMs));
        continue;
      }
    }
  }

  throw lastErr;
}

function dedupeByWikidataQid(docs) {
  const map = new Map();

  for (const doc of docs) {
    const qid = doc?.externalIds?.wikidataQid;
    if (!qid) continue;

    const existing = map.get(qid);
    if (!existing) {
      map.set(qid, doc);
      continue;
    }

    const existingHasLocation = !!existing.location;
    const docHasLocation = !!doc.location;

    if (!existingHasLocation && docHasLocation) {
      map.set(qid, doc);
    }
  }

  return [...map.values()];
}

function makeFixedCategoryMapper(category) {
  return (row, layerId) => buildEventDoc(row, layerId, () => category);
}

/**
 * Runs one category import (one query).
 */
async function importCategory({ layer, category, buildQuery, dryRun }) {
  console.log(`\n→ Importing category: ${category}`);

  const sparql = buildQuery(layer.rangeStart, layer.rangeEnd);
  const rows = await fetchFromWikidata(sparql);
  console.log(`Wikidata returned ${rows.length} rows`);

  const mapRow = makeFixedCategoryMapper(category);

  const docsRaw = rows.map((r) => mapRow(r, layer._id)).filter(Boolean);
  const docs = dedupeByWikidataQid(docsRaw);

  console.log(`Deduped ${docsRaw.length} → ${docs.length} by wikidataQid`);
  console.log(
    `Mapped ${docs.length} valid events (${rows.length - docs.length} skipped)`,
  );

  if (dryRun) {
    console.log("Sample (first 2):", JSON.stringify(docs.slice(0, 2), null, 2));
    return {
      category,
      total: rows.length,
      mapped: docs.length,
      upserted: 0,
      modified: 0,
    };
  }

  if (docs.length === 0) {
    return {
      category,
      total: rows.length,
      mapped: 0,
      upserted: 0,
      modified: 0,
    };
  }

  const ops = docs.map((doc) => ({
    updateOne: {
      filter: {
        layerId: doc.layerId,
        "externalIds.wikidataQid": doc.externalIds.wikidataQid,
      },
      update: { $set: doc },
      upsert: true,
    },
  }));

  const result = await Event.bulkWrite(ops, { ordered: false });

  return {
    category,
    total: rows.length,
    mapped: docs.length,
    upserted: result.upsertedCount,
    modified: result.modifiedCount,
  };
}

/**
 * Runs the medicine import job (6 separate queries).
 *
 * @param {{ dryRun?: boolean }} options
 * @returns {Promise<Object>} Import summary
 */
export async function runMedicineImport({ dryRun = false } = {}) {
  const layer = await Layer.findOne({ slug: "medicine_disease_europe" }).lean();
  if (!layer)
    throw new Error("Medicine layer not found. Have you run the seed?");

  console.log(`Layer: ${layer.name} (${layer._id})`);
  console.log(
    `Range: ${layer.rangeStart.toISOString()} → ${layer.rangeEnd.toISOString()}`,
  );

  const tasks = [
    {
      category: "major_epidemics_pandemics",
      buildQuery: buildEpidemicsQuery,
    },
    {
      category: "vaccines",
      buildQuery: buildVaccinesQuery,
    },
    {
      category: "medical_breakthroughs",
      buildQuery: buildMedicalDiscoveriesQuery,
    },
    {
      category: "public_health_reforms",
      buildQuery: buildPublicHealthQuery,
    },
    {
      category: "germ_theory_bacteriology",
      buildQuery: buildGermTheoryQuery,
    },
  ];

  const results = [];
  for (const t of tasks) {
    try {
      const r = await importCategory({
        layer,
        category: t.category,
        buildQuery: t.buildQuery,
        dryRun,
      });
      results.push(r);
    } catch (err) {
      console.log(
        `Skipping category ${t.category} due to error: ${err.message}`,
      );
      results.push({
        category: t.category,
        total: 0,
        mapped: 0,
        upserted: 0,
        modified: 0,
        error: err.message,
      });
    }
  }
  const summary = results.reduce(
    (acc, r) => {
      acc.total += r.total;
      acc.mapped += r.mapped;
      acc.upserted += r.upserted;
      acc.modified += r.modified;
      return acc;
    },
    { total: 0, mapped: 0, upserted: 0, modified: 0 },
  );

  const full = { ...summary, perCategory: results, dryRun };
  console.log("\nImport complete:", full);
  return full;
}

startFromCLI("medicine.job.js", runMedicineImport, "medicine");
