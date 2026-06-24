// Shared pagination parsing + response shape for admin list endpoints.

export const PAGE_SIZES = [10, 25, 50] as const;

export interface PageParams {
  page: number;
  pageSize: number;
  from: number; // inclusive range start (for Supabase .range)
  to: number; // inclusive range end
}

export function parsePageParams(sp: URLSearchParams): PageParams {
  const page = Math.max(1, Math.floor(Number(sp.get("page")) || 1));
  let pageSize = Math.floor(Number(sp.get("pageSize")) || 25);
  if (!PAGE_SIZES.includes(pageSize as (typeof PAGE_SIZES)[number])) pageSize = 25;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  return { page, pageSize, from, to };
}

export interface Paginated<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export function paginate<T>(items: T[], params: PageParams, total: number): Paginated<T> {
  return {
    items,
    page: params.page,
    pageSize: params.pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / params.pageSize)),
  };
}
