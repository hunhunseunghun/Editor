'use client';

import React, { useEffect } from 'react';
import { NodeRendererProps } from 'react-arborist';
import { TreeNode as TreeNodeType } from '@/types/tree';
import { ChevronDown, ChevronRight, FileText, Folder } from 'lucide-react';
import { cn } from '@/lib/utils';

import { TreeActions } from './TreeActions';

// ===== 개별 노드 렌더러 컴포넌트 =====

export const TreeNode: React.FC<NodeRendererProps<TreeNodeType>> = (props) => {
  const { node, style, dragHandle, tree } = props;
  // 더 안전한 타입 판단: 데이터 타입과 react-arborist 상태 둘 다 확인
  const isFolder = node.data.type === 'folder' && !node.isLeaf;
  const isDocument = node.data.type === 'document';
  const isExpanded = node.isOpen;

  // 새 문서 생성 핸들러
  const handleCreateDocument = () => {
    if (node.id && tree.props.onCreate) {
      tree.props.onCreate({
        parentId: node.id,
        parentNode: node,
        index: 0,
        type: 'leaf',
      });
    }
  };

  // 새 하위 폴더 생성 핸들러
  const handleCreateFolder = () => {
    if (node.id && tree.props.onCreate) {
      tree.props.onCreate({
        parentId: node.id,
        parentNode: node,
        index: 0,
        type: 'internal',
      });
    }
  };

  // 휴지통으로 이동 핸들러
  const handleMoveToTrash = () => {
    if (confirm(`"${node.data.name}"을(를) 휴지통으로 이동하시겠습니까?`)) {
      // NodeApi는 data를 통해 접근
      if (node.id && tree.props.onDelete) {
        tree.props.onDelete({ ids: [node.id], nodes: [node] });
      }
    }
  };

  // 노드 클릭 핸들러
  const handleNodeClick = (event: React.MouseEvent) => {
    if (node.isEditing) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    node.handleClick(event);
  };

  // 노드 더블클릭 핸들러
  const handleNodeDoubleClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    node.edit();
  };

  // 액션 핸들러
  const handleAction = (action: string) => {
    switch (action) {
      case 'create-document':
        handleCreateDocument();
        break;
      case 'create-folder':
        handleCreateFolder();
        break;
      case 'move-to-trash':
        handleMoveToTrash();
        break;
      default:
      // Unknown action - no action needed
    }
  };

  // DnD 상태 로깅 (드롭존 활성화 시에만)
  useEffect(() => {
    if (node.willReceiveDrop) {
    }
  }, [
    node.willReceiveDrop,
    node.data.name,
    node.data.type,
    node.id,
    isFolder,
    isDocument,
  ]);

  return (
    <div
      ref={dragHandle}
      style={style}
      onClick={handleNodeClick}
      onDoubleClick={handleNodeDoubleClick}
      className={cn(
        'flex items-center px-2 py-1 cursor-pointer relative w-full min-w-0 h-full',
        node.isSelected && 'bg-gray-300/70',
        node.isEditing && 'bg-gray-300',
        node.willReceiveDrop && 'bg-blue-500/20',
      )}>
      {/* 확장/축소 버튼 (폴더인 경우에만) */}
      {isFolder && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            node.toggle();
          }}
          className='w-4 h-4 mr-2 flex items-center justify-center text-gray-500 hover:text-gray-700'>
          {isExpanded ? (
            <ChevronDown className='h-4 w-4' />
          ) : (
            <ChevronRight className='h-4 w-4' />
          )}
        </button>
      )}

      {/* 폴더/문서 아이콘 */}
      <span className='mr-2 text-gray-500'>
        {isFolder ? (
          <Folder className='h-4 w-4' />
        ) : isDocument ? (
          <FileText className='h-4 w-4 ml-2.5' />
        ) : (
          <FileText className='h-4 w-4 ml-2.5' />
        )}
      </span>

      {/* 노드 이름 또는 편집 입력 */}
      {node.isEditing ? (
        <input
          type='text'
          defaultValue={node.data.name}
          className='flex-1 border-none focus:outline-none text-sm font-light w-full'
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const newName = e.currentTarget.value.trim();
              if (newName && newName !== node.data.name) {
                node.submit(newName);
              } else {
                node.reset();
              }
            } else if (e.key === 'Escape') {
              node.reset();
            }
          }}
          onBlur={(e) => {
            if (
              e.relatedTarget &&
              (e.relatedTarget.closest('[data-radix-popper-content-wrapper]') ||
                e.relatedTarget.closest('[role="menu"]') ||
                e.relatedTarget.closest('.dropdown-menu'))
            ) {
              return;
            }

            const newName = e.currentTarget.value.trim();
            if (newName && newName !== node.data.name) {
              node.submit(newName);
            } else {
              node.reset();
            }
          }}
          autoFocus
        />
      ) : (
        <span className='flex-1 text-sm font-light truncate min-w-0 w-full'>
          {node.data.name}
        </span>
      )}

      {/* 액션 버튼들 */}
      <TreeActions
        node={node}
        onAction={handleAction}
        showActions={true}
        showContextMenu={true}
      />
    </div>
  );
};
