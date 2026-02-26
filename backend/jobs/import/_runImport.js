import mongoose from "mongoose";

export async function runImport({
  importFn,
  jobName,
  dryRun = false,
  connectDB = false,
}) {
  if (connectDB) {
    const uri = process.env.MONGO_URI;
    if (!uri) throw new Error("Missing MONGO_URI in .env");
    await mongoose.connect(uri);
    console.log(`[${jobName}] Connected to MongoDB`);
  }

  try {
    console.log(`[${jobName}] Starting import...${dryRun ? " (dry run)" : ""}`);
    const result = await importFn({ dryRun });
    console.log(`[${jobName}] Done:`, result);
    return result;
  } finally {
    if (connectDB) {
      await mongoose.disconnect();
      console.log(`[${jobName}] Disconnected.`);
    }
  }
}

export function startFromCLI(
  filename,
  importFn,
  jobName = filename.replace(".js", ""),
) {
  const isMain = process.argv[1]?.endsWith(filename);
  if (!isMain) return;

  const dryRun = process.argv.includes("--dry-run");

  runImport({ importFn, jobName, dryRun, connectDB: true }).catch((err) => {
    console.error(`[${jobName}] Import failed:`, err);
    process.exit(1);
  });
}
