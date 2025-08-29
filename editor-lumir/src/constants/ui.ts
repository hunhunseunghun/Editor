// UI 관련 상수

// 색상 팔레트
export const COLORS = {
  // 브랜드 색상
  PRIMARY: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  SECONDARY: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },
  SUCCESS: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  WARNING: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  ERROR: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  // 중성 색상
  GRAY: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  // 다크 모드 색상
  DARK: {
    BG: '#0f172a',
    CARD: '#1e293b',
    BORDER: '#334155',
    TEXT: '#f8fafc',
    MUTED: '#64748b',
  },
} as const;

// 간격 (Spacing)
export const SPACING = {
  XS: '0.25rem', // 4px
  SM: '0.5rem',  // 8px
  MD: '1rem',    // 16px
  LG: '1.5rem',  // 24px
  XL: '2rem',    // 32px
  '2XL': '3rem', // 48px
  '3XL': '4rem', // 64px
  '4XL': '6rem', // 96px
} as const;

// 폰트 크기
export const FONT_SIZE = {
  XS: '0.75rem',   // 12px
  SM: '0.875rem',  // 14px
  BASE: '1rem',    // 16px
  LG: '1.125rem',  // 18px
  XL: '1.25rem',   // 20px
  '2XL': '1.5rem', // 24px
  '3XL': '1.875rem', // 30px
  '4XL': '2.25rem',  // 36px
  '5XL': '3rem',     // 48px
  '6XL': '3.75rem',  // 60px
} as const;

// 폰트 굵기
export const FONT_WEIGHT = {
  THIN: 100,
  LIGHT: 300,
  NORMAL: 400,
  MEDIUM: 500,
  SEMIBOLD: 600,
  BOLD: 700,
  EXTRABOLD: 800,
  BLACK: 900,
} as const;

// 라인 높이
export const LINE_HEIGHT = {
  NONE: 1,
  TIGHT: 1.25,
  SNUG: 1.375,
  NORMAL: 1.5,
  RELAXED: 1.625,
  LOOSE: 2,
} as const;

// 테두리 반경
export const BORDER_RADIUS = {
  NONE: '0',
  SM: '0.125rem',  // 2px
  BASE: '0.25rem', // 4px
  MD: '0.375rem',  // 6px
  LG: '0.5rem',    // 8px
  XL: '0.75rem',   // 12px
  '2XL': '1rem',   // 16px
  '3XL': '1.5rem', // 24px
  FULL: '9999px',
} as const;

// 그림자
export const SHADOWS = {
  SM: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  BASE: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  MD: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  LG: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  XL: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2XL': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  INNER: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  NONE: '0 0 #0000',
} as const;

// 애니메이션
export const ANIMATION = {
  DURATION: {
    FAST: '150ms',
    NORMAL: '300ms',
    SLOW: '500ms',
  },
  EASING: {
    LINEAR: 'linear',
    EASE_IN: 'cubic-bezier(0.4, 0, 1, 1)',
    EASE_OUT: 'cubic-bezier(0, 0, 0.2, 1)',
    EASE_IN_OUT: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  DELAY: {
    FAST: '100ms',
    NORMAL: '200ms',
    SLOW: '300ms',
  },
} as const;

// 브레이크포인트
export const BREAKPOINTS = {
  SM: '640px',
  MD: '768px',
  LG: '1024px',
  XL: '1280px',
  '2XL': '1536px',
} as const;

// Z-인덱스
export const Z_INDEX = {
  DROPDOWN: 1000,
  STICKY: 1020,
  FIXED: 1030,
  MODAL_BACKDROP: 1040,
  MODAL: 1050,
  POPOVER: 1060,
  TOOLTIP: 1070,
} as const;

// 아이콘 크기
export const ICON_SIZE = {
  XS: '0.75rem',   // 12px
  SM: '1rem',      // 16px
  MD: '1.25rem',   // 20px
  LG: '1.5rem',    // 24px
  XL: '2rem',      // 32px
  '2XL': '2.5rem', // 40px
  '3XL': '3rem',   // 48px
} as const;

// 버튼 크기
export const BUTTON_SIZE = {
  SM: {
    PADDING: '0.5rem 1rem',
    FONT_SIZE: FONT_SIZE.SM,
    BORDER_RADIUS: BORDER_RADIUS.MD,
  },
  MD: {
    PADDING: '0.75rem 1.5rem',
    FONT_SIZE: FONT_SIZE.BASE,
    BORDER_RADIUS: BORDER_RADIUS.MD,
  },
  LG: {
    PADDING: '1rem 2rem',
    FONT_SIZE: FONT_SIZE.LG,
    BORDER_RADIUS: BORDER_RADIUS.LG,
  },
} as const;

// 입력 필드 크기
export const INPUT_SIZE = {
  SM: {
    PADDING: '0.5rem 0.75rem',
    FONT_SIZE: FONT_SIZE.SM,
    BORDER_RADIUS: BORDER_RADIUS.MD,
  },
  MD: {
    PADDING: '0.75rem 1rem',
    FONT_SIZE: FONT_SIZE.BASE,
    BORDER_RADIUS: BORDER_RADIUS.MD,
  },
  LG: {
    PADDING: '1rem 1.25rem',
    FONT_SIZE: FONT_SIZE.LG,
    BORDER_RADIUS: BORDER_RADIUS.LG,
  },
} as const; 