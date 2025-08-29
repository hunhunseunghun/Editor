import { TreeNode } from '@/types/common';
import { NodeApi } from 'react-arborist';

// ===== 트리 헬퍼 함수들 =====

/**
 * 날짜 포맷팅 함수
 */
export const formatDate = (date: Date | string | null | undefined): string => {
  if (!date) return '알 수 없음';

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffInSeconds = Math.floor(
      (now.getTime() - dateObj.getTime()) / 1000,
    );

    if (diffInSeconds < 60) return '방금전';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분전`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}시간전`;
    if (diffInSeconds < 2592000)
      return `${Math.floor(diffInSeconds / 86400)}일전`;

    return dateObj.toLocaleDateString('ko-KR');
  } catch (error) {
    console.error('날짜 포맷팅 오류:', error);
    return '방금전';
  }
};

/**
 * 노드 타입에 따른 아이콘 반환
 */
export const getNodeIcon = (node: TreeNode): string => {
  switch (node.type) {
    case 'folder':
      return '📁';
    case 'document':
      return '📄';
    default:
      return '📄';
  }
};

/**
 * 노드 상태에 따른 CSS 클래스 반환
 */
export const getNodeClassName = (
  node: NodeApi<TreeNode>,
  isSelected: boolean,
  isEditing: boolean,
  willReceiveDrop: boolean,
): string => {
  const classes = [
    'flex',
    'items-center',
    'px-2',
    'py-1',
    'cursor-pointer',
    'relative',
  ];

  if (isSelected) classes.push('bg-gray-300/70');
  if (isEditing) classes.push('bg-gray-300');
  if (willReceiveDrop) classes.push('bg-blue-500/20');

  return classes.join(' ');
};

/**
 * 노드 ID 생성
 */
export const generateNodeId = (type: 'folder' | 'document'): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return `${type}-${timestamp}-${random}`;
};

/**
 * 노드 이름 검증
 */
export const validateNodeName = (name: string): boolean => {
  if (!name || name.trim().length === 0) return false;
  if (name.trim().length > 100) return false;
  return true;
};

/**
 * 노드 순서 계산
 */
export const calculateNodeOrder = (siblings: TreeNode[]): number => {
  if (siblings.length === 0) return 0;

  const maxOrder = Math.max(...siblings.map((node) => node.order || 0));
  return maxOrder + 1;
};

/**
 * 노드 경로 생성
 */
export const getNodePath = (treeData: TreeNode[], nodeId: string): string[] => {
  const path: string[] = [];

  const findPath = (
    nodes: TreeNode[],
    targetId: string,
    currentPath: string[],
  ): boolean => {
    for (const node of nodes) {
      const newPath = [...currentPath, node.name];

      if (node.id === targetId) {
        path.push(...newPath);
        return true;
      }

      if (node.children && findPath(node.children, targetId, newPath)) {
        return true;
      }
    }
    return false;
  };

  findPath(treeData, nodeId, []);
  return path;
};

/**
 * 노드 깊이 계산
 */
export const getNodeDepth = (treeData: TreeNode[], nodeId: string): number => {
  const findDepth = (
    nodes: TreeNode[],
    targetId: string,
    currentDepth: number,
  ): number => {
    for (const node of nodes) {
      if (node.id === targetId) {
        return currentDepth;
      }

      if (node.children) {
        const depth = findDepth(node.children, targetId, currentDepth + 1);
        if (depth !== -1) return depth;
      }
    }
    return -1;
  };

  return findDepth(treeData, nodeId, 0);
};

/**
 * 노드가 잠겨있는지 확인
 */
export const isNodeLocked = (node: TreeNode): boolean => {
  return node.isLocked || false;
};

/**
 * 노드가 삭제되었는지 확인
 */
export const isNodeDeleted = (node: TreeNode): boolean => {
  return node.isDeleted || false;
};

/**
 * 노드가 폴더인지 확인
 */
export const isNodeFolder = (node: TreeNode): boolean => {
  return node.type === 'folder';
};

/**
 * 노드가 문서인지 확인
 */
export const isNodeDocument = (node: TreeNode): boolean => {
  return node.type === 'document';
};
