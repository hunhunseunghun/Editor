// 유효성 검사 관련 상수

// 이메일 유효성 검사
export const EMAIL_VALIDATION = {
  PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  MIN_LENGTH: 5,
  MAX_LENGTH: 254,
  MESSAGE: {
    REQUIRED: '이메일을 입력해주세요.',
    INVALID: '유효한 이메일 주소를 입력해주세요.',
    TOO_SHORT: '이메일이 너무 짧습니다.',
    TOO_LONG: '이메일이 너무 깁니다.',
  },
} as const;

// 비밀번호 유효성 검사
export const PASSWORD_VALIDATION = {
  MIN_LENGTH: 8,
  MAX_LENGTH: 128,
  PATTERNS: {
    UPPERCASE: /[A-Z]/,
    LOWERCASE: /[a-z]/,
    NUMBERS: /\d/,
    SPECIAL_CHARS: /[!@#$%^&*(),.?":{}|<>]/,
  },
  MESSAGE: {
    REQUIRED: '비밀번호를 입력해주세요.',
    TOO_SHORT: '비밀번호는 최소 8자 이상이어야 합니다.',
    TOO_LONG: '비밀번호는 최대 128자까지 가능합니다.',
    UPPERCASE: '대문자를 포함해야 합니다.',
    LOWERCASE: '소문자를 포함해야 합니다.',
    NUMBERS: '숫자를 포함해야 합니다.',
    SPECIAL_CHARS: '특수문자를 포함해야 합니다.',
  },
} as const;

// 사용자명 유효성 검사
export const USERNAME_VALIDATION = {
  MIN_LENGTH: 2,
  MAX_LENGTH: 50,
  PATTERN: /^[a-zA-Z0-9가-힣\s]+$/,
  MESSAGE: {
    REQUIRED: '사용자명을 입력해주세요.',
    TOO_SHORT: '사용자명은 최소 2자 이상이어야 합니다.',
    TOO_LONG: '사용자명은 최대 50자까지 가능합니다.',
    INVALID: '사용자명에는 영문, 숫자, 한글, 공백만 사용할 수 있습니다.',
  },
} as const;

// 문서 제목 유효성 검사
export const DOCUMENT_TITLE_VALIDATION = {
  MIN_LENGTH: 1,
  MAX_LENGTH: 200,
  MESSAGE: {
    REQUIRED: '문서 제목을 입력해주세요.',
    TOO_LONG: '문서 제목은 최대 200자까지 가능합니다.',
  },
} as const;

// 폴더명 유효성 검사
export const FOLDER_NAME_VALIDATION = {
  MIN_LENGTH: 1,
  MAX_LENGTH: 100,
  PATTERN: /^[a-zA-Z0-9가-힣\s\-_]+$/,
  MESSAGE: {
    REQUIRED: '폴더명을 입력해주세요.',
    TOO_LONG: '폴더명은 최대 100자까지 가능합니다.',
    INVALID: '폴더명에는 영문, 숫자, 한글, 공백, 하이픈(-), 언더스코어(_)만 사용할 수 있습니다.',
  },
} as const;

// 폴더 설명 유효성 검사
export const FOLDER_DESCRIPTION_VALIDATION = {
  MAX_LENGTH: 500,
  MESSAGE: {
    TOO_LONG: '폴더 설명은 최대 500자까지 가능합니다.',
  },
} as const;

// 파일 업로드 유효성 검사
export const FILE_UPLOAD_VALIDATION = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'application/pdf',
    'text/plain',
    'text/markdown',
  ],
  MESSAGE: {
    TOO_LARGE: '파일 크기는 10MB를 초과할 수 없습니다.',
    INVALID_TYPE: '지원하지 않는 파일 형식입니다.',
    REQUIRED: '파일을 선택해주세요.',
  },
} as const;

// 검색 쿼리 유효성 검사
export const SEARCH_QUERY_VALIDATION = {
  MIN_LENGTH: 2,
  MAX_LENGTH: 100,
  MESSAGE: {
    TOO_SHORT: '검색어는 최소 2자 이상이어야 합니다.',
    TOO_LONG: '검색어는 최대 100자까지 가능합니다.',
  },
} as const;

// URL 유효성 검사
export const URL_VALIDATION = {
  PATTERN: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  MESSAGE: {
    INVALID: '유효한 URL을 입력해주세요.',
  },
} as const;

// 전화번호 유효성 검사
export const PHONE_VALIDATION = {
  PATTERN: /^[0-9-+\s()]+$/,
  MIN_LENGTH: 10,
  MAX_LENGTH: 20,
  MESSAGE: {
    INVALID: '유효한 전화번호를 입력해주세요.',
    TOO_SHORT: '전화번호가 너무 짧습니다.',
    TOO_LONG: '전화번호가 너무 깁니다.',
  },
} as const;

// 일반 텍스트 유효성 검사
export const TEXT_VALIDATION = {
  MIN_LENGTH: 1,
  MAX_LENGTH: 1000,
  MESSAGE: {
    REQUIRED: '내용을 입력해주세요.',
    TOO_LONG: '내용은 최대 1000자까지 가능합니다.',
  },
} as const;

// 숫자 유효성 검사
export const NUMBER_VALIDATION = {
  MIN: 0,
  MAX: 999999999,
  MESSAGE: {
    INVALID: '유효한 숫자를 입력해주세요.',
    TOO_SMALL: '숫자가 너무 작습니다.',
    TOO_LARGE: '숫자가 너무 큽니다.',
  },
} as const;

// 날짜 유효성 검사
export const DATE_VALIDATION = {
  MIN_DATE: new Date('1900-01-01'),
  MAX_DATE: new Date('2100-12-31'),
  MESSAGE: {
    INVALID: '유효한 날짜를 입력해주세요.',
    TOO_EARLY: '날짜가 너무 이릅니다.',
    TOO_LATE: '날짜가 너무 늦습니다.',
  },
} as const;

// 공통 유효성 검사 메시지
export const COMMON_VALIDATION_MESSAGES = {
  REQUIRED: '필수 입력 항목입니다.',
  INVALID: '유효하지 않은 값입니다.',
  TOO_SHORT: '너무 짧습니다.',
  TOO_LONG: '너무 깁니다.',
  TOO_SMALL: '너무 작습니다.',
  TOO_LARGE: '너무 큽니다.',
  ALREADY_EXISTS: '이미 존재하는 값입니다.',
  NOT_FOUND: '찾을 수 없는 값입니다.',
  UNAUTHORIZED: '권한이 없습니다.',
  NETWORK_ERROR: '네트워크 오류가 발생했습니다.',
  SERVER_ERROR: '서버 오류가 발생했습니다.',
} as const; 