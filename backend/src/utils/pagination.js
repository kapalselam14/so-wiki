import { badRequest } from "../errors/apiError.js";

export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

export function normalizePagination(query = {}) {
  const page = query.page ?? DEFAULT_PAGE;
  const pageSize = query.page_size ?? DEFAULT_PAGE_SIZE;

  if (!Number.isInteger(page) || page < 1) {
    throw badRequest("page must be greater than or equal to 1");
  }

  if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > MAX_PAGE_SIZE) {
    throw badRequest("page_size must be between 1 and 100");
  }

  return {
    limit: pageSize,
    offset: (page - 1) * pageSize,
    page,
    pageSize,
  };
}

export function createPaginationMeta(page, pageSize, totalItems) {
  return {
    page,
    page_size: pageSize,
    total_items: totalItems,
    total_pages: totalItems === 0 ? 0 : Math.ceil(totalItems / pageSize),
  };
}
