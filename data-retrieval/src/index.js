import { importMonsters } from "./services/monsterImportService.js";

async function main() {
  console.log("Starting Seal Online monster import...");

  const result = await importMonsters();

  console.log("Import finished.");
  console.log(`Total parsed: ${result.totalParsed}`);
  console.log(`Total saved: ${result.totalSaved}`);
}

main().catch((error) => {
  console.error("Import failed:", error);
  process.exit(1);
});