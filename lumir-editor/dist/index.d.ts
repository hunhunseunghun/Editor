import * as react_jsx_runtime from 'react/jsx-runtime';
import React from 'react';
import { PartialBlock, DefaultBlockSchema, DefaultInlineContentSchema, DefaultStyleSchema, BlockNoteEditor } from '@blocknote/core';
export { BlockNoteEditor, DefaultBlockSchema, DefaultInlineContentSchema, DefaultStyleSchema, PartialBlock } from '@blocknote/core';

type EditorType = BlockNoteEditor<DefaultBlockSchema, DefaultInlineContentSchema, DefaultStyleSchema>;
type DefaultPartialBlock = PartialBlock<DefaultBlockSchema, DefaultInlineContentSchema, DefaultStyleSchema>;
interface LumirEditorProps {
    initialContent?: DefaultPartialBlock[];
    uploadFile?: (file: File) => Promise<string>;
    storeImagesAsBase64?: boolean;
    allowVideoUpload?: boolean;
    allowAudioUpload?: boolean;
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
    heading?: {
        levels?: (1 | 2 | 3 | 4 | 5 | 6)[];
    };
    animations?: boolean;
    defaultStyles?: boolean;
    disableExtensions?: string[];
    domAttributes?: Record<string, string>;
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
    comments?: boolean;
    onSelectionChange?: () => void;
    className?: string;
    includeDefaultStyles?: boolean;
    sideMenuAddButton?: boolean;
    onContentChange?: (content: DefaultPartialBlock[]) => void;
    editorRef?: React.MutableRefObject<EditorType | null>;
}
declare function LumirEditor({ initialContent, uploadFile, pasteHandler, tables, heading, animations, defaultStyles, disableExtensions, domAttributes, tabBehavior, trailingBlock, resolveFileUrl, storeImagesAsBase64, allowVideoUpload, allowAudioUpload, allowFileUpload, editable, theme, formattingToolbar, linkToolbar, sideMenu, slashMenu, emojiPicker, filePanel, tableHandles, comments, onSelectionChange, className, includeDefaultStyles, sideMenuAddButton, onContentChange, editorRef, }: LumirEditorProps): react_jsx_runtime.JSX.Element;

declare function cn(...inputs: (string | undefined | null | false)[]): string;

export { type DefaultPartialBlock, type EditorType, LumirEditor, type LumirEditorProps, cn };
