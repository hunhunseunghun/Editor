// ===== 공통 API 응답 타입 정의 =====

/**
 * API 응답 기본 구조
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

/**
 * API 에러 응답 구조
 */
export interface ApiError {
  success: false;
  error: string;
  message?: string;
  code?: string;
}

// ===== 기존 코드와의 호환성을 위한 간단한 재내보내기 =====
// 주의: 새로운 코드는 @/types에서 직접 import하는 것을 권장합니다.

// 기본 엔티티 타입들 (단일 소스 of truth)
export type {
  User,
  Folder,
  Document,
  SidebarFolder,
  SidebarDocument,
} from './entities';

// 트리 관련 타입들
export type {
  TreeNode,
  TreeNodeData,
  TreeUpdateRequest,
  CreateNodeRequest,
  DeleteNodeRequest,
  TreeItem,
  FlattenedItem,
  SensorContext,
  Projection,
  convertToTreeNode,
  convertFromTreeNode,
} from './tree';

// 기본 타입들
export type { BaseEntity, BaseNode } from './base';
