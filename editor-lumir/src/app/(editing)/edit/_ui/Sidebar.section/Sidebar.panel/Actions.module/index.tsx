'use client';

import { useCallback, useState } from 'react';
import { useSidebar } from '@/app/(editing)/edit/_context/SidebarContext';
import { Button } from '@/components/ui/button';
import {
  Trash2,
  FileText,
  Folder as FolderIcon,
  ChevronsLeft,
} from 'lucide-react';
import TrashDialog from '@/components/dialog/TrashDialog';

interface ActionsModuleProps {
  toggleSidebar?: () => void;
}

export default function ActionsModule({ toggleSidebar }: ActionsModuleProps) {
  const { 문서를_만든다, 폴더를_만든다 } = useSidebar();

  // 🎨 UI 상태 (로컬 관리)
  const [isCreatingDocument, setIsCreatingDocument] = useState(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);

  const handleCreateDocument = useCallback(async () => {
    setIsCreatingDocument(true);
    try {
      await 문서를_만든다();
      console.log('새 문서가 생성되었습니다.');
    } catch (error) {
      console.error('문서 생성에 실패했습니다:', error);
    } finally {
      setIsCreatingDocument(false);
    }
  }, [문서를_만든다]);

  const handleCreateFolder = useCallback(async () => {
    setIsCreatingFolder(true);
    try {
      await 폴더를_만든다();
      console.log('새 폴더가 생성되었습니다.');
    } catch (error) {
      console.error('폴더 생성에 실패했습니다:', error);
    } finally {
      setIsCreatingFolder(false);
    }
  }, [폴더를_만든다]);

  return (
    <>
      {/* 사이드바 메뉴 */}
      <div className='flex flex-col pb-3 mb-2'>
        <TrashDialog>
          <Button
            variant='ghost'
            className='h-8 w-full justify-start px-3 font-normal text-primary/70 hover:bg-primary/5 hover:cursor-pointer'>
            <Trash2 className='mr-3 h-4 w-4' />
            휴지통
          </Button>
        </TrashDialog>
        <Button
          variant='ghost'
          className='h-8 w-full justify-start px-3 font-normal text-primary/70 hover:bg-primary/5 hover:cursor-pointer'
          onClick={handleCreateFolder}
          disabled={isCreatingFolder}>
          <FolderIcon className='mr-3 h-4 w-4' />
          {isCreatingFolder ? '폴더 생성 중...' : '새 폴더'}
        </Button>
        <Button
          variant='ghost'
          className='h-8 w-full justify-start px-3 font-normal text-primary/70 hover:bg-primary/5 hover:cursor-pointer'
          onClick={handleCreateDocument}
          disabled={isCreatingDocument}>
          <FileText className='mr-3 h-4 w-4' />
          {isCreatingDocument ? '문서 생성 중...' : '새 문서'}
        </Button>
      </div>

      {/* 사이드바 닫기 버튼 */}
      <Button
        size='icon'
        className='absolute right-4 top-3.5 h-7 w-7 text-muted-foreground transition hover:cursor-pointer'
        variant='ghost'
        onClick={toggleSidebar}
        title='사이드바 닫기 (Ctrl+B)'>
        <ChevronsLeft className='h-6 w-6' />
      </Button>
    </>
  );
}
