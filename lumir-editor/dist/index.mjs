"use client";

// src/components/LumirEditor.tsx
import { useEffect, useMemo, useCallback, useState } from "react";
import {
  useCreateBlockNote,
  SideMenu as BlockSideMenu,
  SideMenuController,
  DragHandleButton,
  SuggestionMenuController,
  getDefaultReactSlashMenuItems
} from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";

// src/utils/cn.ts
function cn(...inputs) {
  return inputs.filter(Boolean).join(" ");
}

// src/utils/s3-uploader.ts
var createS3Uploader = (config) => {
  const { apiEndpoint, env, author, userId, path } = config;
  if (!apiEndpoint || apiEndpoint.trim() === "") {
    throw new Error(
      "apiEndpoint is required for S3 upload. Please provide a valid API endpoint."
    );
  }
  if (!env) {
    throw new Error("env is required. Must be 'development' or 'production'.");
  }
  if (!author) {
    throw new Error("author is required. Must be 'admin' or 'user'.");
  }
  if (!userId || userId.trim() === "") {
    throw new Error("userId is required and cannot be empty.");
  }
  if (!path || path.trim() === "") {
    throw new Error("path is required and cannot be empty.");
  }
  const generateHierarchicalFileName = (file) => {
    const now = /* @__PURE__ */ new Date();
    const date = now.toISOString().split("T")[0];
    const time = now.toTimeString().split(" ")[0];
    const filename = file.name;
    return `${env}/${author}/${userId}/${path}/${date}/${time}/${filename}`;
  };
  return async (file) => {
    try {
      console.log("\u{1F680} S3 \uC5C5\uB85C\uB4DC \uC2DC\uC791:", file.name, "\uD06C\uAE30:", file.size);
      if (!apiEndpoint || apiEndpoint.trim() === "") {
        throw new Error(
          "Invalid apiEndpoint: Cannot upload file without a valid API endpoint."
        );
      }
      const fileName = generateHierarchicalFileName(file);
      const response = await fetch(
        `${apiEndpoint}?key=${encodeURIComponent(fileName)}`
      );
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to get presigned URL: ${response.statusText}`);
      }
      const responseData = await response.json();
      const { presignedUrl, publicUrl } = responseData;
      const uploadResponse = await fetch(presignedUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type || "application/octet-stream"
        },
        body: file
      });
      if (!uploadResponse.ok) {
        throw new Error(`Failed to upload file: ${uploadResponse.statusText}`);
      }
      return publicUrl;
    } catch (error) {
      console.error("S3 upload failed:", error);
      throw error;
    }
  };
};

// src/components/LumirEditor.tsx
import { jsx, jsxs } from "react/jsx-runtime";
var ContentUtils = class {
  /**
   * JSON 문자열의 유효성을 검증합니다
   * @param jsonString 검증할 JSON 문자열
   * @returns 유효한 JSON 문자열인지 여부
   */
  static isValidJSONString(jsonString) {
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
  static parseJSONContent(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed)) {
        return parsed;
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
  static createDefaultBlock() {
    return {
      type: "paragraph",
      props: {
        textColor: "default",
        backgroundColor: "default",
        textAlignment: "left"
      },
      content: [{ type: "text", text: "", styles: {} }],
      children: []
    };
  }
  /**
   * 콘텐츠 유효성 검증 및 기본값 설정
   * @param content 사용자 제공 콘텐츠 (객체 배열 또는 JSON 문자열)
   * @param emptyBlockCount 빈 블록 개수 (기본값: 3)
   * @returns 검증된 콘텐츠 배열
   */
  static validateContent(content, emptyBlockCount = 3) {
    if (typeof content === "string") {
      if (content.trim() === "") {
        return this.createEmptyBlocks(emptyBlockCount);
      }
      const parsedContent = this.parseJSONContent(content);
      if (parsedContent && parsedContent.length > 0) {
        return parsedContent;
      }
      return this.createEmptyBlocks(emptyBlockCount);
    }
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
  static createEmptyBlocks(emptyBlockCount) {
    return Array.from(
      { length: emptyBlockCount },
      () => this.createDefaultBlock()
    );
  }
};
var EditorConfig = class {
  /**
   * 테이블 설정 기본값 적용
   * @param userTables 사용자 테이블 설정
   * @returns 기본값이 적용된 테이블 설정
   */
  static getDefaultTableConfig(userTables) {
    return {
      splitCells: userTables?.splitCells ?? true,
      cellBackgroundColor: userTables?.cellBackgroundColor ?? true,
      cellTextColor: userTables?.cellTextColor ?? true,
      headers: userTables?.headers ?? true
    };
  }
  /**
   * 헤딩 설정 기본값 적용
   * @param userHeading 사용자 헤딩 설정
   * @returns 기본값이 적용된 헤딩 설정
   */
  static getDefaultHeadingConfig(userHeading) {
    return userHeading?.levels && userHeading.levels.length > 0 ? userHeading : { levels: [1, 2, 3, 4, 5, 6] };
  }
  /**
   * 비활성화할 확장 기능 목록 생성
   * @param userExtensions 사용자 정의 비활성 확장
   * @param allowVideo 비디오 업로드 허용 여부
   * @param allowAudio 오디오 업로드 허용 여부
   * @param allowFile 일반 파일 업로드 허용 여부
   * @returns 비활성화할 확장 기능 목록
   */
  static getDisabledExtensions(userExtensions, allowVideo = false, allowAudio = false, allowFile = false) {
    const set = new Set(userExtensions ?? []);
    if (!allowVideo) set.add("video");
    if (!allowAudio) set.add("audio");
    if (!allowFile) set.add("file");
    return Array.from(set);
  }
};
var isImageFile = (file) => {
  return file.size > 0 && (file.type?.startsWith("image/") || !file.type && /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(file.name || ""));
};
function LumirEditor({
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
  onContentChange
}) {
  const [isUploading, setIsUploading] = useState(false);
  const validatedContent = useMemo(() => {
    return ContentUtils.validateContent(initialContent, initialEmptyBlocks);
  }, [initialContent, initialEmptyBlocks]);
  const tableConfig = useMemo(() => {
    return EditorConfig.getDefaultTableConfig(tables);
  }, [
    tables?.splitCells,
    tables?.cellBackgroundColor,
    tables?.cellTextColor,
    tables?.headers
  ]);
  const headingConfig = useMemo(() => {
    return EditorConfig.getDefaultHeadingConfig(heading);
  }, [heading?.levels?.join(",") ?? ""]);
  const disabledExtensions = useMemo(() => {
    return EditorConfig.getDisabledExtensions(
      disableExtensions,
      allowVideoUpload,
      allowAudioUpload,
      allowFileUpload
    );
  }, [disableExtensions, allowVideoUpload, allowAudioUpload, allowFileUpload]);
  const memoizedS3Upload = useMemo(() => {
    return s3Upload;
  }, [
    s3Upload?.apiEndpoint,
    s3Upload?.env,
    s3Upload?.author,
    s3Upload?.userId,
    s3Upload?.path
  ]);
  const editor = useCreateBlockNote(
    {
      initialContent: validatedContent,
      tables: tableConfig,
      heading: headingConfig,
      animations: false,
      // 기본적으로 애니메이션 비활성화
      defaultStyles,
      // 확장 비활성: 비디오/오디오/파일 제어
      disableExtensions: disabledExtensions,
      tabBehavior,
      trailingBlock,
      resolveFileUrl,
      uploadFile: async (file) => {
        if (!isImageFile(file)) {
          throw new Error("Only image files are allowed");
        }
        try {
          let imageUrl;
          if (uploadFile) {
            imageUrl = await uploadFile(file);
          } else if (memoizedS3Upload?.apiEndpoint) {
            const s3Uploader = createS3Uploader(memoizedS3Upload);
            imageUrl = await s3Uploader(file);
          } else {
            throw new Error("No upload method available");
          }
          return imageUrl;
        } catch (error) {
          console.error("Image upload failed:", error);
          throw new Error(
            "Upload failed: " + (error instanceof Error ? error.message : String(error))
          );
        }
      },
      pasteHandler: (ctx) => {
        const { event, editor: editor2, defaultPasteHandler } = ctx;
        const fileList = event?.clipboardData?.files ?? null;
        const files = fileList ? Array.from(fileList) : [];
        const acceptedFiles = files.filter(isImageFile);
        if (files.length > 0 && acceptedFiles.length === 0) {
          event.preventDefault();
          return true;
        }
        if (acceptedFiles.length === 0) {
          return defaultPasteHandler() ?? false;
        }
        event.preventDefault();
        (async () => {
          setIsUploading(true);
          try {
            for (const file of acceptedFiles) {
              try {
                const url = await editor2.uploadFile(file);
                editor2.pasteHTML(`<img src="${url}" alt="image" />`);
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
      }
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
      memoizedS3Upload
    ]
  );
  useEffect(() => {
    if (editor) {
      editor.isEditable = editable;
    }
  }, [editor, editable]);
  useEffect(() => {
    if (!editor || !onContentChange) return;
    const handleContentChange = () => {
      const blocks = editor.topLevelBlocks;
      onContentChange(blocks);
    };
    return editor.onEditorContentChange(handleContentChange);
  }, [editor, onContentChange]);
  useEffect(() => {
    const el = editor?.domElement;
    if (!el) return;
    const handleDragOver = (e) => {
      if (e.defaultPrevented) return;
      const hasFiles = e.dataTransfer?.types?.includes?.("Files");
      if (hasFiles) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    const handleDrop = (e) => {
      if (!e.dataTransfer) return;
      const hasFiles = (e.dataTransfer.types ?? []).includes("Files");
      if (!hasFiles) return;
      e.preventDefault();
      e.stopPropagation();
      const items = Array.from(e.dataTransfer.items ?? []);
      const files = items.filter((it) => it.kind === "file").map((it) => it.getAsFile()).filter((f) => !!f);
      const acceptedFiles = files.filter(isImageFile);
      if (acceptedFiles.length === 0) return;
      (async () => {
        setIsUploading(true);
        try {
          for (const file of acceptedFiles) {
            try {
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
        capture: true
      });
      el.removeEventListener("drop", handleDrop, { capture: true });
    };
  }, [editor]);
  const computedSideMenu = useMemo(() => {
    return sideMenuAddButton ? sideMenu : false;
  }, [sideMenuAddButton, sideMenu]);
  const DragHandleOnlySideMenu = useMemo(() => {
    return (props) => /* @__PURE__ */ jsx(BlockSideMenu, { ...props, children: /* @__PURE__ */ jsx(DragHandleButton, { ...props }) });
  }, []);
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: cn("lumirEditor", className),
      style: { position: "relative" },
      children: [
        /* @__PURE__ */ jsxs(
          BlockNoteView,
          {
            editor,
            editable,
            theme,
            formattingToolbar,
            linkToolbar,
            sideMenu: computedSideMenu,
            slashMenu: false,
            emojiPicker,
            filePanel,
            tableHandles,
            onSelectionChange,
            children: [
              slashMenu && /* @__PURE__ */ jsx(
                SuggestionMenuController,
                {
                  triggerCharacter: "/",
                  getItems: useCallback(
                    async (query) => {
                      const items = getDefaultReactSlashMenuItems(editor);
                      const filtered = items.filter((item) => {
                        const key = (item?.key || "").toString().toLowerCase();
                        const title = (item?.title || "").toString().toLowerCase();
                        if (["video", "audio", "file"].includes(key)) return false;
                        if (title.includes("video") || title.includes("audio") || title.includes("file"))
                          return false;
                        return true;
                      });
                      if (!query) return filtered;
                      const q = query.toLowerCase();
                      return filtered.filter(
                        (item) => item.title?.toLowerCase().includes(q) || (item.aliases || []).some(
                          (a) => a.toLowerCase().includes(q)
                        )
                      );
                    },
                    [editor]
                  )
                }
              ),
              !sideMenuAddButton && /* @__PURE__ */ jsx(SideMenuController, { sideMenu: DragHandleOnlySideMenu })
            ]
          }
        ),
        isUploading && /* @__PURE__ */ jsx("div", { className: "lumirEditor-upload-overlay", children: /* @__PURE__ */ jsx("div", { className: "lumirEditor-spinner" }) })
      ]
    }
  );
}
export {
  ContentUtils,
  EditorConfig,
  LumirEditor,
  cn,
  createS3Uploader
};
//# sourceMappingURL=index.mjs.map