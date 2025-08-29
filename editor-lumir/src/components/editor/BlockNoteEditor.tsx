'use client';

import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/shadcn';
import '@blocknote/core/fonts/inter.css';
import '@blocknote/react/style.css';
import '@blocknote/shadcn/style.css';
import { useEffect, useMemo } from 'react';
import { BlockNoteEditor as BlockNoteEditorType } from '@blocknote/core';

interface BlockNoteEditorProps {
  initialContent?: unknown;
  onContentChange?: (content: unknown) => void;
  editorRef?: React.MutableRefObject<BlockNoteEditorType | null>;
  editable?: boolean;
  documentId?: string; // 문서 ID 추가
  uploadFile?: (file: File) => Promise<string>;
}

export const BlockNoteEditor = ({
  initialContent,
  onContentChange,
  editorRef,
  editable = true,
  documentId,
  uploadFile: providedUploadFile,
}: BlockNoteEditorProps) => {
  // 초기 콘텐츠 검증
  const validatedContent = useMemo(() => {
    // 기본 빈 본문 블록 생성
    const defaultContent = [
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

    // initialContent가 유효한 배열인지 확인
    if (
      !initialContent ||
      !Array.isArray(initialContent) ||
      initialContent.length === 0
    ) {
      return defaultContent;
    }

    // 기존 콘텐츠가 있으면 그대로 사용
    return initialContent;
  }, [initialContent]);

  // 기본 이미지 업로드 핸들러 (호스트 앱에서 주입 가능)
  const defaultUploadFile = async (file: File): Promise<string> => {
    try {
      // FormData를 사용하여 파일 업로드
      const formData = new FormData();
      formData.append('file', file);

      // API 엔드포인트로 파일 업로드
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('파일 업로드에 실패했습니다.');
      }

      const result = await response.json();
      return result.url; // 업로드된 이미지의 URL 반환
    } catch (error) {
      console.error('이미지 업로드 오류:', error);
      // 에러 발생 시 기본 이미지 URL 반환 (선택사항)
      throw new Error('이미지 업로드에 실패했습니다.');
    }
  };

  const editor = useCreateBlockNote({
    initialContent: validatedContent,
    // 테이블 설정
    tables: {
      splitCells: true,
      cellBackgroundColor: true,
      cellTextColor: true,
      headers: true,
    },
    // 이미지 업로드 기능 추가
    uploadFile: providedUploadFile ?? defaultUploadFile,
    // 이미지 붙여넣기 핸들러 (클립보드)
    pasteHandler: ({ event, editor, defaultPasteHandler }) => {
      const files = Array.from(event.clipboardData?.files ?? []);
      const imageFiles = files.filter((f) => f.type.startsWith('image/'));
      if (imageFiles.length === 0) return defaultPasteHandler();

      event.preventDefault();
      (async () => {
        const doUpload = providedUploadFile ?? defaultUploadFile;
        for (const file of imageFiles) {
          try {
            const url = await doUpload(file);
            // 이미지 블록 삽입: HTML로 붙여넣기 (스키마 호환, 안전)
            editor.pasteHTML(`<img src="${url}" alt="image" />`);
          } catch (e) {
            console.error('클립보드 이미지 업로드 실패:', e);
          }
        }
      })();
      return true;
    },
  });

  // 에디터 편집 가능 여부 설정
  useEffect(() => {
    if (editor) {
      editor.isEditable = editable;

      // 읽기 전용 모드에서도 텍스트 선택과 복사를 허용
      if (!editable) {
        // 에디터 DOM 요소에 접근하여 선택 가능하도록 설정
        const editorElement = editor.domElement;
        if (editorElement) {
          editorElement.style.userSelect = 'text';
          editorElement.style.webkitUserSelect = 'text';
        }
      }
    }
  }, [editor, editable]);

  if (editorRef) {
    editorRef.current = editor;
  }

  // Content change detection and auto-save
  useEffect(() => {
    if (!editor || !onContentChange) return;

    let lastContent = '';

    const handleContentChange = () => {
      const topLevelBlocks = editor.topLevelBlocks;
      const currentContent = JSON.stringify(topLevelBlocks);

      // 내용이 실제로 변경되었는지 확인
      if (lastContent === currentContent) {
        return;
      }

      lastContent = currentContent;

      console.log('📝 BlockNoteEditor: 내용 변경 감지:', {
        documentId,
        contentLength: topLevelBlocks.length,
        contentPreview: topLevelBlocks[0]?.content?.[0]?.text || '빈 내용',
      });

      // 즉시 콜백 호출 (디바운싱은 DocumentContentContext에서 처리)
      onContentChange(topLevelBlocks);
    };

    // 이벤트 리스너 등록
    editor.onEditorContentChange(handleContentChange);

    // 정리 함수
    return () => {
      console.log('이벤트 리스너 정리 완료');
    };
  }, [editor, onContentChange]);

  // 🔥 통합된 에디터 내용 업데이트 로직 (무한 루프 방지)
  useEffect(() => {
    if (!editor || !initialContent || !documentId) return;

    console.log('🔄 BlockNoteEditor: 에디터 내용 업데이트 검사:', {
      documentId,
      contentLength: Array.isArray(initialContent) ? initialContent.length : 0,
      contentPreview:
        (Array.isArray(initialContent) &&
          initialContent[0]?.content?.[0]?.text) ||
        '빈 내용',
    });

    // 현재 에디터 내용과 새로운 내용이 다른 경우에만 업데이트
    const currentBlocks = editor.topLevelBlocks;
    const newBlocks = Array.isArray(initialContent) ? initialContent : [];

    // 내용이 실제로 다른 경우에만 업데이트
    if (JSON.stringify(currentBlocks) !== JSON.stringify(newBlocks)) {
      console.log('🔄 BlockNoteEditor: 에디터 내용 업데이트 실행');

      // 에디터 내용 업데이트 (content change 이벤트 발생 방지)
      editor.replaceBlocks(editor.topLevelBlocks, newBlocks);
    }
  }, [editor, initialContent]); // 의존성 배열 최적화

  // 🔥 React Arborist DND가 에디터 영역으로 침범하는 것을 차단
  useEffect(() => {
    // 파일 드래그 앤 드롭 업로드 처리 (에디터 영역 한정)
    const attachEditorDropHandlers = () => {
      const el = editor?.domElement as HTMLElement | undefined;
      if (!el) return () => {};

      const handleDragOver = (e: DragEvent) => {
        if (e.dataTransfer?.types.includes('Files')) {
          e.preventDefault();
        }
      };

      const handleDropFiles = (e: DragEvent) => {
        if (!e.dataTransfer) return;
        const files = Array.from(e.dataTransfer.files ?? []);
        const imageFiles = files.filter((f) => f.type.startsWith('image/'));
        if (imageFiles.length === 0) return;
        e.preventDefault();
        (async () => {
          const doUpload = providedUploadFile ?? defaultUploadFile;
          for (const file of imageFiles) {
            try {
              const url = await doUpload(file);
              editor?.pasteHTML(`<img src="${url}" alt="image" />`);
            } catch (err) {
              console.error('드롭 이미지 업로드 실패:', err);
            }
          }
        })();
      };

      el.addEventListener('dragover', handleDragOver, false);
      el.addEventListener('drop', handleDropFiles, false);

      return () => {
        el.removeEventListener('dragover', handleDragOver, false);
        el.removeEventListener('drop', handleDropFiles, false);
      };
    };

    const detach = attachEditorDropHandlers();

    const handleGlobalDragOver = (e: DragEvent) => {
      const target = e.target as HTMLElement;
      const editorContainer = document.querySelector('[data-editor-container]');
      const sidebarContainer = document.querySelector(
        '[data-sidebar-container]',
      );

      if (!editorContainer || !sidebarContainer) return;

      // React Arborist 드래그인지 확인
      const isArboristDrag = e.dataTransfer?.types.includes(
        'application/x-react-dnd-drag-source',
      );

      if (isArboristDrag && editorContainer.contains(target)) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
      }
    };

    const handleGlobalDrop = (e: DragEvent) => {
      const target = e.target as HTMLElement;
      const editorContainer = document.querySelector('[data-editor-container]');

      if (!editorContainer) return;

      const isArboristDrag = e.dataTransfer?.types.includes(
        'application/x-react-dnd-drag-source',
      );

      if (isArboristDrag && editorContainer.contains(target)) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
      }
    };

    document.addEventListener('dragover', handleGlobalDragOver, true);
    document.addEventListener('drop', handleGlobalDrop, true);

    return () => {
      detach?.();
      document.removeEventListener('dragover', handleGlobalDragOver, true);
      document.removeEventListener('drop', handleGlobalDrop, true);
    };
  }, [editor, providedUploadFile]);

  return (
    <div className={`w-full relative z-0`} data-editor-container>
      <BlockNoteView editor={editor} theme='light' editable={editable} />
    </div>
  );
};
