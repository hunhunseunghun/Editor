// ============================================================================
// 트리 유틸리티 호환성 레이어
// ============================================================================
// 이 파일은 기존 코드와의 호환성을 위해 유지됩니다.
// 새로운 코드에서는 개별 모듈을 직접 import하는 것을 권장합니다.

// 트리 구조 관리 유틸리티
export {
  flattenTree,
  buildTree,
  removeItem,
  removeChildrenOf,
  setProperty,
  getChildCount,
  findItem,
  getProjection,
  getDragDepth,
  getMaxDepth,
  getMinDepth,
} from '@/lib/tree/utilities';

// 트리 타입들
export type {
  TreeItem,
  FlattenedItem,
  SensorContext,
  Projection,
} from '@/types/tree';
