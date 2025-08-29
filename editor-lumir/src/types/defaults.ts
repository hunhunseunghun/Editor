// ===== 타입별 기본값 정의 =====

/**
 * User 타입 기본값
 */
export const USER_DEFAULTS = {
  hashedPassword: null,
  avatarUrl: null,
  deletedAt: null,
} as const;

/**
 * Folder 타입 기본값
 */
export const FOLDER_DEFAULTS = {
  parentId: null,
  children: [] as any[],
  isExpanded: false,
  deletedAt: null,
} as const;

/**
 * Document 타입 기본값
 */
export const DOCUMENT_DEFAULTS = {
  folderId: null,
  deletedAt: null,
} as const;

/**
 * TreeNode 타입 기본값
 */
export const TREE_NODE_DEFAULTS = {
  parentId: null,
  children: [] as any[],
  folderId: null,
  order: 0,
  createdAt: null,
  updatedAt: null,
  isLocked: false,
  isDeleted: false,
} as const;

/**
 * 통합 기본값 객체
 */
export const DEFAULT_VALUES = {
  user: USER_DEFAULTS,
  folder: FOLDER_DEFAULTS,
  document: DOCUMENT_DEFAULTS,
  treeNode: TREE_NODE_DEFAULTS,
} as const;

/**
 * 기본값 적용 유틸리티 함수
 */
export const withDefaults = <T extends Record<string, any>>(
  data: Partial<T>,
  defaults: Partial<T>,
): T => ({ ...defaults, ...data } as T);

/**
 * null 체크 유틸리티 함수
 */
export const isNotNull = <T>(value: T | null): value is T => value !== null;
export const isNull = <T>(value: T | null): value is null => value === null;

/**
 * 기본값으로 초기화하는 유틸리티 함수
 */
export const createWithDefaults = {
  user: (data: Partial<import('./entities').User>) =>
    withDefaults(data, USER_DEFAULTS),

  folder: (data: Partial<import('./entities').Folder>) =>
    withDefaults(data, FOLDER_DEFAULTS),

  document: (data: Partial<import('./entities').Document>) =>
    withDefaults(data, DOCUMENT_DEFAULTS),

  treeNode: (data: Partial<import('./tree').TreeNode>) =>
    withDefaults(data, TREE_NODE_DEFAULTS),
};
