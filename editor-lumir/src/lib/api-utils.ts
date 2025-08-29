// ============================================================================
// API 유틸리티 호환성 레이어
// ============================================================================
// 이 파일은 기존 코드와의 호환성을 위해 유지됩니다.
// 새로운 코드에서는 개별 모듈을 직접 import하는 것을 권장합니다.

// 인증 관련 유틸리티
export {
  getAuthenticatedUser,
  getUserObjectId,
  getAuthenticatedUserId,
} from '@/lib/auth/utils';

// 응답 생성 유틸리티
export {
  createSuccessResponse,
  createErrorResponse,
  type ApiResponse,
} from '@/lib/api/response';

// 데이터베이스 유틸리티
export {
  safeObjectId,
  validateObjectId,
  batchUpdate,
} from '@/lib/database/utils';

// 쿼리 빌더 유틸리티
export {
  buildQuery,
  buildSortOptions,
  buildPaginationOptions,
  type PaginationParams,
  type SortParams,
  type QueryOptions,
} from '@/lib/api/query';

// 검증 유틸리티
export {
  validateRequiredFields,
  validatePaginationParams,
} from '@/lib/api/validation';

// 에러 처리 유틸리티
export { handleApiError } from '@/lib/api/error';

// 순서 관리 유틸리티
export { calculateNewOrder } from '@/lib/api/order';
