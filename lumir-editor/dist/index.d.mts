import * as react_jsx_runtime from 'react/jsx-runtime';
import { PartialBlock, DefaultBlockSchema, DefaultInlineContentSchema, DefaultStyleSchema, BlockNoteEditor } from '@blocknote/core';
export { BlockNoteEditor, DefaultBlockSchema, DefaultInlineContentSchema, DefaultStyleSchema, PartialBlock } from '@blocknote/core';

/**
 * LumirEditor에서 사용하는 BlockNote 에디터 타입
 */
type EditorType = BlockNoteEditor<DefaultBlockSchema, DefaultInlineContentSchema, DefaultStyleSchema>;
/**
 * LumirEditor에서 사용하는 기본 블록 타입
 */
type DefaultPartialBlock = PartialBlock<DefaultBlockSchema, DefaultInlineContentSchema, DefaultStyleSchema>;
/**
 * LumirEditor 컴포넌트의 Props 인터페이스
 */
interface LumirEditorProps {
    initialContent?: DefaultPartialBlock[] | string;
    initialEmptyBlocks?: number;
    placeholder?: string;
    uploadFile?: (file: File) => Promise<string>;
    storeImagesAsBase64?: boolean;
    allowVideoUpload?: boolean;
    allowAudioUpload?: boolean;
    allowFileUpload?: boolean;
    tables?: {
        splitCells?: boolean;
        cellBackgroundColor?: boolean;
        cellTextColor?: boolean;
        headers?: boolean;
    };
    heading?: {
        levels?: (1 | 2 | 3 | 4 | 5 | 6)[];
    };
    animations?: boolean;
    defaultStyles?: boolean;
    disableExtensions?: string[];
    tabBehavior?: 'prefer-navigate-ui' | 'prefer-indent';
    trailingBlock?: boolean;
    resolveFileUrl?: (url: string) => Promise<string>;
    editable?: boolean;
    theme?: 'light' | 'dark' | Partial<Record<string, unknown>> | {
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
    sideMenuAddButton?: boolean;
    onContentChange?: (content: DefaultPartialBlock[]) => void;
}

/**
 * 콘텐츠 관리 유틸리티
 * 기본 블록 생성 및 콘텐츠 검증 로직을 담당
 */
declare class ContentUtils {
    /**
     * JSON 문자열의 유효성을 검증합니다
     * @param jsonString 검증할 JSON 문자열
     * @returns 유효한 JSON 문자열인지 여부
     */
    static isValidJSONString(jsonString: string): boolean;
    /**
     * JSON 문자열을 DefaultPartialBlock 배열로 파싱합니다
     * @param jsonString JSON 문자열
     * @returns 파싱된 블록 배열 또는 null (파싱 실패 시)
     */
    static parseJSONContent(jsonString: string): DefaultPartialBlock[] | null;
    /**
     * 기본 paragraph 블록 생성
     * @returns 기본 설정이 적용된 DefaultPartialBlock
     */
    static createDefaultBlock(): DefaultPartialBlock;
    /**
     * 콘텐츠 유효성 검증 및 기본값 설정
     * @param content 사용자 제공 콘텐츠 (객체 배열 또는 JSON 문자열)
     * @param emptyBlockCount 빈 블록 개수 (기본값: 3)
     * @returns 검증된 콘텐츠 배열
     */
    static validateContent(content?: DefaultPartialBlock[] | string, emptyBlockCount?: number): DefaultPartialBlock[];
    /**
     * 빈 블록들을 생성합니다
     * @param emptyBlockCount 생성할 블록 개수
     * @returns 생성된 빈 블록 배열
     */
    private static createEmptyBlocks;
}
/**
 * 에디터 설정 관리 유틸리티
 * 각종 설정의 기본값과 검증 로직을 담당
 */
declare class EditorConfig {
    /**
     * 테이블 설정 기본값 적용
     * @param userTables 사용자 테이블 설정
     * @returns 기본값이 적용된 테이블 설정
     */
    static getDefaultTableConfig(userTables?: LumirEditorProps['tables']): {
        splitCells: boolean;
        cellBackgroundColor: boolean;
        cellTextColor: boolean;
        headers: boolean;
    };
    /**
     * 헤딩 설정 기본값 적용
     * @param userHeading 사용자 헤딩 설정
     * @returns 기본값이 적용된 헤딩 설정
     */
    static getDefaultHeadingConfig(userHeading?: LumirEditorProps['heading']): {
        levels?: (1 | 2 | 3 | 4 | 5 | 6)[];
    };
    /**
     * 비활성화할 확장 기능 목록 생성
     * @param userExtensions 사용자 정의 비활성 확장
     * @param allowVideo 비디오 업로드 허용 여부
     * @param allowAudio 오디오 업로드 허용 여부
     * @param allowFile 일반 파일 업로드 허용 여부
     * @returns 비활성화할 확장 기능 목록
     */
    static getDisabledExtensions(userExtensions?: string[], allowVideo?: boolean, allowAudio?: boolean, allowFile?: boolean): string[];
}
declare function LumirEditor({ initialContent, initialEmptyBlocks, uploadFile, tables, heading, animations, defaultStyles, disableExtensions, tabBehavior, trailingBlock, resolveFileUrl, storeImagesAsBase64, allowVideoUpload, allowAudioUpload, allowFileUpload, editable, theme, formattingToolbar, linkToolbar, sideMenu, slashMenu, emojiPicker, filePanel, tableHandles, onSelectionChange, className, sideMenuAddButton, onContentChange, }: LumirEditorProps): react_jsx_runtime.JSX.Element;

declare function cn(...inputs: (string | undefined | null | false)[]): string;

export { ContentUtils, type DefaultPartialBlock, EditorConfig, type EditorType, LumirEditor, type LumirEditorProps, cn };
