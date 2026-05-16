/** Body shape for paginated admin list endpoints (`?page=&pageSize=`). */
export type AdminPaginated<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};
