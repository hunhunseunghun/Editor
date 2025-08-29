import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Document, Folder } from '@/types/common';
import {
  optimisticUpdater,
  OptimisticState,
  DnDMoveInfo,
} from '@/lib/optimistic-updater';
import { useLayoutStore } from '@/store/use-layout-store';

// 🔥 Optimistic Sync 훅 반환 타입
export interface UseOptimisticSyncReturn {
  // 상태
  isOnline: boolean;
  pendingOperations: number;
  lastError: string | null;
  isProcessing: boolean;

  // 문서 작업
  createDocument: (document: Partial<Document>) => Promise<string>;
  updateDocument: (
    documentId: string,
    updates: Partial<Document>,
  ) => Promise<void>;
  deleteDocument: (documentId: string) => Promise<void>;

  // 폴더 작업
  createFolder: (folder: Partial<Folder>) => Promise<string>;
  updateFolder: (folderId: string, updates: Partial<Folder>) => Promise<void>;
  deleteFolder: (folderId: string) => Promise<void>;
  updateFolderExpansion: (
    folderId: string,
    isExpanded: boolean,
  ) => Promise<void>;

  // DnD 전용
  moveDocumentOptimistic: (moveInfo: DnDMoveInfo) => Promise<void>;
  moveFolderOptimistic: (moveInfo: DnDMoveInfo) => Promise<void>;
  performDnDBatch: (
    moveOperations: DnDMoveInfo[],
    batchId?: string,
  ) => Promise<string>;
  rollbackDnDOperation: (batchId: string) => Promise<void>;

  // 유틸리티
  forceSync: () => Promise<void>;
  clearQueue: () => void;
}

