import { buildMapFilters } from "./sqlFilters.js";

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
  };
}
