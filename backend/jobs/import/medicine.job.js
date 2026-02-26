import "dotenv/config";
import Layer from "../../models/Layer.js";
import Event from "../../models/Event.js";
import buildMedicineQuery from "../../integrations/wikidata/queries/medicine.query.js";
import mapMedicineEvent from "../../integrations/wikidata/mappers/medicine.mapper.js";
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
async function fetchFromWikidata(sparql) {
  const url = new URL(WIKIDATA_ENDPOINT);
  url.searchParams.set("query", sparql);
  url.searchParams.set("format", "json");

  const response = await fetch(url.toString(), {
    headers: {
      Accept: "application/sparql-results+json",
      "User-Agent": USER_AGENT,
    },
  });

  if (!response.ok) {
    throw new Error(
      `Wikidata responded with ${response.status}: ${await response.text()}`,
    );
  }

  const data = await response.json();
  return data.results.bindings;
}

/**
 * Runs the medicine import job.
 * Fetches events from Wikidata and upserts them into MongoDB.
 *
 * @param {{ dryRun?: boolean }} options
 * @returns {Promise<Object>} Import summary
 */
export async function runMedicineImport({ dryRun = false } = {}) {
  const layer = await Layer.findOne({ slug: "medicine_disease_europe" }).lean();
  if (!layer)
    throw new Error("Medicine layer not found. Have you run the seed?");

  console.log(`Layer: ${layer.name} (${layer._id})`);

  const sparql = buildMedicineQuery(layer.rangeStart, layer.rangeEnd);
  const rows = await fetchFromWikidata(sparql);
  console.log(`Wikidata returned ${rows.length} rows`);

  const docs = rows
    .map((row) => mapMedicineEvent(row, layer._id))
    .filter(Boolean);
  console.log(
    `Mapped ${docs.length} valid events (${rows.length - docs.length} skipped)`,
  );

  if (dryRun) {
    console.log("Sample (first 3):", JSON.stringify(docs.slice(0, 3), null, 2));
    return {
      total: rows.length,
      mapped: docs.length,
      upserted: 0,
      dryRun: true,
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

  const summary = {
    total: rows.length,
    mapped: docs.length,
    upserted: result.upsertedCount,
    modified: result.modifiedCount,
    dryRun: false,
  };

  console.log("Import complete:", summary);
  return summary;
}

// CLI entry point
// node backend/jobs/import/medicine.job.js
// node backend/jobs/import/medicine.job.js --dry-run
startFromCLI("medicine.job.js", runMedicineImport, "medicine");
