import { NextResponse } from 'next/server';

/**
 * API 응답 타입 정의
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  code?: string;
  timestamp?: string;
}

/**
 * 성공 응답을 생성하는 유틸리티 함수
 * @param data - 응답 데이터
 * @param message - 성공 메시지 (선택적)
 * @param status - HTTP 상태 코드 (기본값: 200)
 * @returns 표준화된 성공 응답
 */
export function createSuccessResponse<T>(
  data?: T,
  message?: string,
  status: number = 200,
): NextResponse {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(response, { status });
}

/**
 * 오류 응답을 생성하는 유틸리티 함수
 * @param error - 오류 메시지
 * @param status - HTTP 상태 코드 (기본값: 500)
 * @param code - 오류 코드 (선택적)
 * @returns 표준화된 오류 응답
 */
export function createErrorResponse(
  error: string,
  status: number = 500,
  code?: string,
): NextResponse {
  const response: ApiResponse = {
    success: false,
    error,
    code,
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(response, { status });
}

/**
 * 생성 성공 응답 (201)
 */
export function createCreatedResponse<T>(
  data: T,
  message?: string,
): NextResponse {
  return createSuccessResponse(data, message, 201);
}

/**
 * 업데이트 성공 응답 (200)
 */
export function createUpdatedResponse<T>(
  data: T,
  message?: string,
): NextResponse {
  return createSuccessResponse(
    data,
    message || '성공적으로 업데이트되었습니다.',
  );
}

/**
 * 삭제 성공 응답 (200)
 */
export function createDeletedResponse(message?: string): NextResponse {
  return createSuccessResponse(null, message || '성공적으로 삭제되었습니다.');
}

/**
 * 찾을 수 없음 응답 (404)
 */
export function createNotFoundResponse(resource?: string): NextResponse {
  return createErrorResponse(
    resource
      ? `${resource}을(를) 찾을 수 없습니다.`
      : '요청한 리소스를 찾을 수 없습니다.',
    404,
    'NOT_FOUND',
  );
}

/**
 * 권한 없음 응답 (401)
 */
export function createUnauthorizedResponse(message?: string): NextResponse {
  return createErrorResponse(
    message || '인증이 필요합니다.',
    401,
    'UNAUTHORIZED',
  );
}

/**
 * 접근 금지 응답 (403)
 */
export function createForbiddenResponse(message?: string): NextResponse {
  return createErrorResponse(
    message || '접근 권한이 없습니다.',
    403,
    'FORBIDDEN',
  );
}

/**
 * 잘못된 요청 응답 (400)
 */
export function createBadRequestResponse(message?: string): NextResponse {
  return createErrorResponse(
    message || '잘못된 요청입니다.',
    400,
    'BAD_REQUEST',
  );
}

/**
 * 충돌 응답 (409)
 */
export function createConflictResponse(message?: string): NextResponse {
  return createErrorResponse(
    message || '리소스 충돌이 발생했습니다.',
    409,
    'CONFLICT',
  );
}
