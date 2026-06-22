import { createPaginationMeta, normalizePagination } from "../utils/pagination.js";
import { notFound } from "../errors/apiError.js";

export function createMapService(mapRepository) {
  return {
    async listMaps(query) {
      const pagination = normalizePagination(query);
      const [data, totalItems] = await Promise.all([
        mapRepository.listMaps(query, pagination),
        mapRepository.countMaps(query),
      ]);

      return {
        data,
        meta: createPaginationMeta(pagination.page, pagination.pageSize, totalItems),
      };
    },

    async getMap(slug) {
      const map = await mapRepository.getMapBySlug(slug);

      if (!map) throw notFound("Map not found")

      const monsters = await mapRepository.findMapMonsters(map.id)

      return { ...map, monsters };
    }
  };
}
