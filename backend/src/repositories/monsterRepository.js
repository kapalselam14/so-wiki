import { buildMonsterFilters } from "./sqlFilters.js";

const MONSTER_SUMMARY_COLUMNS = `
  m.id,
  m.slug,
  m.name,
  m.level,
  m.element,
  m.image_url,
  m.source_page,
  m.source_url
`;

export function createMonsterRepository(pool) {
  return {
    async listMonsters(query, pagination) {
      const filters = buildMonsterFilters(query);
      const params = [...filters.params, pagination.limit, pagination.offset];
      const limitIndex = params.length - 1;
      const offsetIndex = params.length;

      const result = await pool.query(
        `
          select ${MONSTER_SUMMARY_COLUMNS}
          from monsters m
          ${filters.whereSql}
          order by m.level nulls last, m.name asc
          limit $${limitIndex}
          offset $${offsetIndex}
        `,
        params
      );

      return result.rows;
    },

    async countMonsters(query) {
      const filters = buildMonsterFilters(query);
      const result = await pool.query(
        `
          select count(*)::integer as total
          from monsters m
          ${filters.whereSql}
        `,
        filters.params
      );

      return result.rows[0]?.total ?? 0;
    },

    async findMonsterBySlug(slug) {
      const result = await pool.query(
        `
          select ${MONSTER_SUMMARY_COLUMNS}
          from monsters m
          where m.slug = $1
          limit 1
        `,
        [slug]
      );

      return result.rows[0] ?? null;
    },

    async findMonsterLocations(monsterId) {
      const result = await pool.query(
        `
          select
            maps.id,
            maps.slug,
            maps.name,
            maps.image_url,
            maps.source_url
          from monster_locations ml
          join maps on maps.id = ml.map_id
          where ml.monster_id = $1
          order by ml.source_order nulls last, maps.name asc
        `,
        [monsterId]
      );

      return result.rows;
    },

    async findMonsterDrops(monsterId) {
      const result = await pool.query(
        `
          select
            md.drop_category,
            md.source_order,
            coalesce(i.id, g.id, p.id, w.id, ar.id, ac.id, bpe.id) as id,
            coalesce(i.slug, g.slug, p.slug, w.slug, ar.slug, ac.slug, bpe.slug) as slug,
            coalesce(i.name, g.name, p.name, w.name, ar.name, ac.name, bpe.name) as name,
            coalesce(i.image_url, g.image_url, p.image_url, w.image_url, ar.image_url, ac.image_url, bpe.image_url) as image_url,
            coalesce(i.source_url, g.source_url, p.source_url, w.source_url, ar.source_url, ac.source_url, bpe.source_url) as source_url
          from monster_drops md
          left join items i on i.id = md.item_id
          left join gems g on g.id = md.gem_id
          left join pets p on p.id = md.pet_id
          left join weapons w on w.id = md.weapon_id
          left join armors ar on ar.id = md.armor_id
          left join accessories ac on ac.id = md.accessory_id
          left join battle_pet_equipments bpe on bpe.id = md.battle_pet_equipment_id
          where md.monster_id = $1
          order by md.drop_category asc, md.source_order nulls last, name asc
        `,
        [monsterId]
      );

      return result.rows;
    },
  };
}
