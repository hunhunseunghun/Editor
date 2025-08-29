"use client";

// src/components/LumirEditor.tsx
import { useEffect, useMemo } from "react";
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

// src/components/LumirEditor.tsx
import { jsx, jsxs } from "react/jsx-runtime";
var createObjectUrlUploader = async (file) => {
  return URL.createObjectURL(file);
};
var fileToBase64 = async (file) => await new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(String(reader.result));
  reader.onerror = reject;
  reader.readAsDataURL(file);
});
function LumirEditor({
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
  editorRef
}) {
  const validatedContent = useMemo(() => {
    const defaultContent = [
      {
        type: "paragraph",
        props: {
          textColor: "default",
          backgroundColor: "default",
          textAlignment: "left"
        },
        content: [{ type: "text", text: "", styles: {} }],
        children: []
      }
    ];
    if (!initialContent || initialContent.length === 0) {
      return defaultContent;
    }
    return initialContent;
  }, [initialContent]);
  const editor = useCreateBlockNote(
    {
      initialContent: validatedContent,
      tables: {
        splitCells: tables?.splitCells ?? true,
        cellBackgroundColor: tables?.cellBackgroundColor ?? true,
        cellTextColor: tables?.cellTextColor ?? true,
        headers: tables?.headers ?? true
      },
      heading: heading?.levels && heading.levels.length > 0 ? heading : { levels: [1, 2, 3, 4, 5, 6] },
      animations,
      defaultStyles,
      // 확장 비활성: 비디오/오디오만 제어(파일 확장은 내부 드롭 로직 의존 → 비활성화하지 않음)
      disableExtensions: useMemo(() => {
        const set = new Set(disableExtensions ?? []);
        if (!allowVideoUpload) set.add("video");
        if (!allowAudioUpload) set.add("audio");
        return Array.from(set);
      }, [disableExtensions, allowVideoUpload, allowAudioUpload]),
      domAttributes,
      tabBehavior,
      trailingBlock,
      resolveFileUrl,
      uploadFile: async (file) => {
        const useFallback = !uploadFile;
        const fallbackUploader = storeImagesAsBase64 ? fileToBase64 : createObjectUrlUploader;
        try {
          const url = useFallback ? await fallbackUploader(file) : await uploadFile(file);
          return url;
        } catch (e) {
          throw e;
        }
      },
      pasteHandler: (ctx) => {
        const { event, editor: editor2, defaultPasteHandler } = ctx;
        const fileList = event?.clipboardData?.files ?? null;
        const files = fileList ? Array.from(fileList) : [];
        const accepted = files.filter(
          (f) => f.type?.startsWith("image/") || !f.type && /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(f.name || "")
        );
        if (accepted.length === 0) return defaultPasteHandler() ?? false;
        event.preventDefault();
        (async () => {
          const doUpload = uploadFile ?? (storeImagesAsBase64 ? fileToBase64 : createObjectUrlUploader);
          for (const file of accepted) {
            try {
              const url = await doUpload(file);
              editor2.pasteHTML(`<img src="${url}" alt="image" />`);
            } catch {
            }
          }
        })();
        return true;
      }
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
      domAttributes ? JSON.stringify(domAttributes) : void 0,
      tabBehavior,
      trailingBlock,
      resolveFileUrl
    ]
  );
  useEffect(() => {
    if (!editor) return;
    editor.isEditable = editable;
    const el = editor.domElement;
    if (!editable) {
      if (el) {
        el.style.userSelect = "text";
        el.style.webkitUserSelect = "text";
      }
    }
  }, [editor, editable]);
  useEffect(() => {
    if (!editor || !onContentChange) return;
    let lastContent = "";
    const handleContentChange = () => {
      const topLevelBlocks = editor.topLevelBlocks;
      const currentContent = JSON.stringify(topLevelBlocks);
      if (lastContent === currentContent) return;
      lastContent = currentContent;
      onContentChange(topLevelBlocks);
    };
    editor.onEditorContentChange(handleContentChange);
    return () => {
    };
  }, [editor, onContentChange]);
  useEffect(() => {
    if (!editorRef) return;
    editorRef.current = editor ?? null;
    return () => {
      if (editorRef) editorRef.current = null;
    };
  }, [editor, editorRef]);
  useEffect(() => {
    const el = editor?.domElement;
    if (!el) return;
    const handleDragOver = (e) => {
      if (e.defaultPrevented) return;
      const hasFiles = e.dataTransfer?.types?.includes?.("Files");
      if (hasFiles) {
        e.preventDefault();
        e.stopPropagation();
        if (typeof e.stopImmediatePropagation === "function") {
          e.stopImmediatePropagation();
        }
      }
    };
    const handleDrop = (e) => {
      if (e.defaultPrevented) return;
      if (!e.dataTransfer) return;
      const items = Array.from(e.dataTransfer.items ?? []);
      const files = items.filter((it) => it.kind === "file").map((it) => it.getAsFile()).filter((f) => !!f);
      const accepted = files.filter(
        (f) => f.type?.startsWith("image/") || !f.type && /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(f.name || "")
      );
      if (accepted.length === 0) return;
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation?.();
      (async () => {
        const doUpload = uploadFile ?? (storeImagesAsBase64 ? fileToBase64 : createObjectUrlUploader);
        for (const f of accepted) {
          try {
            const url = await doUpload(f);
            editor?.pasteHTML(`<img src="${url}" alt="image" />`);
          } catch {
          }
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
  }, [
    editor,
    uploadFile,
    storeImagesAsBase64,
    allowVideoUpload,
    allowAudioUpload
  ]);
  const computedSideMenu = sideMenuAddButton ? sideMenu : false;
  const DragHandleOnlySideMenu = (props) => {
    return /* @__PURE__ */ jsx(BlockSideMenu, { ...props, children: /* @__PURE__ */ jsx(DragHandleButton, { ...props }) });
  };
  return /* @__PURE__ */ jsxs(
    BlockNoteView,
    {
      className: cn(
        includeDefaultStyles && 'lumirEditor w-full h-full overflow-auto [&_[data-content-type="paragraph"]]:text-[14px]',
        className
      ),
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
      comments,
      onSelectionChange,
      children: [
        /* @__PURE__ */ jsx(
          SuggestionMenuController,
          {
            triggerCharacter: "/",
            getItems: async (query) => {
              const items = getDefaultReactSlashMenuItems(editor);
              const filtered = items.filter((it) => {
                const k = (it?.key || "").toString();
                if (["video", "audio", "file"].includes(k)) return false;
                return true;
              });
              if (!query) return filtered;
              const q = query.toLowerCase();
              return filtered.filter(
                (it) => (it.title || "").toLowerCase().includes(q) || (it.aliases || []).some(
                  (a) => a.toLowerCase().includes(q)
                )
              );
            }
          }
        ),
        !sideMenuAddButton && /* @__PURE__ */ jsx(SideMenuController, { sideMenu: DragHandleOnlySideMenu })
      ]
    }
  );
}
export {
  LumirEditor,
  cn
};
//# sourceMappingURL=index.mjs.map