'use client';

import React, { useRef, useMemo, useCallback } from 'react';
import { Tree, TreeApi } from 'react-arborist';
import { TreeNode, isFolderNode } from '@/types/tree';
import { ArboristTreeProps } from './types/props.types';
import { cn } from '@/lib/utils';

import { TreeNode as TreeNodeComponent } from './components/TreeNode';

import { NodeApi } from 'react-arborist';

// ===== 개선된 ArboristTree 컴포넌트 =====
export const ArboristTree: React.FC<ArboristTreeProps> = ({
  data,
  initialData,
  // Controlled 모드 props
  nodes,
  opens,
  onCreate,
  onDelete,
  onMove,
  onRename,
  onToggle,
  onSelect,
  onActivate,
  searchTerm: externalSearchTerm,
  searchMatch: externalSearchMatch,
  canDrag,
  canDrop,
  disableDrag = false,
  disableDrop = false,
  width,
  height = 700,
  rowHeight = 30,
  indent = 24,
  paddingTop = 10,
  paddingBottom = 10,
  overscanCount = 1,
  childrenAccessor = (node) => {
    // 문서 타입은 절대 children을 가질 수 없음
    if (node.type === 'document') {
      return undefined;
    }
    // 폴더 타입은 빈 배열이라도 internal node로 인식되도록 배열 반환
    if (node.type === 'folder' && isFolderNode(node)) {
      return node.children; // 빈 배열이라도 폴더는 internal node
    }
    return undefined;
  },
  idAccessor = (node) => node.id, // ✅ 기본값 사용
  openByDefault = false,
  selectionFollowsFocus = false,
  disableMultiSelection = false,
  disableEdit = false,
  selection,
  'aria-label': ariaLabel = 'Document tree',
  'aria-describedby': ariaDescribedBy,
  className,
  rowClassName,
  dndRootElement,
  onClick,
  onContextMenu,
}) => {
  const treeRef = useRef<TreeApi<TreeNode>>(null);

  // 🔥 Controlled vs Uncontrolled 모드 감지
  const isControlled = Boolean(nodes);

  // 🔥 트리 데이터 준비
  const treeData = useMemo(() => {
    if (isControlled) {
      // nodes.value가 undefined일 수 있으므로 안전하게 처리
      return nodes?.value || [];
    } else {
      // data나 initialData가 배열이 아닐 수 있으므로 안전하게 처리
      const uncontrolledData = data || initialData;
      return Array.isArray(uncontrolledData) ? uncontrolledData : [];
    }
  }, [nodes, data, initialData, isControlled]);

  // 이벤트 핸들러 결합
  const handleCreate = useMemo(() => {
    return (
      onCreate ||
      (() => {
        // 기본 생성 로직
      })
    );
  }, [onCreate]);

  const handleDelete = useMemo(() => {
    return (
      onDelete ||
      (() => {
        // 기본 삭제 로직
      })
    );
  }, [onDelete]);

  const handleMove = useMemo(() => {
    return (
      onMove ||
      (() => {
        // 기본 이동 로직
      })
    );
  }, [onMove]);

  const handleRename = useMemo(() => {
    return (
      onRename ||
      (() => {
        // 기본 이름 변경 로직
      })
    );
  }, [onRename]);

  const handleToggle = useMemo(() => {
    return (
      onToggle ||
      (() => {
        // 기본 토글 로직
      })
    );
  }, [onToggle]);

  const handleSelect = useMemo(() => {
    return (
      onSelect ||
      (() => {
        // 기본 선택 로직
      })
    );
  }, [onSelect]);

  const handleActivate = useMemo(() => {
    return (
      onActivate ||
      (() => {
        // 기본 활성화 로직
      })
    );
  }, [onActivate]);

  // 드래그 앤 드롭 설정
  const dragDropConfig = useMemo(() => {
    const config: any = {};

    if (canDrag) {
      config.canDrag = canDrag;
    } else if (disableDrag) {
      config.canDrag = false;
    }

    if (canDrop) {
      config.canDrop = canDrop;
    } else if (disableDrop) {
      config.canDrop = false;
    }

    return config;
  }, [canDrag, canDrop, disableDrag, disableDrop]);

  // 검색 설정
  const searchConfig = useMemo(() => {
    const config: any = {};

    if (externalSearchTerm) {
      config.searchTerm = externalSearchTerm;
    }

    if (externalSearchMatch) {
      config.searchMatch = externalSearchMatch;
    }

    return config;
  }, [externalSearchTerm, externalSearchMatch]);

  // 자식 노드가 부모의 자손인지 확인하는 함수
  const isDescendant = useCallback(
    (parent: NodeApi<TreeNode>, child: NodeApi<TreeNode> | null): boolean => {
      if (!child) return false;
      if (parent.id === child.id) return true;
      return isDescendant(parent, child.parent);
    },
    [],
  );

  // 드롭 불가능 여부 확인 (react-arborist v3.0.0+ API)
  const disableDropNode = useCallback(
    (args: {
      dragNodes: NodeApi<TreeNode>[];
      parentNode: NodeApi<TreeNode> | null;
      index: number;
    }): boolean => {
      const { dragNodes, parentNode } = args;

      // 1. 드래그된 노드가 드롭 대상의 자손인지 확인 (순환 참조 방지)
      for (const dragNode of dragNodes) {
        if (parentNode && isDescendant(parentNode, dragNode)) {
          return true; // 자손에게는 드롭 불가
        }
      }

      // 2. 문서는 children을 가질 수 없으므로 폴더에만 드롭 가능
      if (parentNode) {
        const parentData = parentNode.data;
        if (parentData.type === 'document') {
          return true; // 문서에는 드롭 불가
        }
      }

      // 3. 같은 레벨에서의 순서 변경은 허용 (문서 간, 폴더 간)
      const dragNode = dragNodes[0]; // 첫 번째 드래그 노드 기준
      if (dragNode) {
        const dragNodeData = dragNode.data;
        const currentParentId = dragNodeData.parentId || dragNodeData.folderId;
        const targetParentId = parentNode?.id || null;

        // 같은 부모 폴더 내에서의 이동은 허용
        if (currentParentId === targetParentId) {
          return false;
        }

        // 같은 레벨에서의 순서 변경 (둘 다 null이거나 같은 값)
        if (currentParentId === null && targetParentId === null) {
          return false;
        }
      }

      // 4. 다른 폴더로의 이동도 허용 (위의 검증을 통과했다면)
      return false;
    },
    [isDescendant],
  );

  // 🔥 Controlled/Uncontrolled 모드별 props 준비
  const treeProps = useMemo(() => {
    const baseProps = {
      ref: treeRef,
      width,
      height,
      rowHeight,
      indent,
      paddingTop,
      paddingBottom,
      overscanCount,
      selectionFollowsFocus,
      disableMultiSelection,
      disableEdit,
      selection,
      'aria-label': ariaLabel,
      'aria-describedby': ariaDescribedBy,
      className: cn('w-full h-full', className),
      rowClassName: cn('w-full', rowClassName),
      dndRootElement,
      onClick,
      onContextMenu,
      idAccessor,
      childrenAccessor,
      onCreate: handleCreate,
      onDelete: handleDelete,
      onMove: handleMove,
      onRename: handleRename,
      onToggle: handleToggle,
      onSelect: handleSelect,
      onActivate: handleActivate,
      disableDrop: disableDropNode,
      ...dragDropConfig,
      ...searchConfig,
    };

    if (isControlled) {
      // Controlled 모드: data 대신 직접 전달, opens 상태 전달

      return {
        ...baseProps,
        data: treeData, // controlled 모드에서도 data prop 사용
        // React Arborist v3에서는 initialOpenState로 전달
        initialOpenState: opens?.value || {},
        // onToggle 이벤트를 opens.onChange로 연결
        onToggle: (id: string) => {
          if (opens?.onChange && opens?.value) {
            const newOpens = {
              ...opens.value,
              [id]: !opens.value[id],
            };
            opens.onChange(newOpens);
          }
          // 원래 onToggle 핸들러도 호출
          if (onToggle) {
            onToggle(id);
          }
        },
      };
    } else {
      // Uncontrolled 모드: 기존 방식 유지

      return {
        ...baseProps,
        data: treeData,
        openByDefault,
      };
    }
  }, [
    isControlled,
    treeData,
    opens,
    onToggle,
    width,
    height,
    rowHeight,
    indent,
    paddingTop,
    paddingBottom,
    overscanCount,
    openByDefault,
    selectionFollowsFocus,
    disableMultiSelection,
    disableEdit,
    selection,
    ariaLabel,
    ariaDescribedBy,
    className,
    rowClassName,
    dndRootElement,
    onClick,
    onContextMenu,
    idAccessor,
    childrenAccessor,
    handleCreate,
    handleDelete,
    handleMove,
    handleRename,
    handleToggle,
    handleSelect,
    handleActivate,
    disableDropNode,
    dragDropConfig,
    searchConfig,
  ]);

  return (
    <div className='w-full h-full overflow-hidden'>
      <Tree<TreeNode> {...treeProps}>{TreeNodeComponent}</Tree>
    </div>
  );
};

export default ArboristTree;
