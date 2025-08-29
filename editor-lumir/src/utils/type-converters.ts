// ===== 타입 변환 유틸리티 =====

import { ObjectId } from 'mongodb';
import { User, Folder, Document } from '@/types/entities';
import {
  TreeNode,
  TreeNodeData,
  convertToTreeNode,
  convertFromTreeNode,
} from '@/types/tree';
import { DEFAULT_VALUES } from '@/types/defaults';

// ===== 기본 변환 유틸리티 =====

/**
 * ObjectId를 문자열로 변환
 */
export const objectIdToString = (
  id: ObjectId | string | null,
): string | null => {
  if (!id) return null;
  return typeof id === 'string' ? id : id.toString();
};

/**
 * 문자열을 ObjectId로 변환
 */
export const stringToObjectId = (id: string | null): ObjectId | null => {
  if (!id) return null;
  try {
    return new ObjectId(id);
  } catch {
    return null;
  }
};

/**
 * 날짜를 ISO 문자열로 변환
 */
export const dateToISOString = (date: Date | string | null): string | null => {
  if (!date) return null;
  return typeof date === 'string' ? date : date.toISOString();
};

/**
 * ISO 문자열을 Date로 변환
 */
export const isoStringToDate = (dateString: string | null): Date | null => {
  if (!dateString) return null;
  try {
    return new Date(dateString);
  } catch {
    return null;
  }
};

// ===== 엔티티 변환 함수들 =====

/**
 * User 엔티티 변환 함수들
 */
export const userConverters = {
  /**
   * 기본값으로 User 초기화
   */
  create: (data: Partial<User>): User => ({
    _id: data._id || new ObjectId().toString(),
    email: data.email || '',
    name: data.name || '',
    hashedPassword: data.hashedPassword ?? DEFAULT_VALUES.user.hashedPassword,
    avatarUrl: data.avatarUrl ?? DEFAULT_VALUES.user.avatarUrl,
    createdAt: data.createdAt || new Date(),
    updatedAt: data.updatedAt || new Date(),
    deletedAt: data.deletedAt ?? DEFAULT_VALUES.user.deletedAt,
  }),

  /**
   * User 업데이트 (기존 값 유지)
   */
  update: (existing: User, updates: Partial<User>): User => ({
    ...existing,
    ...updates,
    updatedAt: new Date(),
  }),

  /**
   * User를 JSON으로 직렬화
   */
  toJSON: (user: User) => ({
    ...user,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
    deletedAt: user.deletedAt?.toISOString() || null,
  }),

  /**
   * JSON에서 User로 역직렬화
   */
  fromJSON: (json: any): User => ({
    ...json,
    createdAt: new Date(json.createdAt),
    updatedAt: new Date(json.updatedAt),
    deletedAt: json.deletedAt ? new Date(json.deletedAt) : null,
  }),
};

/**
 * Folder 엔티티 변환 함수들
 */
export const folderConverters = {
  /**
   * 기본값으로 Folder 초기화
   */
  create: (data: Partial<Folder>): Folder => ({
    _id: data._id || new ObjectId().toString(),
    name: data.name || '',
    user: data.user || '',
    parentId: data.parentId ?? DEFAULT_VALUES.folder.parentId,
    children: data.children ?? DEFAULT_VALUES.folder.children,
    order: data.order || 0,
    isExpanded: data.isExpanded ?? DEFAULT_VALUES.folder.isExpanded,
    isLocked: data.isLocked || false,
    isDeleted: data.isDeleted || false,
    isHiddenFromTrash: data.isHiddenFromTrash || false,
    createdAt: data.createdAt || new Date(),
    updatedAt: data.updatedAt || new Date(),
    deletedAt: data.deletedAt ?? DEFAULT_VALUES.folder.deletedAt,
  }),

  /**
   * Folder 업데이트 (기존 값 유지)
   */
  update: (existing: Folder, updates: Partial<Folder>): Folder => ({
    ...existing,
    ...updates,
    updatedAt: new Date(),
  }),

  /**
   * Folder를 JSON으로 직렬화
   */
  toJSON: (folder: Folder) => ({
    ...folder,
    children: folder.children.map(folderConverters.toJSON),
    createdAt: folder.createdAt.toISOString(),
    updatedAt: folder.updatedAt.toISOString(),
    deletedAt: folder.deletedAt?.toISOString() || null,
  }),

  /**
   * JSON에서 Folder로 역직렬화
   */
  fromJSON: (json: any): Folder => ({
    ...json,
    children: json.children?.map(folderConverters.fromJSON) || [],
    createdAt: new Date(json.createdAt),
    updatedAt: new Date(json.updatedAt),
    deletedAt: json.deletedAt ? new Date(json.deletedAt) : null,
  }),
};

/**
 * Document 엔티티 변환 함수들
 */
