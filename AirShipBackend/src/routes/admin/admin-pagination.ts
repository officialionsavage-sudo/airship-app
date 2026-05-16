import type { Request } from 'express';

export const DEFAULT_ADMIN_PAGE_SIZE = 20;
export const MAX_ADMIN_PAGE_SIZE = 100;

export type AdminPaginatedBody<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

/** Parse `?page=&pageSize=` for admin list endpoints. */
export function getAdminPagination(req: Pick<Request, 'query'>): {
  page: number;
  pageSize: number;
  skip: number;
} {
  const rawPage = parseInt(String(req.query.page ?? '1'), 10);
  const page = Number.isFinite(rawPage) && rawPage >= 1 ? rawPage : 1;
  let rawSize = parseInt(String(req.query.pageSize ?? DEFAULT_ADMIN_PAGE_SIZE), 10);
  if (!Number.isFinite(rawSize)) {
    rawSize = DEFAULT_ADMIN_PAGE_SIZE;
  }
  const pageSize = Math.min(MAX_ADMIN_PAGE_SIZE, Math.max(1, rawSize));
  const skip = (page - 1) * pageSize;
  return { page, pageSize, skip };
}
