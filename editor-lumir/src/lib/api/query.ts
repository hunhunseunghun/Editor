/**
 * 페이지네이션 파라미터 타입
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

/**
 * 정렬 파라미터 타입
 */
export interface SortParams {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc' | 1 | -1;
}

/**
 * 쿼리 옵션 타입
 */
export interface QueryOptions {
  filter?: Record<string, any>;
  projection?: Record<string, 1 | 0>;
  pagination?: PaginationParams;
  sort?: SortParams;
}

/**
 * MongoDB 쿼리를 빌드하는 유틸리티 함수
 * @param filters - 필터 조건들
 * @param options - 추가 옵션들
 * @returns MongoDB 쿼리 객체
 */
export function buildQuery(
  filters: Record<string, any> = {},
  options: { includeDeleted?: boolean } = {},
): Record<string, any> {
  const query: Record<string, any> = { ...filters };

  // 삭제된 항목 제외 (기본값)
  if (!options.includeDeleted) {
    query.$or = [{ isDeleted: { $exists: false } }, { isDeleted: false }];
  }

  return query;
}

/**
 * 정렬 옵션을 빌드하는 유틸리티 함수
 * @param sortParams - 정렬 파라미터
 * @returns MongoDB 정렬 객체
 */
export function buildSortOptions(
  sortParams: SortParams = {},
): Record<string, 1 | -1> {
  const { sortBy = 'updatedAt', sortOrder = 'desc' } = sortParams;

  // 정렬 순서 정규화
  const order = sortOrder === 'asc' || sortOrder === 1 ? 1 : -1;

  return { [sortBy]: order };
}

/**
 * 페이지네이션 옵션을 빌드하는 유틸리티 함수
 * @param paginationParams - 페이지네이션 파라미터
 * @returns { skip, limit } 객체
 */
export function buildPaginationOptions(
  paginationParams: PaginationParams = {},
): {
  skip: number;
  limit: number;
} {
  const { page = 1, limit = 20, offset } = paginationParams;

  // offset이 명시적으로 제공된 경우 우선 사용
  if (typeof offset === 'number') {
    return {
      skip: Math.max(0, offset),
      limit: Math.min(Math.max(1, limit), 100), // 최대 100개로 제한
    };
  }

  // page 기반 계산
  const normalizedPage = Math.max(1, page);
  const normalizedLimit = Math.min(Math.max(1, limit), 100);

  return {
    skip: (normalizedPage - 1) * normalizedLimit,
    limit: normalizedLimit,
  };
}

/**
 * 전체 쿼리 옵션을 빌드하는 통합 함수
 * @param options - 쿼리 옵션들
 * @returns 완전한 MongoDB 쿼리 설정
 */
export function buildFullQueryOptions(options: QueryOptions = {}) {
  const { filter = {}, projection, pagination, sort } = options;

  return {
    query: buildQuery(filter),
    projection,
    sort: buildSortOptions(sort),
    pagination: buildPaginationOptions(pagination),
  };
}

/**
 * 검색 쿼리를 빌드하는 유틸리티 함수
 * @param searchTerm - 검색어
 * @param fields - 검색할 필드들
 * @returns MongoDB 텍스트 검색 쿼리
 */
export function buildSearchQuery(
  searchTerm: string,
  fields: string[] = ['title', 'name', 'description'],
): Record<string, any> {
  if (!searchTerm.trim()) {
    return {};
  }

  // 각 필드에 대해 부분 매치 검색
  const searchConditions = fields.map((field) => ({
    [field]: {
      $regex: searchTerm,
      $options: 'i', // case-insensitive
    },
  }));

  return {
    $or: searchConditions,
  };
}

/**
 * 날짜 범위 쿼리를 빌드하는 유틸리티 함수
 * @param field - 날짜 필드명
 * @param startDate - 시작 날짜
 * @param endDate - 종료 날짜
 * @returns MongoDB 날짜 범위 쿼리
 */
export function buildDateRangeQuery(
  field: string,
  startDate?: Date | string,
  endDate?: Date | string,
): Record<string, any> {
  const query: Record<string, any> = {};

  if (startDate || endDate) {
    query[field] = {};

    if (startDate) {
      query[field].$gte = new Date(startDate);
    }

    if (endDate) {
      query[field].$lte = new Date(endDate);
    }
  }

  return query;
}