export const documentConverters = {
  /**
   * 기본값으로 Document 초기화
   */
  create: (data: Partial<Document>): Document => ({
    _id: data._id || new ObjectId().toString(),
    title: data.title || '',
    content: data.content || [],
    author: data.author || '',
    folderId: data.folderId ?? DEFAULT_VALUES.document.folderId,
    order: data.order || 0,
    isLocked: data.isLocked || false,
    isDeleted: data.isDeleted || false,
    isHiddenFromTrash: data.isHiddenFromTrash || false,
    createdAt: data.createdAt || new Date(),
    updatedAt: data.updatedAt || new Date(),
    deletedAt: data.deletedAt ?? DEFAULT_VALUES.document.deletedAt,
  }),

  /**
   * Document 업데이트 (기존 값 유지)
   */
  update: (existing: Document, updates: Partial<Document>): Document => ({
    ...existing,
    ...updates,
    updatedAt: new Date(),
  }),

  /**
   * Document를 JSON으로 직렬화
   */
  toJSON: (document: Document) => ({
    ...document,
    content: document.content, // Block[]는 이미 직렬화 가능
    createdAt: document.createdAt.toISOString(),
    updatedAt: document.updatedAt.toISOString(),
    deletedAt: document.deletedAt?.toISOString() || null,
  }),

  /**
   * JSON에서 Document로 역직렬화
   */
  fromJSON: (json: any): Document => ({
    ...json,
    content: json.content || [],
    createdAt: new Date(json.createdAt),
    updatedAt: new Date(json.updatedAt),
    deletedAt: json.deletedAt ? new Date(json.deletedAt) : null,
  }),
};

// ===== 트리 노드 변환 함수들 =====

/**
 * TreeNode 변환 함수들
 */
export const treeNodeConverters = {
  /**
   * 기본값으로 TreeNode 초기화
   */
  create: (data: Partial<TreeNode>): TreeNode => {
    const nodeType = data.type || 'document';
    const baseNode = {
      id: data.id || new ObjectId().toString(),
      name: data.name || '',
      type: nodeType,
      parentId: data.parentId ?? DEFAULT_VALUES.treeNode.parentId,
      order: data.order ?? DEFAULT_VALUES.treeNode.order,
      createdAt: data.createdAt ?? DEFAULT_VALUES.treeNode.createdAt,
      updatedAt: data.updatedAt ?? DEFAULT_VALUES.treeNode.updatedAt,
      isLocked: data.isLocked ?? DEFAULT_VALUES.treeNode.isLocked,
      isDeleted: data.isDeleted ?? DEFAULT_VALUES.treeNode.isDeleted,
    };

    if (nodeType === 'folder') {
      return {
        ...baseNode,
        type: 'folder',
        children: data.children ?? DEFAULT_VALUES.treeNode.children,
        folderId: null,
      } as TreeNode;
    } else {
      return {
        ...baseNode,
        type: 'document',
        children: [],
        folderId: data.folderId ?? DEFAULT_VALUES.treeNode.folderId,
      } as TreeNode;
    }
  },

  /**
   * TreeNode 업데이트 (기존 값 유지)
   */
  update: (existing: TreeNode, updates: Partial<TreeNode>): TreeNode =>
    ({
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    } as TreeNode),

  /**
   * TreeNode를 TreeNodeData로 변환
   */
  toTreeNodeData: (node: TreeNode): TreeNodeData => ({
    _id: node.id,
    name: node.name,
    type: node.type,
    parentId: node.parentId,
    children: node.children.map(treeNodeConverters.toTreeNodeData),
    folderId: node.folderId,
    order: node.order,
    createdAt: node.createdAt || new Date().toISOString(),
    updatedAt: node.updatedAt || new Date().toISOString(),
    isLocked: node.isLocked,
    isDeleted: node.isDeleted,
  }),

  /**
   * TreeNodeData를 TreeNode로 변환
   */
  fromTreeNodeData: (data: TreeNodeData): TreeNode => {
    const baseNode = {
      id: data._id,
      name: data.name,
      type: data.type,
      parentId: data.parentId,
      order: data.order,
      createdAt: dateToISOString(data.createdAt),
      updatedAt: dateToISOString(data.updatedAt),
      isLocked: data.isLocked,
      isDeleted: data.isDeleted,
    };

    if (data.type === 'folder') {
      return {
        ...baseNode,
        type: 'folder',
        children: data.children.map(treeNodeConverters.fromTreeNodeData),
        folderId: null,
      } as TreeNode;
    } else {
      return {
        ...baseNode,
        type: 'document',
        children: [],
        folderId: data.folderId,
      } as TreeNode;
    }
  },
};

/**
 * TreeNodeData를 TreeNode로 변환
 * tree.ts의 convertToTreeNode 함수 사용
 */
export const convertTreeNodeDataToTreeNode = convertToTreeNode;

/**
 * TreeNode를 TreeNodeData로 변환
 * tree.ts의 convertFromTreeNode 함수 사용
 */
export const convertTreeNodeToTreeNodeData = convertFromTreeNode;

/**
 * 일반 객체를 TreeNode로 변환
 * React Arborist 공식 API에 맞춰 collapsed 필드 제거
 */
