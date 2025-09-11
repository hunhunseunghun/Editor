"use client";

import { useEffect, useMemo } from "react";
import {
  useCreateBlockNote,
  SideMenu as BlockSideMenu,
  SideMenuController,
  DragHandleButton,
  SuggestionMenuController,
  getDefaultReactSlashMenuItems,
} from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import { cn } from "../utils/cn";

import type {
  DefaultPartialBlock,
  LumirEditorProps,
  DefaultBlockSchema,
  DefaultInlineContentSchema,
  DefaultStyleSchema,
} from "../types";

// ==========================================
// 유틸리티 클래스들 (안전한 리팩토링)
// ==========================================

/**
 * 콘텐츠 관리 유틸리티
 * 기본 블록 생성 및 콘텐츠 검증 로직을 담당
 */
export class ContentUtils {
  /**
   * JSON 문자열의 유효성을 검증합니다
   * @param jsonString 검증할 JSON 문자열
   * @returns 유효한 JSON 문자열인지 여부
   */
  static isValidJSONString(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      return Array.isArray(parsed);
    } catch {
      return false;
    }
  }

  /**
   * JSON 문자열을 DefaultPartialBlock 배열로 파싱합니다
   * @param jsonString JSON 문자열
   * @returns 파싱된 블록 배열 또는 null (파싱 실패 시)
   */
  static parseJSONContent(jsonString: string): DefaultPartialBlock[] | null {
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed)) {
        return parsed as DefaultPartialBlock[];
      }
      return null;
    } catch {
      return null;
    }
  }
  /**
   * 기본 paragraph 블록 생성
   * @returns 기본 설정이 적용된 DefaultPartialBlock
   */
  static createDefaultBlock(): DefaultPartialBlock {
    return {
      type: "paragraph",
      props: {
        textColor: "default",
        backgroundColor: "default",
        textAlignment: "left",
      },
      content: [{ type: "text", text: "", styles: {} }],
      children: [],
    };
  }

  /**
   * 콘텐츠 유효성 검증 및 기본값 설정
   * @param content 사용자 제공 콘텐츠 (객체 배열 또는 JSON 문자열)
   * @param emptyBlockCount 빈 블록 개수 (기본값: 3)
   * @param placeholder 첫 번째 블록의 placeholder 텍스트
   * @returns 검증된 콘텐츠 배열
   */
  static validateContent(
    content?: DefaultPartialBlock[] | string,
    emptyBlockCount: number = 3,
    placeholder?: string
  ): DefaultPartialBlock[] {
    // 1. 문자열인 경우 JSON 파싱 시도
    if (typeof content === "string") {
      if (content.trim() === "") {
        return this.createEmptyBlocks(emptyBlockCount, placeholder);
      }

      const parsedContent = this.parseJSONContent(content);
      if (parsedContent && parsedContent.length > 0) {
        return parsedContent;
      }

      // 파싱 실패 시 빈 블록 생성
      return this.createEmptyBlocks(emptyBlockCount, placeholder);
    }

    // 2. 배열인 경우 기존 로직
    if (!content || content.length === 0) {
      return this.createEmptyBlocks(emptyBlockCount, placeholder);
    }

    return content;
  }

  /**
   * 빈 블록들을 생성합니다
   * @param emptyBlockCount 생성할 블록 개수
   * @param placeholder 첫 번째 블록의 placeholder 텍스트
   * @returns 생성된 빈 블록 배열
   */
  private static createEmptyBlocks(
    emptyBlockCount: number,
    placeholder?: string
  ): DefaultPartialBlock[] {
    return Array.from({ length: emptyBlockCount }, (_, index) => {
      const block = this.createDefaultBlock();
      // 첫 번째 블록에 placeholder 텍스트 적용
      if (index === 0 && placeholder) {
        block.content = [{ type: "text", text: placeholder, styles: {} }];
      }
      return block;
    });
  }
}

/**
 * 에디터 설정 관리 유틸리티
 * 각종 설정의 기본값과 검증 로직을 담당
 */
