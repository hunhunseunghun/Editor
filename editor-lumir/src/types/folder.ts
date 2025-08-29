import { Folder } from './entities';

// 폴더 생성 요청 타입
export interface CreateFolderRequest {
  name: string;
  parentId?: string | null;
}

// 폴더 업데이트 요청 타입
export interface UpdateFolderRequest {
  name?: string;
  parentId?: string | null;
}

// 폴더 목록 조회 응답 타입
export interface FoldersResponse {
  success: boolean;
  data: Folder[];
  message?: string;
}

// 단일 폴더 조회 응답 타입
export interface FolderResponse {
  success: boolean;
  data: Folder;
  message?: string;
}

// 폴더 생성 응답 타입
export interface CreateFolderResponse {
  success: boolean;
  message: string;
  data: Folder;
}

// 폴더 삭제 응답 타입
export interface DeleteFolderResponse {
  success: boolean;
  message: string;
}

// 트리 구조 아이템 타입은 tree.ts에서 import
export type { TreeItem, FlattenedItem } from './tree';

// 폴더 정렬 타입
export type FolderSortType = 'name' | 'createdAt' | 'updatedAt';

// 폴더 정렬 방향 타입
export type FolderSortDirection = 'asc' | 'desc';

// 폴더 필터 타입
export interface FolderFilter {
  isDeleted?: boolean;
  search?: string;
}

// 폴더 정렬 옵션 타입
export interface FolderSortOptions {
  field: FolderSortType;
  direction: FolderSortDirection;
}

// 폴더 목록 조회 파라미터 타입
export interface GetFoldersParams {
  filter?: FolderFilter;
  sort?: FolderSortOptions;
  limit?: number;
  offset?: number;
}
