import { Folder, Document } from '@/types/entities';
import { TreeNode, FolderNode, DocumentNode, isFolderNode } from '@/types/tree';

/**
 * 타입 안전한 날짜 변환 함수
 */
const convertDate = (date: string | Date | null): string | null => {
  if (!date) return null;
  if (typeof date === 'string') return date;
  return date.toISOString();
};

/**
 * 문서를 DocumentNode로 변환
 * Context7 권장사항: 문서는 항상 leaf node
 */
export const convertDocumentToNode = (doc: Document): DocumentNode => {
  // folderId가 undefined인 경우 null로 변환
  const safeFolderId = doc.folderId === undefined ? null : doc.folderId;

  return {
    id: doc._id,
    name: doc.title || 'Untitled',
    type: 'document',
    parentId: safeFolderId,
    children: [], // 문서는 항상 leaf node
    folderId: safeFolderId,
    order: doc.order || 0,
    createdAt: convertDate(doc.createdAt),
    updatedAt: convertDate(doc.updatedAt),
    isLocked: doc.isLocked || false,
    isDeleted: doc.isDeleted || false,
  };
};

/**
 * 폴더를 FolderNode로 변환 (재귀적)
 * Context7 권장사항: 폴더는 children을 가질 수 있음
 */
export const convertFolderToNode = (
  folder: Folder,
  allFolders: Folder[],
  allDocuments: Document[],
): FolderNode => {
  // parentId가 undefined인 경우 null로 변환
  const safeParentId = folder.parentId === undefined ? null : folder.parentId;

  // 이 폴더에 속한 문서들 찾기
  const folderDocuments = allDocuments
    .filter((d) => d.folderId === folder._id)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map(convertDocumentToNode);

  // 이 폴더의 자식 폴더들 찾기 (재귀적)
  const childFolders = allFolders
    .filter((f) => f.parentId === folder._id)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((childFolder) => {
      return convertFolderToNode(childFolder, allFolders, allDocuments);
    });

  const allChildren = [...childFolders, ...folderDocuments];

  return {
    id: folder._id,
    name: folder.name,
    type: 'folder',
    parentId: safeParentId,
    children: allChildren, // 폴더는 children을 가질 수 있음
    folderId: null,
    order: folder.order || 0,
    createdAt: convertDate(folder.createdAt),
    updatedAt: convertDate(folder.updatedAt),
    isLocked: folder.isLocked || false,
    isDeleted: folder.isDeleted || false,
  };
};

/**
 * 메인 변환 함수 - 폴더와 문서 배열을 TreeNode 배열로 변환
 * Context7 권장사항: 중첩 구조로 올바르게 변환
 */
export const convertToTreeNodeArray = (
  folders: Folder[],
  documents: Document[],
): TreeNode[] => {
  try {
    // 루트 폴더들 (parentId가 null인 폴더들)
    const rootFolderCandidates = folders.filter((f) => !f.parentId);

    const rootFolders = rootFolderCandidates
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((folder) => {
        return convertFolderToNode(folder, folders, documents);
      });

    // 루트 문서들 (folderId가 null인 문서들)
    const rootDocumentCandidates = documents.filter((d) => !d.folderId);

    const rootDocuments = rootDocumentCandidates
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((doc) => {
        return convertDocumentToNode(doc);
      });

    // 최종 결과: 루트 폴더들 + 루트 문서들
    const result: TreeNode[] = [...rootFolders, ...rootDocuments];

    // 정렬 (폴더가 먼저, 그 다음 문서)
    result.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'folder' ? -1 : 1;
      }
      return (a.order || 0) - (b.order || 0);
    });

    return result;
  } catch {
    return [];
  }
};

/**
 * 타입 안전한 검증 함수
 * TreeNode가 올바른 구조를 가지고 있는지 검증
 */
export const validateTreeNode = (node: any): node is TreeNode => {
  if (!node || typeof node !== 'object') {
    return false;
  }

  if (!node.id || typeof node.id !== 'string') {
    return false;
  }

  if (!node.name || typeof node.name !== 'string') {
    return false;
  }

  if (node.type !== 'folder' && node.type !== 'document') {
    return false;
  }

  if (!Array.isArray(node.children)) {
    return false;
  }

  // 타입별 추가 검증
  if (node.type === 'folder') {
    if (node.folderId !== null) {
      return false;
    }
    // children의 모든 요소가 TreeNode인지 검증
    const validChildren = node.children.every(validateTreeNode);
    if (!validChildren) {
      return false;
    }
  } else {
    if (node.children.length !== 0) {
      return false;
    }
    // folderId가 undefined인 경우를 명시적으로 처리
    if (node.folderId === undefined) {
      return false;
    }
    if (typeof node.folderId !== 'string' && node.folderId !== null) {
      return false;
    }
  }

  return true;
};

/**
 * TreeNode 배열 전체 검증 함수
 */
export const validateTreeNodeArray = (nodes: any[]): nodes is TreeNode[] => {
  return nodes.every(validateTreeNode);
};

/**
 * 트리 구조에서 특정 ID의 노드를 찾는 함수
 */
export const findNodeById = (
  nodes: TreeNode[],
  id: string,
): TreeNode | null => {
  for (const node of nodes) {
    if (node.id === id) {
      return node;
    }
    if (isFolderNode(node) && node.children.length > 0) {
      const found = findNodeById(node.children, id);
      if (found) return found;
    }
  }
  return null;
};

/**
 * 트리 구조를 평면화하는 함수 (검색용)
 */
export const flattenTree = (nodes: TreeNode[]): TreeNode[] => {
  const result: TreeNode[] = [];

  const traverse = (nodeList: TreeNode[]) => {
    for (const node of nodeList) {
      result.push(node);
      if (isFolderNode(node) && node.children.length > 0) {
        traverse(node.children);
      }
    }
  };

  traverse(nodes);
  return result;
};
