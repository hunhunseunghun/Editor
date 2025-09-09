import { NextResponse } from 'next/server';

/**
 * API 오류를 표준화된 형태로 처리하는 유틸리티 함수
 * @param error - 발생한 오류
 * @param context - 오류가 발생한 컨텍스트 (선택적)
 * @returns 표준화된 오류 응답
 */
export function handleApiError(error: unknown, context?: string): NextResponse {
  console.error(`❌ API 오류${context ? ` (${context})` : ''}:`, error);

  // 개발 환경에서는 상세한 오류 정보 제공
  const isDevelopment = process.env.NODE_ENV === 'development';

  if (error instanceof Error) {
    // 인증 오류
    if (
      error.message.includes('인증') ||
      error.message.includes('Unauthorized')
    ) {
      return NextResponse.json(
        {
          error: '인증이 필요합니다.',
          details: isDevelopment ? error.message : undefined,
        },
        { status: 401 },
      );
    }

    // 권한 오류
    if (error.message.includes('권한') || error.message.includes('Forbidden')) {
      return NextResponse.json(
        {
          error: '접근 권한이 없습니다.',
          details: isDevelopment ? error.message : undefined,
        },
        { status: 403 },
      );
    }

    // 찾을 수 없음 오류
    if (
      error.message.includes('찾을 수 없') ||
      error.message.includes('Not Found')
    ) {
      return NextResponse.json(
        {
          error: '요청한 리소스를 찾을 수 없습니다.',
          details: isDevelopment ? error.message : undefined,
        },
        { status: 404 },
      );
    }

    // 유효성 검증 오류
    if (
      error.message.includes('잘못된') ||
      error.message.includes('Invalid') ||
      error.message.includes('Validation')
    ) {
      return NextResponse.json(
        {
          error: '잘못된 요청입니다.',
          details: isDevelopment ? error.message : undefined,
        },
        { status: 400 },
      );
    }

    // 일반적인 오류
    return NextResponse.json(
      {
        error: error.message || '서버 오류가 발생했습니다.',
        details: isDevelopment ? error.stack : undefined,
      },
      { status: 500 },
    );
  }

  // 알 수 없는 오류
  return NextResponse.json(
    {
      error: '알 수 없는 오류가 발생했습니다.',
      details: isDevelopment ? String(error) : undefined,
    },
    { status: 500 },
  );
}

/**
 * API 오류 클래스들
 */
export class ApiError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, field?: string) {
    super(message, 400, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends ApiError {
  constructor(resource: string = '리소스') {
    super(`${resource}을(를) 찾을 수 없습니다.`, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message: string = '인증이 필요합니다.') {
    super(message, 401, 'UNAUTHORIZED');
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends ApiError {
  constructor(message: string = '접근 권한이 없습니다.') {
    super(message, 403, 'FORBIDDEN');
    this.name = 'ForbiddenError';
  }
}
