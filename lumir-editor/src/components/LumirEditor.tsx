"use client";

import { useEffect, useMemo, useCallback, useState } from "react";
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

import { createS3Uploader } from "../utils/s3-uploader";

// ==========================================
// 유틸리티 클래스들
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
   * @returns 검증된 콘텐츠 배열
   */
  static validateContent(
    content?: DefaultPartialBlock[] | string,
    emptyBlockCount: number = 3
  ): DefaultPartialBlock[] {
    // 1. 문자열인 경우 JSON 파싱 시도
    if (typeof content === "string") {
      if (content.trim() === "") {
        return this.createEmptyBlocks(emptyBlockCount);
      }

      const parsedContent = this.parseJSONContent(content);
      if (parsedContent && parsedContent.length > 0) {
        return parsedContent;
      }

      // 파싱 실패 시 빈 블록 생성
      return this.createEmptyBlocks(emptyBlockCount);
    }

    // 2. 배열인 경우 기존 로직
    if (!content || content.length === 0) {
      return this.createEmptyBlocks(emptyBlockCount);
    }

    return content;
  }

  /**
   * 빈 블록들을 생성합니다
   * @param emptyBlockCount 생성할 블록 개수
   * @returns 생성된 빈 블록 배열
   */
  private static createEmptyBlocks(
    emptyBlockCount: number
  ): DefaultPartialBlock[] {
    return Array.from({ length: emptyBlockCount }, () =>
      this.createDefaultBlock()
    );
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
   * @param allowFile 일반 파일 업로드 허용 여부
   * @returns 비활성화할 확장 기능 목록
   */
  static getDisabledExtensions(
    userExtensions?: string[],
    allowVideo = false,
    allowAudio = false,
    allowFile = false
  ): string[] {
    const set = new Set<string>(userExtensions ?? []);
    if (!allowVideo) set.add("video");
    if (!allowAudio) set.add("audio");
    if (!allowFile) set.add("file");
    return Array.from(set);
  }
}

const createObjectUrlUploader = async (file: File): Promise<string> => {
  return URL.createObjectURL(file);
};

// 파일 타입 검증 함수
const isImageFile = (file: File): boolean => {
  return (
    file.size > 0 &&
    (file.type?.startsWith("image/") ||
      (!file.type && /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(file.name || "")))
  );
};

