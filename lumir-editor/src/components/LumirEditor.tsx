'use client';

import React, { useEffect, useMemo } from 'react';
import {
  useCreateBlockNote,
  SideMenu as BlockSideMenu,
  SideMenuController,
  DragHandleButton,
  SuggestionMenuController,
  getDefaultReactSlashMenuItems,
} from '@blocknote/react';
import { BlockNoteView } from '@blocknote/mantine';
import { cn } from '../utils/cn';

import type {
  BlockNoteEditor as CoreBlockNoteEditor,
  PartialBlock,
  DefaultBlockSchema,
  DefaultInlineContentSchema,
  DefaultStyleSchema,
} from '@blocknote/core';

export type EditorType = CoreBlockNoteEditor<
  DefaultBlockSchema,
  DefaultInlineContentSchema,
  DefaultStyleSchema
>;
export type DefaultPartialBlock = PartialBlock<
  DefaultBlockSchema,
  DefaultInlineContentSchema,
  DefaultStyleSchema
>;

export interface LumirEditorProps {
  // Editor options
  initialContent?: DefaultPartialBlock[];
  uploadFile?: (file: File) => Promise<string>;
  // 외부 업로더(uploadFile)가 없을 때의 폴백 저장 방식: true=Base64, false=ObjectURL
  storeImagesAsBase64?: boolean;
  // 미디어 업로드 허용 범위(기본 비활성)
  allowVideoUpload?: boolean;
  allowAudioUpload?: boolean;
  // 일반 파일 업로드 허용 (기본 비활성)
  allowFileUpload?: boolean;
  pasteHandler?: (ctx: {
    event: ClipboardEvent;
    editor: EditorType;
    defaultPasteHandler: (context?: {
      pasteBehavior?: 'prefer-markdown' | 'prefer-html';
    }) => boolean | undefined;
  }) => boolean | undefined;
  tables?: {
    splitCells?: boolean;
    cellBackgroundColor?: boolean;
    cellTextColor?: boolean;
    headers?: boolean;
  };
  heading?: { levels?: (1 | 2 | 3 | 4 | 5 | 6)[] };
  animations?: boolean;
  defaultStyles?: boolean;
  disableExtensions?: string[];
  domAttributes?: Record<string, string>;
  tabBehavior?: 'prefer-navigate-ui' | 'prefer-indent';
  trailingBlock?: boolean;
  resolveFileUrl?: (url: string) => Promise<string>;

  // View options
  editable?: boolean;
  theme?:
    | 'light'
    | 'dark'
    | Partial<Record<string, unknown>>
    | {
        light: Partial<Record<string, unknown>>;
        dark: Partial<Record<string, unknown>>;
      };
  formattingToolbar?: boolean;
  linkToolbar?: boolean;
  sideMenu?: boolean;
  slashMenu?: boolean;
  emojiPicker?: boolean;
  filePanel?: boolean;
  tableHandles?: boolean;
  comments?: boolean;
  onSelectionChange?: () => void;
  className?: string;
  includeDefaultStyles?: boolean; // 기본 스타일 포함 여부
  // Add block(플러스) 버튼 토글: true(기본) = 표시, false = 숨김(드래그 핸들은 유지)
  sideMenuAddButton?: boolean;

  // Callbacks / refs
  onContentChange?: (content: DefaultPartialBlock[]) => void;
  editorRef?: React.MutableRefObject<EditorType | null>;
}

const createObjectUrlUploader = async (file: File): Promise<string> => {
  return URL.createObjectURL(file);
};

const fileToBase64 = async (file: File): Promise<string> =>
  await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('FileReader failed'));
    reader.readAsDataURL(file);
  });

