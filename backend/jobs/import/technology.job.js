import "dotenv/config";
import Layer from "../../models/Layer.js";
import Event from "../../models/Event.js";

import buildIndustrialQuery from "../../integrations/wikidata/queries/technology/industrial.query.js";
import buildCommunicationQuery from "../../integrations/wikidata/queries/technology/communication.query.js";
import buildTransportQuery from "../../integrations/wikidata/queries/technology/transport.query.js";
import buildScientificInventionQuery from "../../integrations/wikidata/queries/technology/scientificinvention.query.js";

import { buildEventDoc } from "../../integrations/wikidata/utils/_mapperUtils.js";
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

export async function runTechnologyImport({ dryRun = false } = {}) {
  const layer = await Layer.findOne({
    slug: "technology_inventions_europe",
  }).lean();
  if (!layer)
    throw new Error("Technology layer not found. Have you run the seed?");

  console.log(`Layer: ${layer.name} (${layer._id})`);
  console.log(
    `Range: ${layer.rangeStart.toISOString()} → ${layer.rangeEnd.toISOString()}`,
  );

  const tasks = [
    { category: "industrial", buildQuery: buildIndustrialQuery },
    { category: "communication", buildQuery: buildCommunicationQuery },
    { category: "transport", buildQuery: buildTransportQuery },
    {
      category: "scientific_invention",
      buildQuery: buildScientificInventionQuery,
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

startFromCLI("technology.job.js", runTechnologyImport, "technology");
