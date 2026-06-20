export function addCaseInsensitiveFilter(filters, params, column, value) {
  if (!value) return;

  params.push(`%${value}%`);
  filters.push(`${column} ilike $${params.length}`);
}

export function buildMonsterFilters(query = {}) {
  const filters = [];
  const params = [];

  addCaseInsensitiveFilter(filters, params, "m.name", query.search);
  addCaseInsensitiveFilter(filters, params, "m.element", query.element);

  if (query.level_min !== undefined) {
    params.push(query.level_min);
    filters.push(`m.level >= $${params.length}`);
  }

  if (query.level_max !== undefined) {
    params.push(query.level_max);
    filters.push(`m.level <= $${params.length}`);
  }

  if (query.source_page) {
    params.push(query.source_page);
    filters.push(`m.source_page = $${params.length}`);
  }

  if (query.map_slug) {
    params.push(query.map_slug);
    filters.push(`
      exists (
        select 1
        from monster_locations ml
        join maps map_filter on map_filter.id = ml.map_id
        where ml.monster_id = m.id
          and map_filter.slug = $${params.length}
      )
    `);
  }

  return {
    params,
    whereSql: filters.length ? `where ${filters.join(" and ")}` : "",
  };
}

export function buildMapFilters(query = {}) {
  const filters = [];
  const params = [];

  addCaseInsensitiveFilter(filters, params, "name", query.search);

  return {
    params,
    whereSql: filters.length ? `where ${filters.join(" and ")}` : "",
  };
}
