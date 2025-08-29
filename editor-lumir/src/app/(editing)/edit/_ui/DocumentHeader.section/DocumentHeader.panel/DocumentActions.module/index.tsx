'use client';

import { useCallback, useState } from 'react';
import { useDocumentHeader } from '@/app/(editing)/edit/_context/DocumentHeaderContext';
import { useEdit } from '@/app/(editing)/edit/_context/EditContext';
import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  MoreHorizontal,
  Lock,
  Unlock,
  Copy,
  Trash2,
  LogOut,
} from 'lucide-react';

interface DocumentActionsModuleProps {
  document?: any;
}

export default function DocumentActionsModule({
  document: _document,
}: DocumentActionsModuleProps) {
  const { currentDocument, 문서_상태를_잠금으로_변경한다, 문서를_삭제한다 } =
    useDocumentHeader();
  const { 현재_문서를_수정한다 } = useEdit();

  // 🎨 UI 상태 (로컬 관리)
  const [isLockLoading, setIsLockLoading] = useState(false);
  const [isTrashLoading, setIsTrashLoading] = useState(false);
  const [isCopyLoading, setIsCopyLoading] = useState(false);

  const handleCopyLink = useCallback(async () => {
    if (!currentDocument?._id) return;

    setIsCopyLoading(true);
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/edit/${currentDocument._id}`,
      );
      console.log('링크가 클립보드에 복사되었습니다.');
    } catch (error) {
      console.error('링크 복사에 실패했습니다:', error);
    } finally {
      setIsCopyLoading(false);
    }
  }, [currentDocument?._id]);

  const handleLockToggle = useCallback(async () => {
    if (!currentDocument?._id) return;

    const newLockState = !currentDocument.isLocked;
    const previousLockState = currentDocument.isLocked;

    // 낙관적 업데이트
    현재_문서를_수정한다({
      ...currentDocument,
      isLocked: newLockState,
    });

    setIsLockLoading(true);
    try {
      await 문서_상태를_잠금으로_변경한다(currentDocument._id, newLockState);
      console.log(
        newLockState ? '문서가 잠겼습니다.' : '문서 잠금이 해제되었습니다.',
      );
    } catch (error) {
      // 롤백
      현재_문서를_수정한다({
        ...currentDocument,
        isLocked: previousLockState,
      });
      console.error('문서 잠금 상태 변경에 실패했습니다:', error);
    } finally {
      setIsLockLoading(false);
    }
  }, [currentDocument, 문서_상태를_잠금으로_변경한다, 현재_문서를_수정한다]);

  const handleMoveToTrash = useCallback(async () => {
    if (!currentDocument?._id) return;

    setIsTrashLoading(true);
    try {
      await 문서를_삭제한다(currentDocument._id);
      console.log('문서가 휴지통으로 이동되었습니다.');
    } catch (error) {
      console.error('문서 이동에 실패했습니다:', error);
    } finally {
      setIsTrashLoading(false);
    }
  }, [currentDocument?._id, 문서를_삭제한다]);

  const handleSignOut = useCallback(() => {
    signOut({ callbackUrl: '/' });
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          size='sm'
          className='h-8 w-8 p-0'
          disabled={!currentDocument}>
          <MoreHorizontal className='h-4 w-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-56'>
        <div className='flex items-center justify-between px-2 py-1.5'>
          <div className='flex items-center'>
            {currentDocument?.isLocked ? (
              <Lock className='mr-2 h-4 w-4' />
            ) : (
              <Unlock className='mr-2 h-4 w-4' />
            )}
            <span className='text-sm font-medium'>페이지 잠금</span>
          </div>
          <Switch
            checked={currentDocument?.isLocked || false}
            onCheckedChange={handleLockToggle}
            disabled={!currentDocument || isLockLoading}
          />
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleCopyLink}
          className='hover:cursor-pointer'
          disabled={!currentDocument || isCopyLoading}>
          <Copy className='mr-2 h-4 w-4' />
          {isCopyLoading ? '복사 중...' : '링크 복사'}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={handleMoveToTrash}
          className='hover:cursor-pointer'
          disabled={!currentDocument || isTrashLoading}>
          <Trash2 className='mr-2 h-4 w-4' />
          {isTrashLoading ? '이동 중...' : '휴지통으로 이동'}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={handleSignOut}
          className='hover:cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50'>
          <LogOut className='mr-2 h-4 w-4' />
          로그아웃
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
