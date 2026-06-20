import { badRequest, notFound } from "../errors/apiError.js";
import { createPaginationMeta, normalizePagination } from "../utils/pagination.js";

const DROP_CATEGORIES = [
  "gems",
  "items",
  "quest_items",
  "weapons",
  "armors",
  "accessories",
  "b_pet_eq",
  "pets",
];

function emptyDrops() {
  return Object.fromEntries(DROP_CATEGORIES.map((category) => [category, []]));
}

function normalizeMonsterFilters(query = {}) {
  if (
    query.level_min !== undefined &&
    query.level_max !== undefined &&
    query.level_min > query.level_max
  ) {
    throw badRequest("level_min must be less than or equal to level_max");
  }

  return query;
}

function groupDrops(rows) {
  const drops = emptyDrops();

  for (const row of rows) {
    if (!drops[row.drop_category] || !row.id) {
      continue;
    }

    drops[row.drop_category].push({
      id: row.id,
      slug: row.slug,
      name: row.name,
      image_url: row.image_url,
      source_url: row.source_url,
    });
  }

  return drops;
}

export function createMonsterService(monsterRepository) {
  return {
    async listMonsters(query) {
      const pagination = normalizePagination(query);
      const filters = normalizeMonsterFilters(query);
      const [data, totalItems] = await Promise.all([
        monsterRepository.listMonsters(filters, pagination),
        monsterRepository.countMonsters(filters),
      ]);

      return {
        data,
        meta: createPaginationMeta(pagination.page, pagination.pageSize, totalItems),
      };
    },

    async getMonster(slug) {
      const monster = await monsterRepository.findMonsterBySlug(slug);

      if (!monster) {
        throw notFound("Monster not found");
      }

      const [foundAt, dropRows] = await Promise.all([
        monsterRepository.findMonsterLocations(monster.id),
        monsterRepository.findMonsterDrops(monster.id),
      ]);

      return {
        ...monster,
        found_at: foundAt,
        drops: groupDrops(dropRows),
      };
    },
  };
}
