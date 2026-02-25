import "dotenv/config";
import mongoose from "mongoose";
import Layer from "../../models/Layer.js";
import { layersSeed } from "./layers.seed.js";

async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error("Missing MONGO_URI in .env");
  await mongoose.connect(uri);
}

function summarizeBulkResult(result) {
  // Mongoose/MongoDB kan skilja i hur resultatobjektet ser ut mellan versioner,
  // så plockar säkert ut “vanliga” fält.
  return {
    insertedCount: result?.insertedCount ?? 0,
    matchedCount: result?.matchedCount ?? 0,
    modifiedCount: result?.modifiedCount ?? 0,
    upsertedCount: result?.upsertedCount ?? 0,
    upsertedIds: result?.upsertedIds ?? result?.getUpsertedIds?.() ?? [],
  };
}

async function seedLayers() {
  await connectDB();

  console.log("Seeding layers...");
  console.log(
    "Targets:",
    layersSeed.map((l) => l.slug),
  );

  const ops = layersSeed.map((layerDoc) => ({
    updateOne: {
      filter: { slug: layerDoc.slug },
      update: { $set: layerDoc },
      upsert: true,
    },
  }));

  const bulkResult = await Layer.bulkWrite(ops, { ordered: true });
  const summary = summarizeBulkResult(bulkResult);

  const total = await Layer.countDocuments();
  const systemLayers = await Layer.countDocuments({ ownerId: null });
  const publicLayers = await Layer.countDocuments({ isPublic: true });

  console.log("Seed complete.");
  console.log("Bulk summary:", summary);
  console.log("DB counts:", { total, systemLayers, publicLayers });

  // Visa vad som ligger i DB (snabbt och tydligt)
  const current = await Layer.find(
    { slug: { $in: layersSeed.map((l) => l.slug) } },
    { _id: 1, slug: 1, name: 1, region: 1, isPublic: 1, ownerId: 1 },
  ).lean();

  console.log("Seeded docs (slug -> _id):");
  for (const doc of current) {
    console.log(`- ${doc.slug} -> ${doc._id}`);
  }

  await mongoose.disconnect();
}

seedLayers().catch(async (err) => {
  console.error("Seeding failed:", err);
  try {
    await mongoose.disconnect();
  } catch (_) {}
  process.exit(1);
});
