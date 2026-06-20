import { createPaginationMeta, normalizePagination } from "../utils/pagination.js";

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
  };
}
