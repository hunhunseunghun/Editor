// 라우트 관련 상수

// 기본 라우트
export const ROUTES = {
  // 홈
  HOME: '/',
  
  // 인증 관련
  AUTH: {
    SIGNIN: '/auth/signin',
    SIGNUP: '/auth/signup',
    SIGNOUT: '/auth/signout',
    CALLBACK: '/api/auth/callback',
  },
  
  // 대시보드
  DASHBOARD: {
    ROOT: '/dashboard',
    DOCUMENTS: '/dashboard/documents',
    NEW_DOCUMENT: '/dashboard/documents/new',
    DOCUMENT: (id: string) => `/dashboard/documents/${id}`,
    FOLDERS: '/dashboard/folders',
    NEW_FOLDER: '/dashboard/folders/new',
    FOLDER: (id: string) => `/dashboard/folders/${id}`,
    SETTINGS: '/dashboard/settings',
    PROFILE: '/dashboard/profile',
  },
  
  // 문서 관련
  DOCUMENTS: {
    ROOT: '/documents',
    NEW: '/documents/new',
    BY_ID: (id: string) => `/documents/${id}`,
    EDIT: (id: string) => `/documents/${id}/edit`,
    SHARE: (id: string) => `/documents/${id}/share`,
  },
  
  // 폴더 관련
  FOLDERS: {
    ROOT: '/folders',
    NEW: '/folders/new',
    BY_ID: (id: string) => `/folders/${id}`,
    EDIT: (id: string) => `/folders/${id}/edit`,
  },
  
  // 설정 관련
  SETTINGS: {
    ROOT: '/settings',
    PROFILE: '/settings/profile',
    ACCOUNT: '/settings/account',
    SECURITY: '/settings/security',
    NOTIFICATIONS: '/settings/notifications',
    APPEARANCE: '/settings/appearance',
  },
  
  // API 라우트
  API: {
    AUTH: '/api/auth',
    DOCUMENTS: '/api/documents',
    FOLDERS: '/api/folders',
    USERS: '/api/users',
    UPLOAD: '/api/upload',
  },
} as const;

// 라우트 그룹
export const ROUTE_GROUPS = {
  AUTH: '(auth)',
  DASHBOARD: '(dashboard)',
  MARKETING: '(marketing)',
} as const;

// 보호된 라우트 (인증 필요)
export const PROTECTED_ROUTES = [
  ROUTES.DASHBOARD.ROOT,
  ROUTES.DASHBOARD.DOCUMENTS,
  ROUTES.DASHBOARD.FOLDERS,
  ROUTES.DASHBOARD.SETTINGS,
  ROUTES.DASHBOARD.PROFILE,
  ROUTES.DOCUMENTS.ROOT,
  ROUTES.FOLDERS.ROOT,
  ROUTES.SETTINGS.ROOT,
] as const;

// 공개 라우트 (인증 불필요)
export const PUBLIC_ROUTES = [
  ROUTES.HOME,
  ROUTES.AUTH.SIGNIN,
  ROUTES.AUTH.SIGNUP,
] as const;

// 리다이렉트 라우트
export const REDIRECT_ROUTES = {
  AFTER_SIGNIN: ROUTES.DASHBOARD.DOCUMENTS,
  AFTER_SIGNOUT: ROUTES.AUTH.SIGNIN,
  UNAUTHORIZED: ROUTES.AUTH.SIGNIN,
  NOT_FOUND: '/404',
} as const;

// 라우트 메타데이터
export const ROUTE_METADATA = {
  [ROUTES.HOME]: {
    title: '홈',
    description: '루미르 문서 편집기',
    requiresAuth: false,
  },
  [ROUTES.AUTH.SIGNIN]: {
    title: '로그인',
    description: '계정에 로그인하세요',
    requiresAuth: false,
  },
  [ROUTES.AUTH.SIGNUP]: {
    title: '회원가입',
    description: '새 계정을 만드세요',
    requiresAuth: false,
  },
  [ROUTES.DASHBOARD.DOCUMENTS]: {
    title: '문서',
    description: '내 문서 목록',
    requiresAuth: true,
  },
  [ROUTES.DASHBOARD.FOLDERS]: {
    title: '폴더',
    description: '내 폴더 목록',
    requiresAuth: true,
  },
  [ROUTES.DASHBOARD.SETTINGS]: {
    title: '설정',
    description: '계정 설정',
    requiresAuth: true,
  },
} as const; 