export default function LumirEditor({
  // editor options
  initialContent,
  initialEmptyBlocks = 3,
  uploadFile,
  s3Upload,
  tables,
  heading,
  defaultStyles = true,
  disableExtensions,
  tabBehavior = "prefer-navigate-ui",
  trailingBlock = true,
  resolveFileUrl,
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
  onSelectionChange,
  className = "",
  sideMenuAddButton = false,
  // callbacks / refs
  onContentChange,
}: LumirEditorProps) {
  // 이미지 업로드 로딩 상태
  const [isUploading, setIsUploading] = useState(false);
  const validatedContent = useMemo<DefaultPartialBlock[]>(() => {
    return ContentUtils.validateContent(initialContent, initialEmptyBlocks);
  }, [initialContent, initialEmptyBlocks]);

  // 테이블 설정 메모이제이션
  const tableConfig = useMemo(() => {
    return EditorConfig.getDefaultTableConfig(tables);
  }, [
    tables?.splitCells,
    tables?.cellBackgroundColor,
    tables?.cellTextColor,
    tables?.headers,
  ]);

  // 헤딩 설정 메모이제이션
  const headingConfig = useMemo(() => {
    return EditorConfig.getDefaultHeadingConfig(heading);
  }, [heading?.levels?.join(",") ?? ""]);

  // 비활성화 확장 메모이제이션
  const disabledExtensions = useMemo(() => {
    return EditorConfig.getDisabledExtensions(
      disableExtensions,
      allowVideoUpload,
      allowAudioUpload,
      allowFileUpload
    );
  }, [disableExtensions, allowVideoUpload, allowAudioUpload, allowFileUpload]);

  // S3 업로드 설정 메모이제이션 (객체 참조 안정화)
  const memoizedS3Upload = useMemo(() => {
    return s3Upload;
  }, [
    s3Upload?.apiEndpoint,
    s3Upload?.env,
    s3Upload?.author,
    s3Upload?.userId,
    s3Upload?.path,
  ]);

  const editor = useCreateBlockNote<
    DefaultBlockSchema,
    DefaultInlineContentSchema,
    DefaultStyleSchema
  >(
    {
      initialContent: validatedContent as DefaultPartialBlock[],
      tables: tableConfig,
      heading: headingConfig,
      animations: false, // 기본적으로 애니메이션 비활성화
      defaultStyles,
      // 확장 비활성: 비디오/오디오/파일 제어
      disableExtensions: disabledExtensions,
      tabBehavior,
      trailingBlock,
      resolveFileUrl,
      uploadFile: async (file) => {
        // 이미지 파일만 허용 (이미지 전용 에디터)
        if (!isImageFile(file)) {
          throw new Error("Only image files are allowed");
        }

        try {
          let imageUrl: string;

          // 1. 사용자 정의 uploadFile 우선
          if (uploadFile) {
            imageUrl = await uploadFile(file);
          }
          // 2. S3 업로드 (uploadFile 없을 때)
          else if (memoizedS3Upload?.apiEndpoint) {
            const s3Uploader = createS3Uploader(memoizedS3Upload);
            imageUrl = await s3Uploader(file);
          }
          // 3. 업로드 방법이 없으면 에러
          else {
            throw new Error("No upload method available");
          }

          // BlockNote가 자동으로 이미지 블록을 생성하도록 URL만 반환
          return imageUrl;
        } catch (error) {
          console.error("Image upload failed:", error);
          throw new Error(
            "Upload failed: " +
              (error instanceof Error ? error.message : String(error))
          );
        }
      },
      pasteHandler: (ctx) => {
        const { event, editor, defaultPasteHandler } = ctx as any;
        const fileList =
          (event?.clipboardData?.files as FileList | null) ?? null;
        const files: File[] = fileList ? Array.from(fileList) : [];
        const acceptedFiles: File[] = files.filter(isImageFile);

        // 파일이 있지만 이미지가 없으면 기본 처리 막고 무시
        if (files.length > 0 && acceptedFiles.length === 0) {
          event.preventDefault();
          return true;
        }

        // 이미지가 없으면 기본 처리
        if (acceptedFiles.length === 0) {
          return defaultPasteHandler() ?? false;
        }

        event.preventDefault();
        (async () => {
          // 붙여넣기로 여러 이미지 업로드 시 로딩 상태 관리
          setIsUploading(true);
          try {
            for (const file of acceptedFiles) {
              try {
                // 에디터의 uploadFile 함수 사용 (통일된 로직)
                const url = await editor.uploadFile(file);
                editor.pasteHTML(`<img src="${url}" alt="image" />`);
              } catch (err) {
                console.warn(
                  "Image upload failed, skipped:",
                  file.name || "",
                  err
                );
              }
            }
          } finally {
            setIsUploading(false);
          }
        })();
        return true;
      },
    },
    [
      validatedContent,
      tableConfig,
      headingConfig,
      defaultStyles,
      disabledExtensions,
      tabBehavior,
      trailingBlock,
      resolveFileUrl,
      uploadFile,
      memoizedS3Upload,
    ]
  );

  // 편집 가능 여부 설정
  useEffect(() => {
    if (editor) {
      editor.isEditable = editable;
    }
  }, [editor, editable]);

  // 콘텐츠 변경 감지
  useEffect(() => {
    if (!editor || !onContentChange) return;

    const handleContentChange = () => {
      // BlockNote의 올바른 API 사용
      const blocks = editor.topLevelBlocks as DefaultPartialBlock[];
      onContentChange(blocks);
    };

    return editor.onEditorContentChange(handleContentChange);
  }, [editor, onContentChange]);

  // 드래그앤드롭 이미지 처리
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
      }
    };

    const handleDrop = (e: DragEvent) => {
      if (!e.dataTransfer) return;
      const hasFiles = (
        (e.dataTransfer.types as unknown as string[] | undefined) ?? []
      ).includes("Files");
      if (!hasFiles) return;

      e.preventDefault();
      e.stopPropagation();

      const items = Array.from(e.dataTransfer.items ?? []);
      const files = items
        .filter((it) => it.kind === "file")
        .map((it) => it.getAsFile())
        .filter((f): f is File => !!f);

      // 이미지 파일만 허용
      const acceptedFiles = files.filter(isImageFile);

      if (acceptedFiles.length === 0) return;

      (async () => {
        // 드래그앤드롭으로 여러 이미지 업로드 시 로딩 상태 관리
        setIsUploading(true);
        try {
          for (const file of acceptedFiles) {
            try {
              // 에디터의 uploadFile 함수 사용 (일관된 로직)
              if (editor?.uploadFile) {
                const url = await editor.uploadFile(file);
                if (url) {
                  editor.pasteHTML(`<img src="${url}" alt="image" />`);
                }
              }
            } catch (err) {
              console.warn(
                "Image upload failed, skipped:",
                file.name || "",
                err
              );
            }
          }
        } finally {
          setIsUploading(false);
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
  }, [editor]);

  // SideMenu 설정 (Add 버튼 제어)
  const computedSideMenu = useMemo(() => {
    return sideMenuAddButton ? sideMenu : false;
  }, [sideMenuAddButton, sideMenu]);

  // Add 버튼 없는 사이드 메뉴 (드래그 핸들만) - 메모이제이션
  const DragHandleOnlySideMenu = useMemo(() => {
    return (props: any) => (
      <BlockSideMenu {...props}>
        <DragHandleButton {...props} />
      </BlockSideMenu>
    );
  }, []);

  return (
    <div
      className={cn("lumirEditor", className)}
      style={{ position: "relative" }}
    >
      <BlockNoteView
        editor={editor}
        editable={editable}
        theme={theme}
        formattingToolbar={formattingToolbar}
        linkToolbar={linkToolbar}
        sideMenu={computedSideMenu}
        slashMenu={false}
        emojiPicker={emojiPicker}
        filePanel={filePanel}
        tableHandles={tableHandles}
        onSelectionChange={onSelectionChange}
      >
        {slashMenu && (
          <SuggestionMenuController
            triggerCharacter="/"
            getItems={useCallback(
              async (query: string) => {
                const items = getDefaultReactSlashMenuItems(editor);
                // 비디오, 오디오, 파일 관련 항목 제거
                const filtered = items.filter((item: any) => {
                  const key = (item?.key || "").toString().toLowerCase();
                  const title = (item?.title || "").toString().toLowerCase();
                  // 비디오, 오디오, 파일 관련 항목 제거
                  if (["video", "audio", "file"].includes(key)) return false;
                  if (
                    title.includes("video") ||
                    title.includes("audio") ||
                    title.includes("file")
                  )
                    return false;
                  return true;
                });

                if (!query) return filtered;
                const q = query.toLowerCase();
                return filtered.filter(
                  (item: any) =>
                    item.title?.toLowerCase().includes(q) ||
                    (item.aliases || []).some((a: string) =>
                      a.toLowerCase().includes(q)
                    )
                );
              },
              [editor]
            )}
          />
        )}
        {!sideMenuAddButton && (
          <SideMenuController sideMenu={DragHandleOnlySideMenu} />
        )}
      </BlockNoteView>

      {/* 이미지 업로드 로딩 스피너 */}
      {isUploading && (
        <div className="lumirEditor-upload-overlay">
          <div className="lumirEditor-spinner" />
        </div>
      )}
    </div>
  );
}
