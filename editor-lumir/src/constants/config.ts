// 설정 관련 상수

// 데이터베이스 설정
export const DATABASE_CONFIG = {
  NAME: process.env.MONGODB_DATABASE || 'editor_lumir',
  COLLECTIONS: {
    USERS: 'users',
    DOCUMENTS: 'documents',
    FOLDERS: 'folders',
    SESSIONS: 'sessions',
    ACCOUNTS: 'accounts',
    VERIFICATION_TOKENS: 'verification_tokens',
  },
  INDEXES: {
    DOCUMENTS: [
      { author: 1 },
      { author: 1, isDeleted: 1 },
      { author: 1, folderId: 1 },
      { updatedAt: -1 },
      // 휴지통 조회 최적화 인덱스
      { isDeleted: 1, deletedAt: 1 },
      { author: 1, isDeleted: 1, deletedAt: 1 },
      { isDeleted: 1, isHiddenFromTrash: 1 },
      { author: 1, isDeleted: 1, isHiddenFromTrash: 1 },
      // { deletedAt: 1 }, // TTL 인덱스 (펜딩)
    ],
    FOLDERS: [
      { user: 1 },
      { user: 1, isDeleted: 1 },
      // 휴지통 조회 최적화 인덱스
      { isDeleted: 1, deletedAt: 1 },
      { user: 1, isDeleted: 1, deletedAt: 1 },
      { isDeleted: 1, isHiddenFromTrash: 1 },
      { user: 1, isDeleted: 1, isHiddenFromTrash: 1 },
      // { deletedAt: 1 }, // TTL 인덱스 (펜딩)
    ],
    USERS: [{ email: 1 }],
    SESSIONS: [{ userId: 1 }, { expires: 1 }],
  },
  // TTL 인덱스 설정 (30일 후 자동 삭제) - 펜딩
  // TTL_INDEXES: {
  //   DOCUMENTS: {
  //     field: 'deletedAt',
  //     expireAfterSeconds: 30 * 24 * 60 * 60, // 30일
  //     partialFilterExpression: { isDeleted: true },
  //   },
  //   FOLDERS: {
  //     field: 'deletedAt',
  //     expireAfterSeconds: 30 * 24 * 60 * 60, // 30일
  //     partialFilterExpression: { isDeleted: true },
  //   },
  // },
} as const;

// 인증 설정
export const AUTH_CONFIG = {
  SESSION_MAX_AGE: 30 * 24 * 60 * 60, // 30일
  JWT_SECRET: process.env.NEXTAUTH_SECRET || 'your-secret-key',
  PROVIDERS: {
    GITHUB: {
      ID: process.env.GITHUB_ID || '',
      SECRET: process.env.GITHUB_SECRET || '',
    },
  },
  PAGES: {
    SIGNIN: '/auth/signin',
    SIGNOUT: '/auth/signin',
    ERROR: '/auth/signin',
  },
} as const;

// 에디터 설정
export const EDITOR_CONFIG = {
  AUTO_SAVE_INTERVAL: 30000, // 30초
  MAX_CONTENT_SIZE: 10 * 1024 * 1024, // 10MB
  SUPPORTED_FILE_TYPES: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
  ],
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  TOOLBAR_ITEMS: [
    'bold',
    'italic',
    'underline',
    'strikethrough',
    'code',
    'link',
    'image',
    'blockquote',
    'heading',
    'bulletList',
    'orderedList',
    'codeBlock',
    'table',
  ],
} as const;

// UI 설정
export const UI_CONFIG = {
  THEMES: {
    LIGHT: 'light',
    DARK: 'dark',
    SYSTEM: 'system',
  },
  LANGUAGES: {
    KOREAN: 'ko',
    ENGLISH: 'en',
  },
  SIDEBAR: {
    DEFAULT_WIDTH: 280,
    MIN_WIDTH: 200,
    MAX_WIDTH: 400,
    COLLAPSED_WIDTH: 60,
  },
  HEADER: {
    HEIGHT: 64,
  },
  FOOTER: {
    HEIGHT: 48,
  },
  MODAL: {
    DEFAULT_WIDTH: 500,
    MAX_WIDTH: 800,
  },
  TOAST: {
    DEFAULT_DURATION: 5000,
    POSITION: 'bottom-right',
  },
} as const;

// 성능 설정
export const PERFORMANCE_CONFIG = {
  DEBOUNCE_DELAY: 300,
  THROTTLE_DELAY: 100,
  LAZY_LOAD_OFFSET: 100,
  VIRTUAL_SCROLL_ITEM_HEIGHT: 40,
  MAX_CONCURRENT_REQUESTS: 5,
  CACHE_TTL: 5 * 60 * 1000, // 5분
} as const;

// 보안 설정
export const SECURITY_CONFIG = {
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_REQUIREMENTS: {
    UPPERCASE: true,
    LOWERCASE: true,
    NUMBERS: true,
    SPECIAL_CHARS: true,
  },
  RATE_LIMIT: {
    WINDOW_MS: 15 * 60 * 1000, // 15분
    MAX_REQUESTS: 100,
  },
  CORS: {
    ORIGINS: [
      'http://localhost:3000',
      'https://lumir.space',
      'https://*.lumir.space',
    ],
  },
} as const;

// 파일 업로드 설정
export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_FILE_TYPES: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'application/pdf',
    'text/plain',
    'text/markdown',
  ],
  STORAGE_PROVIDER: 'local', // 'local' | 's3' | 'cloudinary'
  UPLOAD_DIR: 'uploads',
  TEMP_DIR: 'temp',
} as const;

// 검색 설정
export const SEARCH_CONFIG = {
  MIN_QUERY_LENGTH: 2,
  MAX_RESULTS: 50,
  HIGHLIGHT_LENGTH: 100,
  FUZZY_MATCH: true,
  SEARCH_FIELDS: {
    DOCUMENTS: ['title', 'content'],
    FOLDERS: ['name', 'description'],
  },
} as const;