export class EditorConfig {
  /**
   * 테이블 설정 기본값 적용
   * @param userTables 사용자 테이블 설정
   * @returns 기본값이 적용된 테이블 설정
   */
  static getDefaultTableConfig(userTables?: LumirEditorProps["tables"]) {
    return {
      splitCells: userTables?.splitCells ?? true,
      cellBackgroundColor: userTables?.cellBackgroundColor ?? true,
      cellTextColor: userTables?.cellTextColor ?? true,
      headers: userTables?.headers ?? true,
    };
  }

  /**
   * 헤딩 설정 기본값 적용
   * @param userHeading 사용자 헤딩 설정
   * @returns 기본값이 적용된 헤딩 설정
   */
  static getDefaultHeadingConfig(userHeading?: LumirEditorProps["heading"]) {
    return userHeading?.levels && userHeading.levels.length > 0
      ? userHeading
      : { levels: [1, 2, 3, 4, 5, 6] as (1 | 2 | 3 | 4 | 5 | 6)[] };
  }

  /**
   * 비활성화할 확장 기능 목록 생성
   * @param userExtensions 사용자 정의 비활성 확장
   * @param allowVideo 비디오 업로드 허용 여부
   * @param allowAudio 오디오 업로드 허용 여부
   * @returns 비활성화할 확장 기능 목록
   */
  static getDisabledExtensions(
    userExtensions?: string[],
    allowVideo = false,
    allowAudio = false
  ): string[] {
    const set = new Set<string>(userExtensions ?? []);
    if (!allowVideo) set.add("video");
    if (!allowAudio) set.add("audio");
    return Array.from(set);
  }
}

const createObjectUrlUploader = async (file: File): Promise<string> => {
  return URL.createObjectURL(file);
};

const fileToBase64 = async (file: File): Promise<string> =>
  await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("FileReader failed"));
    reader.readAsDataURL(file);
  });

