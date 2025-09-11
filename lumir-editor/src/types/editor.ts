import type {
  BlockNoteEditor as CoreBlockNoteEditor,
  PartialBlock,
  DefaultBlockSchema,
  DefaultInlineContentSchema,
  DefaultStyleSchema,
} from "@blocknote/core";

/**
 * LumirEditor에서 사용하는 BlockNote 에디터 타입
 */
export type EditorType = CoreBlockNoteEditor<
  DefaultBlockSchema,
  DefaultInlineContentSchema,
  DefaultStyleSchema
>;

/**
 * LumirEditor에서 사용하는 기본 블록 타입
 */
export type DefaultPartialBlock = PartialBlock<
  DefaultBlockSchema,
  DefaultInlineContentSchema,
  DefaultStyleSchema
>;

/**
 * LumirEditor 컴포넌트의 Props 인터페이스
 */
export interface LumirEditorProps {
  // Editor options
  initialContent?: DefaultPartialBlock[] | string; // JSON 객체 배열 또는 JSON 문자열
  initialEmptyBlocks?: number; // 초기 빈 블록 개수 (기본값: 3)
  placeholder?: string; // 첫 번째 블록의 placeholder 텍스트
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
      pasteBehavior?: "prefer-markdown" | "prefer-html";
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
  tabBehavior?: "prefer-navigate-ui" | "prefer-indent";
  trailingBlock?: boolean;
  resolveFileUrl?: (url: string) => Promise<string>;

  // View options
  editable?: boolean;
  theme?:
    | "light"
    | "dark"
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
