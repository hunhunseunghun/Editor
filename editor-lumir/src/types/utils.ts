// 타입 가드 함수 타입
export type TypeGuard<T> = (value: unknown) => value is T;

// 부분 업데이트 타입
export type PartialUpdate<T> = Partial<T> & { _id: string };

// 생성 요청 타입 (ID 제외)
export type CreateRequest<T> = Omit<
  T,
  '_id' | 'createdAt' | 'updatedAt' | 'deletedAt'
>;

// 업데이트 요청 타입 (필수 필드 제외)
export type UpdateRequest<T> = Partial<
  Omit<T, '_id' | 'createdAt' | 'updatedAt' | 'deletedAt'>
> & { _id: string };

// 페이지네이션 타입
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// 페이지네이션된 응답 타입
export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}

// 정렬 옵션 타입
export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

// 필터 옵션 타입
export interface FilterOptions {
  [key: string]: any;
}

// 검색 옵션 타입
export interface SearchOptions {
  query: string;
  fields?: string[];
  fuzzy?: boolean;
}

// 목록 조회 파라미터 타입
export interface ListParams {
  page?: number;
  limit?: number;
  sort?: SortOptions;
  filter?: FilterOptions;
  search?: SearchOptions;
}
