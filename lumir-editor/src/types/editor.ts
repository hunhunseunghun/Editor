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
  // S3 업로드 설정
  s3Upload?: {
    apiEndpoint: string;
    env: "development" | "production";
    author: "admin" | "user";
    userId: string;
    path: string;
  };
  // 미디어 업로드 허용 범위(기본 비활성)
  allowVideoUpload?: boolean;
  allowAudioUpload?: boolean;
  // 일반 파일 업로드 허용 (기본 비활성)
  allowFileUpload?: boolean;
  tables?: {
    splitCells?: boolean;
    cellBackgroundColor?: boolean;
    cellTextColor?: boolean;
    headers?: boolean;
  };
  heading?: { levels?: (1 | 2 | 3 | 4 | 5 | 6)[] };
  defaultStyles?: boolean;
  disableExtensions?: string[];
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
  onSelectionChange?: () => void;
  className?: string;
  // Add block(플러스) 버튼 토글: true = 표시, false(기본) = 숨김(드래그 핸들은 유지)
  sideMenuAddButton?: boolean;

  // Callbacks / refs
  onContentChange?: (content: DefaultPartialBlock[]) => void;
}
