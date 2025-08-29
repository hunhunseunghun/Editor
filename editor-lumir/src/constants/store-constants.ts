// 업데이트 타입 상수
export const UPDATE_TYPES = {
  TITLE: 'title',
  CONTENT: 'content',
  DELETE: 'delete',
  CREATE: 'create',
  RESTORE: 'restore',
} as const;

export type UpdateType = (typeof UPDATE_TYPES)[keyof typeof UPDATE_TYPES];

// 초기 상태 상수들
export const INITIAL_LAYOUT_STATE = {
  isMinimized: false, // 기본적으로 사이드바가 열린 상태로 시작
  sidebarUpdateTrigger: 0,
  lastUpdateType: null,
  lastUpdateId: null,
} as const;
