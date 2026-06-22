import { buildMapFilters } from "./sqlFilters.js";

const MAP_SUMMARY_COLUMNS = `
  map.id,
  map.slug,
  map.name,
  map.image_url,
  map.source_url
  `

export function createMapRepository(pool) {
  return {
    async listMaps(query, pagination) {
      const filters = buildMapFilters(query);
      const params = [...filters.params, pagination.limit, pagination.offset];
      const limitIndex = params.length - 1;
      const offsetIndex = params.length;

      const result = await pool.query(
        `
          select id, slug, name, image_url, source_url
          from maps
          ${filters.whereSql}
          order by name asc
          limit $${limitIndex}
          offset $${offsetIndex}
        `,
        params
      );

      return result.rows;
    },

    async countMaps(query) {
      const filters = buildMapFilters(query);
      const result = await pool.query(
        `
          select count(*)::integer as total
          from maps
          ${filters.whereSql}
        `,
        filters.params
      );

      return result.rows[0]?.total ?? 0;
    },

    async getMapBySlug(slug){
      const result = await pool.query(`
        select ${MAP_SUMMARY_COLUMNS}
        from maps map
        where map.slug = $1
        limit 1
        `,
        [slug]
      );

      return result.rows[0];
    },

    async findMapMonsters(mapId){
      const result = await pool.query(`
        select
          m.id,
          m.slug,
          m.name,
          m.level,
          m.element,
          m.image_url,
          m.source_page,
          m.source_url
          from monster_locations ml
          join monsters m on m.id = ml.monster_id
          where ml.map_id = $1
          order by m.level nulls last, m.name asc
          `,
          [mapId]
      );

      return result.rows;
    }
  };
}