export default function LumirEditor({
  // editor options
  initialContent,
  uploadFile,
  pasteHandler,
  tables,
  heading,
  animations = true,
  defaultStyles = true,
  disableExtensions,
  domAttributes,
  tabBehavior = 'prefer-navigate-ui',
  trailingBlock = true,
  resolveFileUrl,
  storeImagesAsBase64 = true,
  allowVideoUpload = false,
  allowAudioUpload = false,
  allowFileUpload = false,
  // view options
  editable = true,
  theme = 'light',
  formattingToolbar = true,
  linkToolbar = true,
  sideMenu = true,
  slashMenu = true,
  emojiPicker = true,
  filePanel = true,
  tableHandles = true,
  comments = true,
  onSelectionChange,
  className = '',
  includeDefaultStyles = true,
  sideMenuAddButton = true,
  // callbacks / refs
  onContentChange,
  editorRef,
}: LumirEditorProps) {
  const validatedContent = useMemo<DefaultPartialBlock[]>(() => {
    const defaultContent: DefaultPartialBlock[] = [
      {
        type: 'paragraph',
        props: {
          textColor: 'default',
          backgroundColor: 'default',
          textAlignment: 'left',
        },
        content: [{ type: 'text', text: '', styles: {} }],
        children: [],
      },
    ];
    if (!initialContent || initialContent.length === 0) {
      return defaultContent;
    }
    return initialContent;
  }, [initialContent]);

  const editor = useCreateBlockNote<
    DefaultBlockSchema,
    DefaultInlineContentSchema,
    DefaultStyleSchema
  >(
    {
      initialContent: validatedContent as DefaultPartialBlock[],
      tables: {
        splitCells: tables?.splitCells ?? true,
        cellBackgroundColor: tables?.cellBackgroundColor ?? true,
        cellTextColor: tables?.cellTextColor ?? true,
        headers: tables?.headers ?? true,
      },
      heading:
        heading?.levels && heading.levels.length > 0
          ? heading
          : { levels: [1, 2, 3, 4, 5, 6] as (1 | 2 | 3 | 4 | 5 | 6)[] },
      animations,
      defaultStyles,
      // 확장 비활성: 비디오/오디오만 제어(파일 확장은 내부 드롭 로직 의존 → 비활성화하지 않음)
      disableExtensions: useMemo(() => {
        const set = new Set<string>(disableExtensions ?? []);
        if (!allowVideoUpload) set.add('video');
        if (!allowAudioUpload) set.add('audio');
        return Array.from(set);
      }, [disableExtensions, allowVideoUpload, allowAudioUpload]),
      domAttributes,
      tabBehavior,
      trailingBlock,
      resolveFileUrl,
      uploadFile: async (file) => {
        const custom = uploadFile;
        const fallback = storeImagesAsBase64
          ? fileToBase64
          : createObjectUrlUploader;
        try {
          if (custom) return await custom(file);
          return await fallback(file);
        } catch (_) {
          // Fallback to ObjectURL when FileReader or custom upload fails
          try {
            return await createObjectUrlUploader(file);
          } catch {
            throw new Error('Failed to process file for upload');
          }
        }
      },
      pasteHandler: (ctx) => {
        const { event, editor, defaultPasteHandler } = ctx as any;
        const fileList =
          (event?.clipboardData?.files as FileList | null) ?? null;
        const files: File[] = fileList ? Array.from(fileList) : [];
        const accepted: File[] = files.filter(
          (f: File) =>
            f.size > 0 &&
            (f.type?.startsWith('image/') ||
              (!f.type &&
                /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(f.name || ''))),
        );
        // 파일 항목이 있으나 허용되지 않으면 기본 처리도 막고 무시
        if (files.length > 0 && accepted.length === 0) {
          event.preventDefault();
          return true;
        }
        if (accepted.length === 0) return defaultPasteHandler() ?? false;
        event.preventDefault();
        (async () => {
          const doUpload =
            uploadFile ??
            (storeImagesAsBase64 ? fileToBase64 : createObjectUrlUploader);
          for (const file of accepted) {
            try {
              const url = await doUpload(file);
              editor.pasteHTML(`<img src="${url}" alt="image" />`);
            } catch (err) {
              // 업로드 실패 파일은 삽입하지 않음 (삭제/스킵)
              // console.warn로만 기록하여 UI 오류를 막음
              console.warn(
                'Image upload failed, skipped:',
                file.name || '',
                err,
              );
              continue;
            }
          }
        })();
        return true;
      },
    },
    [
      uploadFile,
      pasteHandler,
      storeImagesAsBase64,
      allowVideoUpload,
      allowAudioUpload,
      allowFileUpload,
      tables?.splitCells,
      tables?.cellBackgroundColor,
      tables?.cellTextColor,
      tables?.headers,
      heading?.levels?.join(','),
      animations,
      defaultStyles,
      disableExtensions?.join(','),
      domAttributes ? JSON.stringify(domAttributes) : undefined,
      tabBehavior,
      trailingBlock,
      resolveFileUrl,
    ],
  );

  useEffect(() => {
    if (!editor) return;
    editor.isEditable = editable;
    const el = editor.domElement as HTMLElement | undefined;
    if (!editable) {
      if (el) {
        el.style.userSelect = 'text';
        (
          el.style as CSSStyleDeclaration & { webkitUserSelect?: string }
        ).webkitUserSelect = 'text';
      }
    }
  }, [editor, editable]);

  useEffect(() => {
    if (!editor || !onContentChange) return;
    let lastContent = '';
    const handleContentChange = () => {
      const topLevelBlocks =
        editor.topLevelBlocks as unknown as DefaultPartialBlock[];
      const currentContent = JSON.stringify(topLevelBlocks);
      if (lastContent === currentContent) return;
      lastContent = currentContent;
      onContentChange(topLevelBlocks);
    };
    editor.onEditorContentChange(handleContentChange);
    return () => {};
  }, [editor, onContentChange]);

  // 외부에서 imperative API 접근을 위한 ref 연결
  useEffect(() => {
    if (!editorRef) return;
    editorRef.current = editor ?? null;
    return () => {
      if (editorRef) editorRef.current = null;
    };
  }, [editor, editorRef]);

  useEffect(() => {
    const el = editor?.domElement as HTMLElement | undefined;
    if (!el) return;
    const handleDragOver = (e: DragEvent) => {
      if (e.defaultPrevented) return;
      const hasFiles = (
        e.dataTransfer?.types as unknown as string[] | undefined
      )?.includes?.('Files');
      if (hasFiles) {
        e.preventDefault();
        e.stopPropagation();
        // @ts-ignore
        if (typeof (e as any).stopImmediatePropagation === 'function') {
          // @ts-ignore
          (e as any).stopImmediatePropagation();
        }
      }
    };

    const handleDrop = (e: DragEvent) => {
      if (!e.dataTransfer) return;
      const hasFiles = (
        (e.dataTransfer.types as unknown as string[] | undefined) ?? []
      ).includes('Files');
      if (!hasFiles) return;

      // 기본 드롭 동작을 항상 차단해, 허용되지 않는 파일이 렌더링되지 않도록 함
      e.preventDefault();
      e.stopPropagation();
      // @ts-ignore
      (e as any).stopImmediatePropagation?.();

      // DataTransferItem 우선 (디렉토리/가짜 항목 배제)
      const items = Array.from(e.dataTransfer.items ?? []);
      const files = items
        .filter((it) => it.kind === 'file')
        .map((it) => it.getAsFile())
        .filter((f): f is File => !!f);

      const accepted = files.filter(
        (f) =>
          f.size > 0 &&
          (f.type?.startsWith('image/') ||
            (!f.type && /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(f.name || ''))),
      );
      if (accepted.length === 0) return; // 차단만 하고 아무것도 삽입하지 않음

      (async () => {
        const doUpload =
          uploadFile ??
          (storeImagesAsBase64 ? fileToBase64 : createObjectUrlUploader);
        for (const f of accepted) {
          try {
            const url = await doUpload(f);
            editor?.pasteHTML(`<img src="${url}" alt="image" />`);
          } catch (err) {
            // 실패 파일은 삽입하지 않음
            console.warn('Image upload failed, skipped:', f.name || '', err);
            continue;
          }
        }
      })();
    };
    el.addEventListener('dragover', handleDragOver, { capture: true });
    el.addEventListener('drop', handleDrop, { capture: true });
    return () => {
      el.removeEventListener('dragover', handleDragOver, {
        capture: true,
      } as any);
      el.removeEventListener('drop', handleDrop, { capture: true } as any);
    };
  }, [
    editor,
    uploadFile,
    storeImagesAsBase64,
    allowVideoUpload,
    allowAudioUpload,
  ]);

  // Add block 버튼을 끄면 기본 SideMenu를 비활성화하고 커스텀 SideMenu만 렌더(드래그 핸들 유지)
  const computedSideMenu = sideMenuAddButton ? sideMenu : false;

  // 공식 가이드 방식: 커스텀 SideMenu 컴포넌트 전달 (버튼 미제공 → 플러스 버튼 없음)
  // 공식 가이드 패턴: props를 전달받아 DragHandleButton만 유지
  const DragHandleOnlySideMenu = (props: any) => {
    return (
      <BlockSideMenu {...props}>
        <DragHandleButton {...props} />
      </BlockSideMenu>
    );
  };

  return (
    <BlockNoteView
      className={cn(
        includeDefaultStyles &&
          'lumirEditor w-full h-full overflow-auto [&_[data-content-type="paragraph"]]:text-[14px]',
        className,
      )}
      editor={editor}
      editable={editable}
      theme={theme as 'light' | 'dark' | undefined}
      formattingToolbar={formattingToolbar}
      linkToolbar={linkToolbar}
      sideMenu={computedSideMenu}
      slashMenu={false}
      emojiPicker={emojiPicker}
      filePanel={filePanel}
      tableHandles={tableHandles}
      comments={comments}
      onSelectionChange={onSelectionChange}>
      <SuggestionMenuController
        triggerCharacter='/'
        getItems={async (query: string) => {
          const items = getDefaultReactSlashMenuItems(editor);
          const filtered = items.filter((it: any) => {
            const k = (it?.key || '').toString();
            if (['video', 'audio', 'file'].includes(k)) return false;
            return true;
          });
          if (!query) return filtered;
          const q = query.toLowerCase();
          return filtered.filter(
            (it: any) =>
              (it.title || '').toLowerCase().includes(q) ||
              (it.aliases || []).some((a: string) =>
                a.toLowerCase().includes(q),
              ),
          );
        }}
      />
      {!sideMenuAddButton && (
        <SideMenuController sideMenu={DragHandleOnlySideMenu} />
      )}
    </BlockNoteView>
  );
}
