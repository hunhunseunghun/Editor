/**
 * 기본 노드 인터페이스 (공통 속성)
 */
interface BaseTreeNode {
  /** 노드 고유 식별자 */
  id: string;

  /** 노드 표시명 */
  name: string;

  /** 상위 노드 ID */
  parentId: string | null;

  /** 정렬 순서 */
  order: number;

  /** 생성 시간 - 날짜별 정렬 및 표시용, null 허용 */
  createdAt: string | null;

  /** 수정 시간 - 최근 수정일 표시용, null 허용 */
  updatedAt: string | null;

  /** 잠금 상태 */
  isLocked: boolean;

  /** 삭제 상태 */
  isDeleted: boolean;
}

/**
 * 폴더 노드 타입 (children을 가질 수 있음)
 */
export interface FolderNode extends BaseTreeNode {
  /** 노드 타입 - 폴더 */
  type: 'folder';

  /** 하위 노드 목록 - 트리 구조 표현 */
  children: TreeNode[];

  /** 문서가 속한 폴더 ID - 폴더는 항상 null */
  folderId: null;
}

/**
 * 문서 노드 타입 (leaf node - children을 가질 수 없음)
 */
export interface DocumentNode extends BaseTreeNode {
  /** 노드 타입 - 문서 */
  type: 'document';

  /** 하위 노드 목록 - 문서는 항상 빈 배열 */
  children: [];

  /** 문서가 속한 폴더 ID */
  folderId: string | null;
}

/**
 * React-arborist 트리 노드 타입 (UI 렌더링용)
 * Context7 권장사항: 문서는 leaf node, 폴더만 children을 가질 수 있음
 */
export type TreeNode = FolderNode | DocumentNode;

/**
 * 타입 가드 함수들
 */
export const isFolderNode = (node: TreeNode): node is FolderNode =>
  node.type === 'folder';

export const isDocumentNode = (node: TreeNode): node is DocumentNode =>
  node.type === 'document';

/**
 * 트리 노드 데이터 타입 (API 응답용)
 * BaseEntity를 기반으로 하되 트리 구조에 맞게 조정
 */
export interface TreeNodeData {
  /** 노드 고유 식별자 */
  _id: string;

  /** 노드 표시명 */
  name: string;

  /** 노드 타입 */
  type: 'document' | 'folder';

  /** 상위 노드 ID */
  parentId: string | null;

  /** 하위 노드 목록 */
  children: TreeNodeData[];

  /** 문서가 속한 폴더 ID */
  folderId: string | null;

  /** 정렬 순서 */
  order: number;

  /** 생성 시간 - Date 또는 ISO 문자열 */
  createdAt: string | Date;

  /** 수정 시간 - Date 또는 ISO 문자열 */
  updatedAt: string | Date;

  /** 잠금 상태 */
  isLocked: boolean;

  /** 삭제 상태 */
  isDeleted: boolean;
}

// ===== 트리 구조 업데이트 요청 타입 =====

/**
 * 트리 구조 업데이트 요청 타입
 */
export interface TreeUpdateRequest {
  updates: Array<{
    id: string;
    type: 'document' | 'folder';
    changes: {
      name?: string;
      folderId?: string | null;
      parentId?: string | null;
      order?: number;
    };
  }>;
}

/**
 * 트리 노드 생성 요청 타입
 */
export interface CreateNodeRequest {
  type: 'document' | 'folder';
  name: string;
  parentId?: string;
  folderId?: string;
}

/**
 * 트리 노드 삭제 요청 타입
 */
export interface DeleteNodeRequest {
  id: string;
  type: 'document' | 'folder';
  permanent?: boolean; // 영구 삭제 여부
}

// ===== 트리 구조 유틸리티 타입 =====

/**
 * 트리 아이템 타입 (드래그 앤 드롭용)
 */
export interface TreeItem {
  id: string;
  type: 'folder' | 'document';
  children: TreeItem[];
}

/**
 * 평면화된 아이템 타입 (검색 및 필터링용)
 */
export interface FlattenedItem {
  id: string;
  parentId: string | null;
  type: 'folder' | 'document';
  depth: number;
  children: string[];
}

/**
 * 센서 컨텍스트 타입 (드래그 앤 드롭 상태 관리)
 */
export interface SensorContext {
  items: FlattenedItem[];
  offset: number;
}

/**
 * 투영 타입 (트리 구조 변환용)
 */
export interface Projection {
  depth: number;
  parentId: string | null;
}

// ===== 타입 변환 유틸리티 함수 =====

/**
 * TreeNodeData를 TreeNode로 변환
 */
export const convertToTreeNode = (data: TreeNodeData): TreeNode => {
  const baseNode = {
    id: data._id,
    name: data.name,
    parentId: data.parentId,
    order: data.order,
    createdAt:
      typeof data.createdAt === 'string'
        ? data.createdAt
        : data.createdAt.toISOString(),
    updatedAt:
      typeof data.updatedAt === 'string'
        ? data.updatedAt
        : data.updatedAt.toISOString(),
    isLocked: data.isLocked,
    isDeleted: data.isDeleted,
  };

  if (data.type === 'folder') {
    return {
      ...baseNode,
      type: 'folder',
      children: data.children.map(convertToTreeNode),
      folderId: null,
    } as FolderNode;
  } else {
    return {
      ...baseNode,
      type: 'document',
      children: [],
      folderId: data.folderId,
    } as DocumentNode;
  }
};

/**
 * TreeNode를 TreeNodeData로 변환
 */
export const convertFromTreeNode = (node: TreeNode): TreeNodeData => {
  const baseData = {
    _id: node.id,
    name: node.name,
    parentId: node.parentId,
    order: node.order,
    createdAt: node.createdAt || new Date().toISOString(),
    updatedAt: node.updatedAt || new Date().toISOString(),
    isLocked: node.isLocked,
    isDeleted: node.isDeleted,
  };

  if (isFolderNode(node)) {
    return {
      ...baseData,
      type: 'folder',
      children: node.children.map(convertFromTreeNode),
      folderId: null,
    };
  } else {
    return {
      ...baseData,
      type: 'document',
      children: [],
      folderId: node.folderId,
    };
  }
};