export default function LumirEditor({
  // editor options
  initialContent,
  initialEmptyBlocks = 3,
  placeholder,
  uploadFile,
  pasteHandler,
  tables,
  heading,
  animations = true,
  defaultStyles = true,
  disableExtensions,
  domAttributes,
  tabBehavior = "prefer-navigate-ui",
  trailingBlock = true,
  resolveFileUrl,
  storeImagesAsBase64 = true,
  allowVideoUpload = false,
  allowAudioUpload = false,
  allowFileUpload = false,
  // view options
  editable = true,
  theme = "light",
  formattingToolbar = true,
  linkToolbar = true,
  sideMenu = true,
  slashMenu = true,
  emojiPicker = true,
  filePanel = true,
  tableHandles = true,
  comments = true,
  onSelectionChange,
  className = "",
  includeDefaultStyles = true,
  sideMenuAddButton = true,
  // callbacks / refs
  onContentChange,
  editorRef,
}: LumirEditorProps) {
  const validatedContent = useMemo<DefaultPartialBlock[]>(() => {
    return ContentUtils.validateContent(
      initialContent,
      initialEmptyBlocks,
      placeholder
    );
  }, [initialContent, initialEmptyBlocks, placeholder]);

  const editor = useCreateBlockNote<
    DefaultBlockSchema,
    DefaultInlineContentSchema,
    DefaultStyleSchema
  >(
    {
      initialContent: validatedContent as DefaultPartialBlock[],
      tables: EditorConfig.getDefaultTableConfig(tables),
      heading: EditorConfig.getDefaultHeadingConfig(heading),
      animations,
      defaultStyles,
      // 확장 비활성: 비디오/오디오만 제어(파일 확장은 내부 드롭 로직 의존 → 비활성화하지 않음)
      disableExtensions: useMemo(() => {
        return EditorConfig.getDisabledExtensions(
          disableExtensions,
          allowVideoUpload,
          allowAudioUpload
        );
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
            throw new Error("Failed to process file for upload");
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
            (f.type?.startsWith("image/") ||
              (!f.type &&
                /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(f.name || "")))
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
                "Image upload failed, skipped:",
                file.name || "",
                err
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
      heading?.levels?.join(","),
      animations,
      defaultStyles,
      disableExtensions?.join(","),
      domAttributes ? JSON.stringify(domAttributes) : undefined,
      tabBehavior,
      trailingBlock,
      resolveFileUrl,
    ]
  );

  useEffect(() => {
    if (!editor) return;
    editor.isEditable = editable;
    const el = editor.domElement as HTMLElement | undefined;
    if (!editable) {
      if (el) {
        el.style.userSelect = "text";
        (
          el.style as CSSStyleDeclaration & { webkitUserSelect?: string }
        ).webkitUserSelect = "text";
      }
    }
  }, [editor, editable]);

  useEffect(() => {
    if (!editor || !onContentChange) return;
    let lastContent = "";
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
      )?.includes?.("Files");
      if (hasFiles) {
        e.preventDefault();
        e.stopPropagation();
        // @ts-ignore
        if (typeof (e as any).stopImmediatePropagation === "function") {
          // @ts-ignore
          (e as any).stopImmediatePropagation();
        }
      }
    };

    const handleDrop = (e: DragEvent) => {
      if (!e.dataTransfer) return;
      const hasFiles = (
        (e.dataTransfer.types as unknown as string[] | undefined) ?? []
      ).includes("Files");
      if (!hasFiles) return;

      // 기본 드롭 동작을 항상 차단해, 허용되지 않는 파일이 렌더링되지 않도록 함
      e.preventDefault();
      e.stopPropagation();
      // @ts-ignore
      (e as any).stopImmediatePropagation?.();

      // DataTransferItem 우선 (디렉토리/가짜 항목 배제)
      const items = Array.from(e.dataTransfer.items ?? []);
      const files = items
        .filter((it) => it.kind === "file")
        .map((it) => it.getAsFile())
        .filter((f): f is File => !!f);

      const accepted = files.filter(
        (f) =>
          f.size > 0 &&
          (f.type?.startsWith("image/") ||
            (!f.type && /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(f.name || "")))
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
            console.warn("Image upload failed, skipped:", f.name || "", err);
            continue;
          }
        }
      })();
    };
    el.addEventListener("dragover", handleDragOver, { capture: true });
    el.addEventListener("drop", handleDrop, { capture: true });
    return () => {
      el.removeEventListener("dragover", handleDragOver, {
        capture: true,
      } as any);
      el.removeEventListener("drop", handleDrop, { capture: true } as any);
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
          'lumirEditor w-full h-full min-w-[300px] overflow-auto rounded-md border border-gray-300 focus-within:ring-2 focus-within:ring-black [&_.bn-editor]:px-[12px] [&_[data-content-type="paragraph"]]:text-[14px] bg-white',
        className
      )}
      editor={editor}
      editable={editable}
      theme={theme as "light" | "dark" | undefined}
      formattingToolbar={formattingToolbar}
      linkToolbar={linkToolbar}
      sideMenu={computedSideMenu}
      slashMenu={false}
      emojiPicker={emojiPicker}
      filePanel={filePanel}
      tableHandles={tableHandles}
      comments={comments}
      onSelectionChange={onSelectionChange}
    >
      <SuggestionMenuController
        triggerCharacter="/"
        getItems={async (query: string) => {
          const items = getDefaultReactSlashMenuItems(editor);
          const filtered = items.filter((it: any) => {
            const k = (it?.key || "").toString();
            if (["video", "audio", "file"].includes(k)) return false;
            return true;
          });
          if (!query) return filtered;
          const q = query.toLowerCase();
          return filtered.filter(
            (it: any) =>
              (it.title || "").toLowerCase().includes(q) ||
              (it.aliases || []).some((a: string) =>
                a.toLowerCase().includes(q)
              )
          );
        }}
      />
      {!sideMenuAddButton && (
        <SideMenuController sideMenu={DragHandleOnlySideMenu} />
      )}
    </BlockNoteView>
  );
}
