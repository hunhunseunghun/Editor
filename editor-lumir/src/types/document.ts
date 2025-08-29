import { BlockNoteEditor, Block } from '@blocknote/core';
import { Document } from './entities';

// 문서 생성 요청 타입
export interface CreateDocumentRequest {
  title: string;
  content?: Block[]; // BlockNote 타입으로 명시
  folderId?: string | null;
}

// 문서 업데이트 요청 타입
export interface UpdateDocumentRequest {
  title?: string;
  content?: Block[]; // BlockNote 타입으로 명시
  folderId?: string | null;
  isLocked?: boolean;
}

// 문서 목록 조회 응답 타입
export interface DocumentsResponse {
  success: boolean;
  data: Document[];
  message?: string;
}

// 단일 문서 조회 응답 타입
export interface DocumentResponse {
  success: boolean;
  data: Document;
  message?: string;
}

// 문서 생성 응답 타입
export interface CreateDocumentResponse {
  success: boolean;
  message: string;
  data: Document;
}

// 문서 삭제 응답 타입
export interface DeleteDocumentResponse {
  success: boolean;
  message: string;
}

// BlockNote 에디터 타입
export type BlockNoteEditorType = BlockNoteEditor;

// 문서 정렬 타입
export type DocumentSortType = 'title' | 'createdAt' | 'updatedAt';

// 문서 정렬 방향 타입
export type DocumentSortDirection = 'asc' | 'desc';

// 문서 필터 타입
export interface DocumentFilter {
  folderId?: string | null;
  isDeleted?: boolean;
  isLocked?: boolean;
  search?: string;
}

// 문서 정렬 옵션 타입
export interface DocumentSortOptions {
  field: DocumentSortType;
  direction: DocumentSortDirection;
}

// 문서 목록 조회 파라미터 타입
export interface GetDocumentsParams {
  filter?: DocumentFilter;
  sort?: DocumentSortOptions;
  limit?: number;
  offset?: number;
}