export function convertObjectToTreeNode(obj: any): TreeNode {
  return {
    id: obj.id || obj._id || '',
    name: obj.name || obj.title || 'Untitled',
    type: obj.type || 'document',
    parentId: obj.parentId || null,
    children: obj.children ? obj.children.map(convertObjectToTreeNode) : [],
    folderId: obj.folderId || null,
    order: obj.order || 0,
    isLocked: obj.isLocked || false,
    isDeleted: obj.isDeleted || false,
    createdAt: obj.createdAt || null,
    updatedAt: obj.updatedAt || null,
  };
}

/**
 * TreeNode를 일반 객체로 변환
 * React Arborist 공식 API에 맞춰 collapsed 필드 제거
 */
export function convertTreeNodeToObject(node: TreeNode): any {
  return {
    id: node.id,
    name: node.name,
    type: node.type,
    parentId: node.parentId,
    children: node.children.map(convertTreeNodeToObject),
    folderId: node.folderId,
    order: node.order,
    isLocked: node.isLocked,
    isDeleted: node.isDeleted,
    createdAt: node.createdAt,
    updatedAt: node.updatedAt,
  };
}

// ===== 통합 변환 유틸리티 =====

/**
 * 통합 타입 변환 유틸리티
 */
export const typeConverters = {
  user: userConverters,
  folder: folderConverters,
  document: documentConverters,
  treeNode: {
    fromData: convertTreeNodeDataToTreeNode,
    toData: convertTreeNodeToTreeNodeData,
    fromObject: convertObjectToTreeNode,
    toObject: convertTreeNodeToObject,
  },

  /**
   * 모든 변환 함수들을 한 곳에서 접근
   */
  utils: {
    objectIdToString,
    stringToObjectId,
    dateToISOString,
    isoStringToDate,
  },
};

// ===== 타입 가드 함수들 =====

/**
 * 타입 검증 함수들
 */
export const typeGuards = {
  /**
   * User 타입 검증
   */
  isUser: (obj: any): obj is User => {
    return (
      typeof obj === 'object' &&
      obj !== null &&
      typeof obj._id === 'string' &&
      typeof obj.email === 'string' &&
      typeof obj.name === 'string' &&
      (obj.hashedPassword === null || typeof obj.hashedPassword === 'string') &&
      (obj.avatarUrl === null || typeof obj.avatarUrl === 'string')
    );
  },

  /**
   * Folder 타입 검증
   */
  isFolder: (obj: any): obj is Folder => {
    return (
      typeof obj === 'object' &&
      obj !== null &&
      typeof obj._id === 'string' &&
      typeof obj.name === 'string' &&
      typeof obj.user === 'string' &&
      (obj.parentId === null || typeof obj.parentId === 'string') &&
      Array.isArray(obj.children) &&
      typeof obj.order === 'number'
    );
  },

  /**
   * Document 타입 검증
   */
  isDocument: (obj: any): obj is Document => {
    return (
      typeof obj === 'object' &&
      obj !== null &&
      typeof obj._id === 'string' &&
      typeof obj.title === 'string' &&
      Array.isArray(obj.content) &&
      typeof obj.author === 'string' &&
      (obj.folderId === null || typeof obj.folderId === 'string') &&
      typeof obj.order === 'number'
    );
  },

  /**
   * TreeNode 타입 검증
   */
  isTreeNode: (obj: unknown): obj is TreeNode => {
    return (
      typeof obj === 'object' &&
      obj !== null &&
      typeof (obj as any).id === 'string' &&
      typeof (obj as any).name === 'string' &&
      ((obj as any).type === 'document' || (obj as any).type === 'folder') &&
      ((obj as any).parentId === null ||
        typeof (obj as any).parentId === 'string') &&
      Array.isArray((obj as any).children)
    );
  },
};

// ===== TreeNode 타입 가드 함수들 (tree.ts에서 이동) =====

/**
 * 폴더 타입 가드
 */
export const isFolder = (
  node: TreeNode,
): node is TreeNode & { children: TreeNode[] } => {
  return node.type === 'folder';
};

/**
 * 문서 타입 가드
 */
export const isDocument = (
  node: TreeNode,
): node is TreeNode & { children?: never } => {
  return node.type === 'document';
};

/**
 * 내부 노드 타입 가드
 */
export const isInternalNode = (node: TreeNode): boolean => {
  return node.type === 'folder';
};

/**
 * 리프 노드 타입 가드
 */
export const isLeafNode = (node: TreeNode): boolean => {
  return node.type === 'document';
};

/**
 * 자식 노드 존재 여부 확인
 */
export const hasChildren = (node: TreeNode): boolean => {
  return node.children && node.children.length > 0;
};

/**
 * 자식 노드 목록 반환
 */
export const getNodeChildren = (node: TreeNode): TreeNode[] => {
  return node.children || [];
};

/**
 * 노드 잠금 상태 확인
 */
export const isNodeLocked = (node: TreeNode): boolean => {
  return node.isLocked || false;
};

/**
 * 노드 삭제 상태 확인
 */
export const isNodeDeleted = (node: TreeNode): boolean => {
  return node.isDeleted || false;
};