// 🔥 Optimistic Sync 훅
export const useOptimisticSync = (): UseOptimisticSyncReturn => {
  const { data: session } = useSession();
  const [state, setState] = useState<OptimisticState>(
    optimisticUpdater.getState(),
  );

  // Store 액션들
  const {
    setSidebarDocuments,
    setSidebarFolders,
    addSidebarDocument,
    removeSidebarDocument,
    updateSidebarDocument,
    addSidebarFolder,
    removeSidebarFolder,
    updateSidebarFolder,
  } = useLayoutStore();

  // 이벤트 리스너 ref
  const eventListenersRef = useRef<{
    optimisticChange: (event: CustomEvent) => void;
  } | null>(null);

  // 🔥 문서 변경 처리
  const handleDocumentChange = useCallback(
    (action: string, data: any) => {
      switch (action) {
        case 'create':
          addSidebarDocument(data);
          break;
        case 'update':
          // DND 시 folderId, order 등 모든 속성 업데이트
          updateSidebarDocument(data._id, data);
          break;
        case 'delete':
          removeSidebarDocument(data._id);
          break;
        case 'replace':
          setSidebarDocuments((prev) => {
            // 매칭되는 문서 찾기
            const matchingDocIndex = prev.findIndex(
              (doc) => doc._id === data.optimisticId,
            );

            if (matchingDocIndex === -1) {
              return prev; // 매칭되는 문서가 없으면 원본 반환
            }

            const newDocs = prev.map((doc, index) => {
              if (index === matchingDocIndex) {
                return data.realDocument;
              }
              return doc;
            });

            return newDocs;
          });

          break;
        case 'rollback':
          // 롤백 시 원래 상태로 복원
          setSidebarDocuments((prev) =>
            prev.map((doc) => (doc._id === data._id ? data : doc)),
          );
          break;
        default:
        // 알 수 없는 문서 액션
      }
    },
    [
      addSidebarDocument,
      updateSidebarDocument,
      removeSidebarDocument,
      setSidebarDocuments,
    ],
  );

  // 🔥 폴더 변경 처리
  const handleFolderChange = useCallback(
    (action: string, data: any) => {
      switch (action) {
        case 'create':
          addSidebarFolder(data);
          break;
        case 'update':
          updateSidebarFolder(data._id, data);
          break;
        case 'delete':
          removeSidebarFolder(data._id);
          break;
        case 'replace':
          // 임시 ID를 실제 ID로 교체
          setSidebarFolders((prev) =>
            prev.map((folder) =>
              folder._id === data.optimisticId ? data.realFolder : folder,
            ),
          );
          break;
        case 'rollback':
          // 롤백 시 원래 상태로 복원
          setSidebarFolders((prev) =>
            prev.map((folder) => (folder._id === data._id ? data : folder)),
          );
          break;
        default:
        // 알 수 없는 폴더 액션
      }
    },
    [
      addSidebarFolder,
      updateSidebarFolder,
      removeSidebarFolder,
      setSidebarFolders,
    ],
  );

  // 🔥 Optimistic 변경 이벤트 처리
  const handleOptimisticChange = useCallback(
    (event: CustomEvent) => {
      const { entity, action, data } = event.detail;

      switch (entity) {
        case 'document':
          handleDocumentChange(action, data);
          break;
        case 'folder':
          handleFolderChange(action, data);
          break;
        default:
        // 알 수 없는 엔티티
      }
    },
    [handleDocumentChange, handleFolderChange],
  );

  // 🔥 문서 생성 (Optimistic)
  const createDocument = useCallback(
    async (document: Partial<Document>): Promise<string> => {
      if (!session?.user?.email) {
        throw new Error('사용자 인증이 필요합니다.');
      }

      const optimisticId = await optimisticUpdater.createDocument({
        ...document,
        author: session.user.email,
      });

      return optimisticId;
    },
    [session?.user?.email],
  );

  // 🔥 문서 업데이트 (Optimistic)
  const updateDocument = useCallback(
    async (documentId: string, updates: Partial<Document>): Promise<void> => {
      await optimisticUpdater.updateDocument(documentId, updates);
    },
    [],
  );

  // 🔥 문서 삭제 (Optimistic)
  const deleteDocument = useCallback(
    async (documentId: string): Promise<void> => {
      await optimisticUpdater.deleteDocument(documentId);
    },
    [],
  );

  // 🔥 폴더 생성 (Optimistic)
  const createFolder = useCallback(
    async (folder: Partial<Folder>): Promise<string> => {
      if (!session?.user?.email) {
        throw new Error('사용자 인증이 필요합니다.');
      }

      const optimisticId = await optimisticUpdater.createFolder({
        ...folder,
        user: session.user.email,
      });

      return optimisticId;
    },
    [session?.user?.email],
  );

  // 🔥 폴더 업데이트 (Optimistic)
  const updateFolder = useCallback(
    async (folderId: string, updates: Partial<Folder>): Promise<void> => {
      await optimisticUpdater.updateFolder(folderId, updates);
    },
    [],
  );

  // 🔥 폴더 삭제 (Optimistic)
  const deleteFolder = useCallback(async (folderId: string): Promise<void> => {
    await optimisticUpdater.deleteFolder(folderId);
  }, []);

  // 🔥 폴더 확장 상태 업데이트 (Optimistic)
  const updateFolderExpansion = useCallback(
    async (folderId: string, isExpanded: boolean): Promise<void> => {
      await optimisticUpdater.updateFolderExpansion(folderId, isExpanded);
    },
    [],
  );

  // 🔥 강제 동기화
  const forceSync = useCallback(async (): Promise<void> => {
    await optimisticUpdater.forceSync();
  }, []);

  // 🔥 큐 비우기
  const clearQueue = useCallback((): void => {
    optimisticUpdater.clearQueue();
  }, []);

  // ========================================
  // 🔥 DnD 전용 메서드들
  // ========================================

  // 🔥 문서 이동 (DnD 전용)
  const moveDocumentOptimistic = useCallback(
    async (moveInfo: DnDMoveInfo): Promise<void> => {
      await optimisticUpdater.moveDocumentOptimistic(moveInfo);
    },
    [],
  );

  // 🔥 폴더 이동 (DnD 전용)
  const moveFolderOptimistic = useCallback(
    async (moveInfo: DnDMoveInfo): Promise<void> => {
      await optimisticUpdater.moveFolderOptimistic(moveInfo);
    },
    [],
  );

  // 🔥 DnD 배치 작업
  const performDnDBatch = useCallback(
    async (
      moveOperations: DnDMoveInfo[],
      batchId?: string,
    ): Promise<string> => {
      return await optimisticUpdater.performDnDBatch(moveOperations, batchId);
    },
    [],
  );

  // 🔥 DnD 롤백
  const rollbackDnDOperation = useCallback(
    async (batchId: string): Promise<void> => {
      await optimisticUpdater.rollbackDnDOperation(batchId);
    },
    [],
  );

  // 🔥 이벤트 리스너 설정
  useEffect(() => {
    // SSR 환경에서는 이벤트 리스너 등록하지 않음
    if (typeof window === 'undefined') {
      return;
    }

    // 이벤트 리스너 생성
    eventListenersRef.current = {
      optimisticChange: handleOptimisticChange,
    };

    // 이벤트 리스너 등록
    window.addEventListener(
      'optimistic-change',
      eventListenersRef.current.optimisticChange,
    );

    // Optimistic Updater 상태 리스너 등록
    const handleStateChange = (newState: OptimisticState) => {
      setState(newState);
    };

    optimisticUpdater.addListener(handleStateChange);

    // 클린업
    return () => {
      if (typeof window !== 'undefined' && eventListenersRef.current) {
        window.removeEventListener(
          'optimistic-change',
          eventListenersRef.current.optimisticChange,
        );
      }

      optimisticUpdater.removeListener(handleStateChange);
    };
  }, [handleOptimisticChange]);

  // 🔥 세션 변경 시 동기화 시작
  useEffect(() => {
    if (session?.user?.email) {
      // 세션이 있으면 동기화 시작
      optimisticUpdater.forceSync();
    }
  }, [session?.user?.email]);

  return {
    // 상태
    isOnline: state.isOnline,
    pendingOperations: state.pendingOperations,
    lastError: state.lastError,
    isProcessing: state.isProcessing,

    // 문서 작업
    createDocument,
    updateDocument,
    deleteDocument,

    // 폴더 작업
    createFolder,
    updateFolder,
    deleteFolder,
    updateFolderExpansion,

    // DnD 전용
    moveDocumentOptimistic,
    moveFolderOptimistic,
    performDnDBatch,
    rollbackDnDOperation,

    // 유틸리티
    forceSync,
    clearQueue,
  };
};

// 🔥 간단한 상태만 필요한 경우 사용하는 훅
export const useOptimisticState = (): OptimisticState => {
  const [state, setState] = useState<OptimisticState>(
    optimisticUpdater.getState(),
  );

  useEffect(() => {
    const handleStateChange = (newState: OptimisticState) => {
      setState(newState);
    };

    optimisticUpdater.addListener(handleStateChange);

    return () => {
      optimisticUpdater.removeListener(handleStateChange);
    };
  }, []);

  return state;
};
