import { ValidationError } from './error';
import { PaginationParams } from './query';

/**
 * 필수 필드들이 존재하는지 검증하는 함수
 * @param data - 검증할 데이터
 * @param requiredFields - 필수 필드 목록
 * @throws ValidationError - 필수 필드가 누락된 경우
 */
export function validateRequiredFields(
  data: Record<string, any>,
  requiredFields: string[],
): void {
  const missingFields: string[] = [];

  for (const field of requiredFields) {
    if (
      data[field] === undefined ||
      data[field] === null ||
      data[field] === ''
    ) {
      missingFields.push(field);
    }
  }

  if (missingFields.length > 0) {
    throw new ValidationError(
      `다음 필수 필드가 누락되었습니다: ${missingFields.join(', ')}`,
    );
  }
}

/**
 * 페이지네이션 파라미터를 검증하는 함수
 * @param params - 페이지네이션 파라미터
 * @returns 검증된 페이지네이션 파라미터
 * @throws ValidationError - 잘못된 파라미터인 경우
 */
export function validatePaginationParams(
  params: PaginationParams,
): PaginationParams {
  const { page, limit, offset } = params;

  // page 검증
  if (page !== undefined) {
    if (!Number.isInteger(page) || page < 1) {
      throw new ValidationError('page는 1 이상의 정수여야 합니다.');
    }
  }

  // limit 검증
  if (limit !== undefined) {
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
      throw new ValidationError('limit는 1 이상 100 이하의 정수여야 합니다.');
    }
  }

  // offset 검증
  if (offset !== undefined) {
    if (!Number.isInteger(offset) || offset < 0) {
      throw new ValidationError('offset은 0 이상의 정수여야 합니다.');
    }
  }

  return params;
}

/**
 * 이메일 형식을 검증하는 함수
 * @param email - 검증할 이메일
 * @throws ValidationError - 잘못된 이메일 형식인 경우
 */
export function validateEmail(email: string): void {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    throw new ValidationError('올바른 이메일 형식이 아닙니다.');
  }
}

/**
 * 문자열 길이를 검증하는 함수
 * @param value - 검증할 문자열
 * @param field - 필드명
 * @param minLength - 최소 길이
 * @param maxLength - 최대 길이
 * @throws ValidationError - 길이가 범위를 벗어난 경우
 */
export function validateStringLength(
  value: string,
  field: string,
  minLength: number = 0,
  maxLength: number = 1000,
): void {
  if (value.length < minLength) {
    throw new ValidationError(
      `${field}는 최소 ${minLength}자 이상이어야 합니다.`,
    );
  }

  if (value.length > maxLength) {
    throw new ValidationError(
      `${field}는 최대 ${maxLength}자 이하여야 합니다.`,
    );
  }
}

/**
 * 숫자 범위를 검증하는 함수
 * @param value - 검증할 숫자
 * @param field - 필드명
 * @param min - 최솟값
 * @param max - 최댓값
 * @throws ValidationError - 범위를 벗어난 경우
 */
export function validateNumberRange(
  value: number,
  field: string,
  min: number = Number.MIN_SAFE_INTEGER,
  max: number = Number.MAX_SAFE_INTEGER,
): void {
  if (!Number.isFinite(value)) {
    throw new ValidationError(`${field}는 유효한 숫자여야 합니다.`);
  }

  if (value < min) {
    throw new ValidationError(`${field}는 ${min} 이상이어야 합니다.`);
  }

  if (value > max) {
    throw new ValidationError(`${field}는 ${max} 이하여야 합니다.`);
  }
}

/**
 * 날짜 형식을 검증하는 함수
 * @param dateString - 검증할 날짜 문자열
 * @param field - 필드명
 * @throws ValidationError - 잘못된 날짜 형식인 경우
 */
export function validateDate(dateString: string, field: string): Date {
  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    throw new ValidationError(`${field}는 올바른 날짜 형식이어야 합니다.`);
  }

  return date;
}

/**
 * 배열이 비어있지 않은지 검증하는 함수
 * @param array - 검증할 배열
 * @param field - 필드명
 * @throws ValidationError - 배열이 비어있는 경우
 */
export function validateNonEmptyArray(array: any[], field: string): void {
  if (!Array.isArray(array) || array.length === 0) {
    throw new ValidationError(`${field}는 비어있지 않은 배열이어야 합니다.`);
  }
}

/**
 * URL 형식을 검증하는 함수
 * @param url - 검증할 URL
 * @param field - 필드명
 * @throws ValidationError - 잘못된 URL 형식인 경우
 */
export function validateUrl(url: string, field: string): void {
  try {
    new URL(url);
  } catch {
    throw new ValidationError(`${field}는 올바른 URL 형식이어야 합니다.`);
  }
}

/**
 * 허용된 값 목록에 포함되는지 검증하는 함수
 * @param value - 검증할 값
 * @param allowedValues - 허용된 값 목록
 * @param field - 필드명
 * @throws ValidationError - 허용되지 않은 값인 경우
 */
export function validateAllowedValues<T>(
  value: T,
  allowedValues: T[],
  field: string,
): void {
  if (!allowedValues.includes(value)) {
    throw new ValidationError(
      `${field}는 다음 값 중 하나여야 합니다: ${allowedValues.join(', ')}`,
    );
  }
}
