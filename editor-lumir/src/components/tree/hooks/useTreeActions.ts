import { useCallback } from 'react';
import { TreeNode } from '@/types/common';
import { validateNodeName } from '../utils/treeHelpers';
import {
  CreateHandler,
  DeleteHandler,
  MoveHandler,
  RenameHandler,
  NodeApi,
} from 'react-arborist';

// ===== 트리 액션 관리 커스텀 훅 =====

export const useTreeActions = () => {
  // 노드 생성 핸들러
  const handleCreate = useCallback<CreateHandler<TreeNode>>((args) => {
    const { parentId, type } = args;

    const newNode: TreeNode = {
      id: `${type === 'internal' ? 'folder' : 'doc'}-${Date.now()}`,
      name: type === 'internal' ? '새 폴더' : '새 문서',
      type: type === 'internal' ? 'folder' : 'document',
      children: type === 'internal' ? [] : [],
      order: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      parentId: parentId || null,
      folderId: null,
      isLocked: false,
      isDeleted: false,
    };

    return { id: newNode.id };
  }, []);

  // 노드 삭제 핸들러
  const handleDelete = useCallback<DeleteHandler<TreeNode>>(() => {
    // 실제 삭제 로직은 상위 컴포넌트에서 처리
  }, []);

  // 노드 이동 핸들러
  const handleMove = useCallback<MoveHandler<TreeNode>>(() => {
    // 실제 이동 로직은 상위 컴포넌트에서 처리
  }, []);

  // 노드 이름 변경 핸들러
  const handleRename = useCallback<RenameHandler<TreeNode>>((args) => {
    const { name } = args;

    // 이름 유효성 검사
    if (!validateNodeName(name)) {
      console.error('Invalid node name:', name);
      return;
    }

    // 실제 이름 변경 로직은 상위 컴포넌트에서 처리
  }, []);

  // 노드 토글 핸들러
  const handleToggle = useCallback(() => {
    // 실제 토글 로직은 상위 컴포넌트에서 처리
  }, []);

  // 노드 선택 핸들러
  const handleSelect = useCallback(() => {
    // 실제 선택 로직은 상위 컴포넌트에서 처리
  }, []);

  // 노드 활성화 핸들러
  const handleActivate = useCallback(() => {
    // 실제 활성화 로직은 상위 컴포넌트에서 처리
  }, []);

  // 검색 매칭 핸들러
  const handleSearchMatch = useCallback(
    (node: NodeApi<TreeNode>, searchTerm: string) => {
      if (!searchTerm) return true;
      return node.data.name.toLowerCase().includes(searchTerm.toLowerCase());
    },
    [],
  );

  // 드래그 가능 여부 핸들러
  const handleCanDrag = useCallback((node: TreeNode) => {
    // 잠긴 노드나 삭제된 노드는 드래그 불가
    if (node.isLocked || node.isDeleted) {
      return false;
    }
    return true;
  }, []);

  // 드롭 가능 여부 핸들러
  const handleCanDrop = useCallback(
    (dragNode: TreeNode, dropNode: TreeNode) => {
      // 자기 자신에게는 드롭 불가
      if (dragNode.id === dropNode.id) {
        return false;
      }

      // 삭제된 노드에는 드롭 불가
      if (dropNode.isDeleted) {
        return false;
      }

      // 폴더에만 드롭 가능
      if (dropNode.type !== 'folder') {
        return false;
      }

      return true;
    },
    [],
  );

  return {
    // 이벤트 핸들러들
    handleCreate,
    handleDelete,
    handleMove,
    handleRename,
    handleToggle,
    handleSelect,
    handleActivate,

    // 조건 핸들러들
    handleSearchMatch,
    handleCanDrag,
    handleCanDrop,
  };
};
