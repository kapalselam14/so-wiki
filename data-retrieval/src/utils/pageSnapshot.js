import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

function toSnapshotFilename(page) {
  return String(page)
    .trim()
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SNAPSHOT_DIR = path.resolve(__dirname, "../../data/fandom-pages");

export async function saveFetchedPageHtml(page, html) {
  if (!page) {
    throw new Error("Missing page name for HTML snapshot");
  }

  if (typeof html !== "string" || html.length === 0) {
    throw new Error(`Missing HTML content for page snapshot: ${page}`);
  }

  await fs.mkdir(SNAPSHOT_DIR, { recursive: true });

  const filename = `${toSnapshotFilename(page)}.html`;
  const filePath = path.join(SNAPSHOT_DIR, filename);

  await fs.writeFile(filePath, html, "utf8");

  return filePath;
}
