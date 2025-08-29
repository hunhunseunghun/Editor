'use client';

import { useRef, useCallback, useMemo, useEffect } from 'react';
import { BlockNoteEditor } from '@/components/editor';
import { BlockNoteEditor as BlockNoteEditorType } from '@blocknote/core';

interface DocumentContentProps {
  content: unknown;
  onContentChange: (content: unknown) => void;
  isLocked?: boolean;
}

export default function DocumentContent({
  content,
  onContentChange,
  isLocked = false,
}: DocumentContentProps) {
  const editorRef = useRef<BlockNoteEditorType | null>(null);

  // 잠금 상태 변경 시 에디터 강제 업데이트
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.isEditable = !isLocked;
    }
  }, [isLocked]);

  // 콘텐츠 검증 및 안전한 초기값 제공
  const safeContent = useMemo(() => {
    if (!content || !Array.isArray(content) || content.length === 0) {
      return [
        {
          id: 'content-block',
          type: 'paragraph',
          props: {
            textColor: 'default',
            backgroundColor: 'default',
            textAlignment: 'left',
          },
          content: [
            {
              type: 'text',
              text: '',
              styles: {},
            },
          ],
          children: [],
        },
      ];
    }
    return content;
  }, [content]);

  const handleContentChange = useCallback(
    (newContent: unknown) => {
      onContentChange(newContent);
    },
    [onContentChange],
  );

  return (
    <div
      className={`min-h-[400px] prose prose-lg max-w-none relative z-0 ${
        isLocked ? 'select-text' : ''
      }`}>
      <BlockNoteEditor
        initialContent={safeContent}
        onContentChange={handleContentChange}
        editorRef={editorRef}
        editable={!isLocked}
      />
    </div>
  );
}
