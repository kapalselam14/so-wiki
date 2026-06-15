import { initDatabase } from "./initdb.js";

async function main() {
  await initDatabase();
}

main().catch((error) => {
  console.error("Database initialization failed:");
  console.error(error);
  process.exit(1);
});