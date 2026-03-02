import "dotenv/config";
import Layer from "../../models/Layer.js";
import Event from "../../models/Event.js";

import buildInterstateWarsQuery from "../../integrations/wikidata/queries/war/interstateWars.query.js";
import buildCivilWarsQuery from "../../integrations/wikidata/queries/war/civilWars.query.js";
import buildRevolutionsUprisingsQuery from "../../integrations/wikidata/queries/war/revolutionsUprisings.query.js";
import buildGenocidesMassViolenceQuery from "../../integrations/wikidata/queries/war/genocidesMassViolence.query.js";
import buildMilitaryAlliancesQuery from "../../integrations/wikidata/queries/war/militaryAlliances.query.js";

import { buildEventDoc } from "../../integrations/wikidata/mappers/_mapperUtils.js";
import { startFromCLI } from "./_runImport.js";

const WIKIDATA_ENDPOINT = "https://query.wikidata.org/sparql";
const USER_AGENT =
  "HistoryTimelineApp/1.0 (educational project; contact: sara@example.com)";

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

// Helper to get rid of duplicates. In some cases, the same event is returned multiple times from Wikidata with the same QID, because of multiple types or other reasons. This function keeps only one doc per Wikidata QID, preferring docs with a location if there are duplicates.

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

    // more specific location if duplicate
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

export async function runWarImport({ dryRun = false } = {}) {
  const layer = await Layer.findOne({
    slug: "war_organized_violence_europe",
  }).lean();
  if (!layer) throw new Error("War layer not found. Have you run the seed?");

  console.log(`Layer: ${layer.name} (${layer._id})`);
  console.log(
    `Range: ${layer.rangeStart.toISOString()} → ${layer.rangeEnd.toISOString()}`,
  );

  const tasks = [
    { category: "interstate_wars", buildQuery: buildInterstateWarsQuery },
    { category: "civil_wars", buildQuery: buildCivilWarsQuery },
    {
      category: "revolutions_uprisings",
      buildQuery: buildRevolutionsUprisingsQuery,
    },
    {
      category: "genocides_mass_violence",
      buildQuery: buildGenocidesMassViolenceQuery,
    },
    { category: "military_alliances", buildQuery: buildMilitaryAlliancesQuery },
  ];

  const results = [];
  for (const t of tasks) {
    const r = await importCategory({
      layer,
      category: t.category,
      buildQuery: t.buildQuery,
      dryRun,
    });
    results.push(r);
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

startFromCLI("war.job.js", runWarImport, "war");
