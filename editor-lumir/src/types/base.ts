// ===== 기본 타입 정의 =====

/**
 * 모든 엔티티의 기본 구조
 * 고정 필드 + null 값 사용 방식 적용
 */
export interface BaseEntity {
  /** 엔티티 고유 식별자 - MongoDB ObjectId를 문자열로 저장 */
  _id: string;

  /** 생성 시간 - 엔티티 생성 시점 기록 */
  createdAt: Date;

  /** 수정 시간 - 마지막 업데이트 시점 기록 */
  updatedAt: Date;

  /** 삭제 시간 - 소프트 삭제 시점 기록, 활성 엔티티는 null */
  deletedAt: Date | null;
}

/**
 * 트리 노드의 기본 구조
 * UI 렌더링을 위한 공통 필드들
 * TreeNode의 기본 구조로 활용
 */
export interface BaseNode {
  /** 노드 고유 식별자 - 트리 구조에서 노드 구분 */
  id: string;

  /** 노드 표시명 - UI에서 표시될 이름 */
  name: string;

  /** 노드 타입 - document 또는 folder, 아이콘 및 동작 결정 */
  type: 'document' | 'folder';

  /** 상위 노드 ID - 트리 계층 구조 구현, 루트 노드는 null */
  parentId: string | null;

  /** 문서가 속한 폴더 ID - 문서 노드에서만 사용, 루트 문서는 null */
  folderId: string | null;

  /** 정렬 순서 - 사용자 정의 순서 */
  order: number;

  /** 편집 권한 제한 - 읽기 전용 상태 */
  isLocked: boolean;

  /** 삭제 상태 - 휴지통 기능 */
  isDeleted: boolean;

  /** 휴지통에서 숨김 상태 - 휴지통에서 삭제 시 true로 설정 */
  isHiddenFromTrash: boolean;
}
