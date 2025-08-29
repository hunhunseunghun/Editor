import { TreeNode, isFolderNode } from '@/types/tree';
import { Folder, Document } from '@/types/entities';

// 트리 노드 변환 유틸리티 함수들

/**
 * 기본 TreeNode 객체 생성
 */
export function createTreeNode(
  id: string,
  name: string,
  type: 'document' | 'folder',
  parentId: string | null = null,
): TreeNode {
  return {
    id,
    name,
    type,
    parentId,
    children: [],
    folderId: null,
    order: 0,
    createdAt: null,
    updatedAt: null,
    isLocked: false,
    isDeleted: false,
  };
}

/**
 * 폴더 노드 생성
 */
export function createFolderNode(
  id: string,
  name: string,
  parentId: string | null = null,
): TreeNode {
  return {
    id,
    name,
    type: 'folder',
    parentId,
    children: [],
    folderId: null,
    order: 0,
    createdAt: null,
    updatedAt: null,
    isLocked: false,
    isDeleted: false,
  };
}

/**
 * 문서 노드 생성
 */
export function createDocumentNode(
  id: string,
  name: string,
  parentId: string | null = null,
  folderId: string | null = null,
): TreeNode {
  return {
    id,
    name,
    type: 'document',
    parentId,
    children: [],
    folderId,
    order: 0,
    createdAt: null,
    updatedAt: null,
    isLocked: false,
    isDeleted: false,
  };
}

/**
 * 폴더와 문서를 트리 구조로 변환
 */
export const transformToTreeData = (
  folders: Folder[],
  documents: Document[],
): TreeNode[] => {
  const treeData: TreeNode[] = [];

  // 폴더를 트리 구조로 변환
  const folderMap = new Map<string, TreeNode>();

  folders.forEach((folder) => {
    const treeNode: TreeNode = {
      id: folder._id,
      name: folder.name,
      type: 'folder',
      children: [],
      folderId: null,
      order: folder.order,
      createdAt:
        folder.createdAt instanceof Date
          ? folder.createdAt.toISOString()
          : folder.createdAt,
      updatedAt:
        folder.updatedAt instanceof Date
          ? folder.updatedAt.toISOString()
          : folder.updatedAt,
      parentId: folder.parentId,
      isLocked: folder.isLocked || false,
      isDeleted: folder.isDeleted || false,
    };

    folderMap.set(folder._id, treeNode);
  });

  // 폴더 계층 구조 구성
  folders.forEach((folder) => {
    const treeNode = folderMap.get(folder._id)!;

    if (folder.parentId) {
      const parentNode = folderMap.get(folder.parentId);
      if (parentNode && isFolderNode(parentNode)) {
        parentNode.children.push(treeNode);
      }
    } else {
      treeData.push(treeNode);
    }
  });

  // 문서를 해당 폴더에 추가
  documents.forEach((document) => {
    const treeNode: TreeNode = {
      id: document._id,
      name: document.title,
      type: 'document',
      children: [],
      folderId: document.folderId,
      order: document.order,
      createdAt:
        document.createdAt instanceof Date
          ? document.createdAt.toISOString()
          : document.createdAt,
      updatedAt:
        document.updatedAt instanceof Date
          ? document.updatedAt.toISOString()
          : document.updatedAt,
      parentId: document.folderId,
      isLocked: document.isLocked || false,
      isDeleted: document.isDeleted || false,
    };

    if (document.folderId) {
      const parentFolder = folderMap.get(document.folderId);
      if (parentFolder && isFolderNode(parentFolder)) {
        parentFolder.children.push(treeNode);
      }
    } else {
      treeData.push(treeNode);
    }
  });

  return treeData;
};

/**
 * 트리를 평면화
 */
export const flattenTreeData = (treeData: TreeNode[]): TreeNode[] => {
  const flattened: TreeNode[] = [];

  const traverse = (nodes: TreeNode[]) => {
    nodes.forEach((node) => {
      flattened.push(node);
      if (node.children && node.children.length > 0) {
        traverse(node.children);
      }
    });
  };

  traverse(treeData);
  return flattened;
};

/**
 * 트리에서 특정 ID의 노드 찾기
 */
export const findNodeById = (
  treeData: TreeNode[],
  id: string,
): TreeNode | null => {
  for (const node of treeData) {
    if (node.id === id) {
      return node;
    }
    if (node.children) {
      const found = findNodeById(node.children, id);
      if (found) return found;
    }
  }
  return null;
};

/**
 * 트리에서 특정 조건의 노드들 찾기
 */
export const findNodesByCondition = (
  treeData: TreeNode[],
  condition: (node: TreeNode) => boolean,
): TreeNode[] => {
  const results: TreeNode[] = [];

  const traverse = (nodes: TreeNode[]) => {
    nodes.forEach((node) => {
      if (condition(node)) {
        results.push(node);
      }
      if (node.children) {
        traverse(node.children);
      }
    });
  };

  traverse(treeData);
  return results;
};

/**
 * 트리 구조 검증
 */
export const validateTreeStructure = (treeData: TreeNode[]): boolean => {
  const visited = new Set<string>();

  const traverse = (nodes: TreeNode[], parentId?: string): boolean => {
    for (const node of nodes) {
      // 중복 ID 체크
      if (visited.has(node.id)) {
        console.error(`Duplicate node ID found: ${node.id}`);
        return false;
      }
      visited.add(node.id);

      // 필수 필드 체크
      if (!node.id || !node.name || !node.type) {
        console.error(`Invalid node structure:`, node);
        return false;
      }

      // 타입 체크
      if (node.type === 'folder' && !node.children) {
        console.error(`Folder node must have children array:`, node);
        return false;
      }

      // 부모-자식 관계 체크
      if (parentId && node.parentId !== parentId) {
        console.error(`Parent-child relationship mismatch:`, node);
        return false;
      }

      // 재귀적으로 자식 노드들 검증
      if (node.children && !traverse(node.children, node.id)) {
        return false;
      }
    }
    return true;
  };

  return traverse(treeData);
};
