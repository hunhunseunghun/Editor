'use client';

import { useDocumentContent } from '@/app/(editing)/edit/_context/DocumentContentContext';
import { BlockNoteEditor } from '@/components/editor/BlockNoteEditor';
import { useRef, useCallback, useState, useEffect } from 'react';
import { BlockNoteEditor as BlockNoteEditorType } from '@blocknote/core';
import { cn } from '@/lib/utils';

export default function EditorModule() {
  const { currentDocument, 문서를_저장_한다 } = useDocumentContent();
  const editorRef = useRef<BlockNoteEditorType | null>(null);

  const [documentContent, setDocumentContent] = useState<any[]>([]);
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedContentRef = useRef<string>('');

  useEffect(() => {
    const checkMobile = () => {
      const isMobile = window.innerWidth <= 768;
      setIsSidebarMinimized(isMobile);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (currentDocument?.content) {
      setDocumentContent(currentDocument.content);

      lastSavedContentRef.current = JSON.stringify(
        currentDocument.content || [],
      );
    }
  }, [currentDocument]);

  const handleContentChange = useCallback(
    (content: unknown) => {
      console.log('Content change detected:', {
        hasCurrentDocument: !!currentDocument,
        documentId: currentDocument?._id,
        contentIsArray: Array.isArray(content),
        contentLength: Array.isArray(content) ? content.length : 0,
      });

      if (currentDocument?._id && Array.isArray(content)) {
        const currentContentString = JSON.stringify(content);

        // 이전에 저장된 content와 동일한지 확인
        if (lastSavedContentRef.current === currentContentString) {
          console.log('Content unchanged, skipping save');
          return;
        }

        // 기존 타이머가 있으면 취소
        if (saveTimerRef.current) {
          clearTimeout(saveTimerRef.current);
        }

        // 디바운싱: 0.5초 후에 저장 실행
        saveTimerRef.current = setTimeout(async () => {
          try {
            console.log('Saving document content...');
            await 문서를_저장_한다(currentDocument._id, content);
            // 저장된 content 기록
            lastSavedContentRef.current = currentContentString;
            console.log('Document saved successfully');
          } catch (error) {
            console.error('Failed to save document:', error);
          }
        }, 500);
      } else {
        console.warn('Cannot save: missing document ID or invalid content', {
          hasDocumentId: !!currentDocument?._id,
          contentIsArray: Array.isArray(content),
        });
      }
    },
    [currentDocument?._id, 문서를_저장_한다],
  );

  if (!currentDocument) {
    return (
      <div className='flex items-center justify-center h-full'>
        <div className='text-gray-500'>문서를 선택해주세요</div>
      </div>
    );
  }

  // 문서가 잠겨있는지 확인
  const isDocumentLocked = currentDocument.isLocked;

  return (
    <div className='h-full w-full flex flex-col'>
      <div className='flex-1 overflow-y-auto'>
        <div
          className={cn(
            'h-full flex justify-center',
            // 사이드바가 닫혔을 때 더 넓은 패딩 사용
            isSidebarMinimized ? 'p-6' : 'p-4',
          )}>
          <div className='w-full max-w-4xl'>
            <BlockNoteEditor
              initialContent={documentContent}
              onContentChange={handleContentChange}
              editorRef={editorRef}
              editable={!isDocumentLocked}
              documentId={currentDocument._id}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
