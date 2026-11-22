// Shapes returned by GET /provinces (see /docs on the backend).

export type Province = {
  id: string;
  name: string;
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type ProvincesResponse = {
  message: string;
  data: Province[];
  meta: PaginationMeta;
};

export type ProvincesQuery = {
  page?: number;
  /** 1 to 100 on the API side. */
  limit?: number;
  search?: string;
  sortBy?: "name" | "id";
  order?: "asc" | "desc";
};
