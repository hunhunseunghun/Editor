import { Document, Folder } from '@/types/common';

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

export interface CacheManager {
  get<T>(key: string): T | null;
  set<T>(key: string, data: T, ttl?: number): void;
  delete(key: string): void;
  clear(): void;
  has(key: string): boolean;
  isExpired(key: string): boolean;
}

class CacheManagerImpl implements CacheManager {
  private cache = new Map<string, CacheEntry<any>>();
  private defaultTTL = 5 * 60 * 1000; // 5분

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    if (this.isExpired(key)) {
      this.delete(key);
      return null;
    }

    return entry.data as T;
  }

  set<T>(key: string, data: T, ttl: number = this.defaultTTL): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
    };

    this.cache.set(key, entry);
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  has(key: string): boolean {
    return this.cache.has(key) && !this.isExpired(key);
  }

  isExpired(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) {
      return true;
    }

    return Date.now() - entry.timestamp > entry.ttl;
  }

  // 특정 패턴의 키들을 삭제
  deletePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.delete(key);
      }
    }
  }

  // 만료된 모든 항목 정리
  cleanup(): void {
    for (const key of this.cache.keys()) {
      if (this.isExpired(key)) {
        this.delete(key);
      }
    }
  }

  // 캐시 통계
  getStats() {
    const total = this.cache.size;
    let expired = 0;

    for (const key of this.cache.keys()) {
      if (this.isExpired(key)) {
        expired++;
      }
    }

    return {
      total,
      expired,
      valid: total - expired,
    };
  }
}

// 전역 캐시 매니저 인스턴스
export const cacheManager = new CacheManagerImpl();

// 캐시 키 생성 유틸리티
export const createCacheKey = (
  prefix: string,
  params: Record<string, any>,
): string => {
  const sortedParams = Object.keys(params)
    .sort()
    .map((key) => `${key}:${params[key]}`)
    .join('|');

  return `${prefix}:${sortedParams}`;
};

// 문서 관련 캐시 키
export const DOCUMENT_CACHE_KEYS = {
  ALL: (userId: string) => `documents:all:${userId}`,
  BY_ID: (id: string) => `documents:id:${id}`,
  BY_FOLDER: (folderId: string, userId: string) =>
    `documents:folder:${folderId}:${userId}`,
  DELETED: (userId: string) => `documents:deleted:${userId}`,
};

// 폴더 관련 캐시 키
export const FOLDER_CACHE_KEYS = {
  ALL: (userId: string) => `folders:all:${userId}`,
  BY_ID: (id: string) => `folders:id:${id}`,
  BY_PARENT: (parentId: string | null, userId: string) =>
    `folders:parent:${parentId || 'root'}:${userId}`,
};

// 캐시 무효화 유틸리티
export const invalidateDocumentCache = (
  userId: string,
  documentId?: string,
) => {
  if (documentId) {
    cacheManager.delete(DOCUMENT_CACHE_KEYS.BY_ID(documentId));
  }
  cacheManager.delete(DOCUMENT_CACHE_KEYS.ALL(userId));
  cacheManager.delete(DOCUMENT_CACHE_KEYS.DELETED(userId));
};

export const invalidateFolderCache = (userId: string, folderId?: string) => {
  if (folderId) {
    cacheManager.delete(FOLDER_CACHE_KEYS.BY_ID(folderId));
  }
  cacheManager.delete(FOLDER_CACHE_KEYS.ALL(userId));
};

// 메모이제이션 유틸리티
export const memoize = <T extends (...args: any[]) => any>(
  fn: T,
  keyGenerator?: (...args: Parameters<T>) => string,
): T => {
  const cache = new Map<string, ReturnType<T>>();

  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key)!;
    }

    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
};

// 트리 데이터 메모이제이션
export const memoizedConvertToArboristTreeData = memoize(
  (folders: Folder[], documents: Document[]) => {
    // 트리 변환 로직은 tree-utils.ts에서 가져옴
    // 여기서는 간단한 예시
    return folders.map((folder) => ({
      id: folder._id,
      name: folder.name,
      children: documents
        .filter((doc) => doc.folderId === folder._id)
        .map((doc) => ({
          id: doc._id,
          name: doc.title,
          type: 'document',
        })),
    }));
  },
  (folders, documents) => {
    const folderIds = folders
      .map((f) => f._id)
      .sort()
      .join(',');
    const documentIds = documents
      .map((d) => d._id)
      .sort()
      .join(',');
    return `tree:${folderIds}:${documentIds}`;
  },
);
