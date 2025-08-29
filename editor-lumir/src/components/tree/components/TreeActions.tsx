'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  MoreHorizontal,
  FileText,
  FolderPlus,
  Trash2,
  Calendar,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDate } from '../utils/treeHelpers';
import { NodeApi } from 'react-arborist';
import { TreeNode } from '@/types/common';

// ===== 트리 액션 버튼들 컴포넌트 =====

interface TreeActionsProps {
  node: NodeApi<TreeNode>;
  onAction: (action: string, node: NodeApi<TreeNode>) => void;
  showActions?: boolean;
  showContextMenu?: boolean;
}

export const TreeActions: React.FC<TreeActionsProps> = ({
  node,
  onAction,
  showActions = true,
  showContextMenu = true,
}) => {
  const isInternal = node.isInternal;

  if (!showActions && !showContextMenu) {
    return null;
  }

  return (
    <DropdownMenu
      onOpenChange={(open) => {
        if (open) {
          node.select();
        }
      }}>
      <DropdownMenuTrigger asChild>
        <Button
          type='button'
          variant='ghost'
          size='sm'
          className={cn('h-6 w-6 hover:cursor-pointer border-none')}>
          <MoreHorizontal className='h-3 w-3 text-gray-700' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align='start'
        className='w-52 p-0 bg-white border border-gray-200 rounded-lg shadow-lg'
        style={{ transform: 'translateY(-10px)' }}>
        {/* 액션 메뉴 아이템들 */}
        <div className='p-1'>
          {/* 폴더 전용 메뉴 아이템들 */}
          {isInternal && (
            <>
              <DropdownMenuItem
                onClick={() => onAction('create-document', node)}
                className={cn(
                  'flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded cursor-pointer',
                )}>
                <FileText className='h-4 w-4 mr-3 text-gray-500' />새 하위 문서
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => onAction('create-folder', node)}
                className={cn(
                  'flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded cursor-pointer',
                )}>
                <FolderPlus className='h-4 w-4 mr-3 text-gray-500' />새 하위
                폴더
              </DropdownMenuItem>
            </>
          )}

          <DropdownMenuItem
            onClick={() => onAction('move-to-trash', node)}
            className='flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded cursor-pointer'>
            <Trash2 className='h-4 w-4 mr-3 text-gray-500' />
            휴지통으로 이동
          </DropdownMenuItem>
        </div>

        {/* 메타데이터 */}
        <div className='px-3 py-2 text-xs text-gray-500'>
          <div className='flex items-center mb-1'>
            <Calendar className='h-3 w-3 mr-2' />
            생성:{' '}
            {node.data.createdAt
              ? formatDate(node.data.createdAt)
              : '알 수 없음'}
          </div>
          <div className='flex items-center'>
            <Calendar className='h-3 w-3 mr-2' />
            마지막 수정:{' '}
            {node.data.updatedAt
              ? formatDate(node.data.updatedAt)
              : '알 수 없음'}
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
