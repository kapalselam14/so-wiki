import { LEVEL_PAGES } from "../config/pages.js";
import { fetchFandomPageHtml } from "../clients/fandomClient.js";
import { parseMonsterPage } from "../parsers/monsterParser.js";
import { saveMonster } from "../repositories/monsterImportRepository.js";
import { saveFetchedPageHtml } from "../utils/pageSnapshot.js";
import { wait } from "../utils/wait.js";

export async function importMonsters() {
  let totalParsed = 0;
  let totalSaved = 0;

  for (const levelPage of LEVEL_PAGES) {
    console.log(`Fetching page: ${levelPage}`);

    const html = await fetchFandomPageHtml(levelPage);
    const snapshotPath = await saveFetchedPageHtml(levelPage, html);
    const monsters = parseMonsterPage(html, levelPage);

    console.log(`Saved HTML snapshot: ${snapshotPath}`);

    console.log(`Parsed ${monsters.length} monsters from ${levelPage}`);

    totalParsed += monsters.length;

    for (const monster of monsters) {
      try {
        await saveMonster(monster);
        totalSaved += 1;
        console.log(`Saved: ${monster.name}`);
      } catch (error) {
        console.error(`Failed to save ${monster.name}:`, error.message);
      }
    }

    await wait(1000);
  }

  return {
    totalParsed,
    totalSaved,
  };
}
