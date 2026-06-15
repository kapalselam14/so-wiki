import "dotenv/config";
import fs from "fs/promises";
import path from "path";
import pg from "pg";
import { fileURLToPath } from "url";

const { Client } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const schemaPath = path.resolve(__dirname, "../../database/schema.sql");

export async function initDatabase() {
  const databaseUrl = process.env.DATABASE_CONNECTION_STRING;

  if (!databaseUrl) {
    throw new Error("Missing DATABASE_CONNECTION_STRING in .env");
  }

  const schemaSql = await fs.readFile(schemaPath, "utf-8");

  const client = new Client({
    connectionString: databaseUrl,
    ssl:
      process.env.DB_SSL === "false"
        ? false
        : {
            rejectUnauthorized: false,
          },
  });

  try {
    await client.connect();

    console.log("Connected to database.");
    console.log("Initializing database schema...");

    await client.query(schemaSql);

    console.log("Database initialized successfully.");
  } finally {
    await client.end();
  }
}