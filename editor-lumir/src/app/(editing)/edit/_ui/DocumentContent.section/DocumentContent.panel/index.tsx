'use client';

import { useDocumentContent } from '@/app/(editing)/edit/_context/DocumentContentContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui';
import { Plus } from 'lucide-react';
import EditorModule from './Editor.module/index';

export default function DocumentContentPanel() {
  const { currentDocument, 새로운_문서를_만든다 } = useDocumentContent();

  return (
    <main
      className={cn(
        'flex-1 bg-background transition-all duration-300',
        'h-full w-full overflow-y-auto px-4',
      )}>
      <div className='flex-1 flex flex-col bg-white h-full min-h-0'>
        {currentDocument ? (
          <>
            <div className='flex-1 overflow-hidden min-h-0'>
              <EditorModule />
            </div>
          </>
        ) : (
          <div className='flex flex-col items-center justify-center h-full space-y-4'>
            <Button
              onClick={새로운_문서를_만든다}
              className='flex items-center space-x-2'
              variant='outline'>
              <Plus className='w-4 h-4' />
              <span>새 문서 만들기</span>
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}
