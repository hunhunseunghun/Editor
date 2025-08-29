'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { TreeNode } from '@/types/tree';
import { useLayoutStore } from '@/store/use-layout-store';
import { transformToTreeData } from '@/components/tree/utils/treeTransformers';
import { optimisticUpdater } from '@/lib/optimistic-updater';

// 🔥 React Arborist 상태 관리 타입 정의
export interface TreeStateNodes {
  value: TreeNode[];
  onChange: (nodes: TreeNode[]) => void;
}

export interface TreeStateOpens {
  value: Record<string, boolean>;
  onChange: (opens: Record<string, boolean>) => void;
}

export interface UseTreeStateReturn {
  nodes: TreeStateNodes;
  opens: TreeStateOpens;
  loading: boolean;
  error: string | null;
  updateFolderExpansion: (
    folderId: string,
    isExpanded: boolean,
  ) => Promise<void>;
}

/**
 * React Arborist의 nodes와 opens 상태를 통합 관리하는 커스텀 훅
 * - 트리 데이터와 폴더 확장 상태를 동시에 관리
 * - DB와의 동기화 담당
 * - Optimistic Update 지원
 */
export const useTreeState = (): UseTreeStateReturn => {
  // 🔥 기존 Zustand store에서 데이터 가져오기
  const { sidebarDocuments, sidebarFolders } = useLayoutStore();

  // 🔥 내부 상태 관리
  const [opens, setOpens] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🔥 트리 데이터 메모이제이션 - 직접 Zustand store 구독
  const treeData = useMemo(() => {
    // 배열이 아닌 경우 빈 배열로 처리
    const safeDocuments = Array.isArray(sidebarDocuments)
      ? sidebarDocuments
      : [];
    const safeFolders = Array.isArray(sidebarFolders) ? sidebarFolders : [];

    const transformed = transformToTreeData(
      safeFolders as any,
      safeDocuments as any,
    );

    return transformed;
  }, [sidebarDocuments, sidebarFolders]); // 직접 store 상태 의존성

  // 🔥 초기 로드시 DB에서 확장 상태 복원
  useEffect(() => {
    const initializeOpensFromDB = () => {
      const initialOpens: Record<string, boolean> = {};

      // 폴더 데이터에서 isExpanded 상태 추출
      sidebarFolders.forEach((folder) => {
        if (folder.isExpanded !== undefined) {
          initialOpens[folder._id] = folder.isExpanded;
        }
      });

      // 현재 opens 상태가 비어있을 때만 초기화
      setOpens((currentOpens) => {
        const hasExistingState = Object.keys(currentOpens).length > 0;
        if (hasExistingState) {
          // 새로운 폴더가 추가된 경우에만 병합
          const newFolders = Object.keys(initialOpens).filter(
            (id) => !(id in currentOpens),
          );
          if (newFolders.length > 0) {
            return {
              ...currentOpens,
              ...Object.fromEntries(
                newFolders.map((id) => [id, initialOpens[id]]),
              ),
            };
          }
          return currentOpens;
        } else {
          return initialOpens;
        }
      });
    };

    // 폴더가 있을 때만 초기화
    if (Array.isArray(sidebarFolders) && sidebarFolders.length > 0) {
      initializeOpensFromDB();
    }
  }, [sidebarFolders]);

  // 🔥 노드 변경 핸들러 (React Arborist에서 호출)
  const handleNodesChange = useCallback(() => {
    // 이 훅에서는 트리 데이터를 직접 변경하지 않고
    // Zustand store의 변경을 통해 반영되도록 함
    // (Optimistic Update 시스템과의 일관성 유지)
  }, []);

  // 🔥 폴더 확장 상태 업데이트 (Optimistic)
  const updateFolderExpansion = useCallback(
    async (folderId: string, isExpanded: boolean): Promise<void> => {
      try {
        setLoading(true);
        setError(null);

        // Optimistic Update 시스템을 통해 처리
        await optimisticUpdater.updateFolderExpansion(folderId, isExpanded);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : '폴더 확장 상태 업데이트에 실패했습니다.',
        );

        // 실패시 이전 상태로 롤백
        setOpens((prev) => ({
          ...prev,
          [folderId]: !isExpanded,
        }));
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // 🔥 확장 상태 변경 핸들러
  const handleOpensChange = useCallback(
    (newOpens: Record<string, boolean>) => {
      setOpens(newOpens);

      // 변경된 폴더들의 확장 상태를 DB에 동기화
      Object.entries(newOpens).forEach(([folderId, isExpanded]) => {
        if (opens[folderId] !== isExpanded) {
          // 백그라운드에서 DB 동기화 (비동기, 에러 무시)
          updateFolderExpansion(folderId, isExpanded).catch(() => {
            // 폴더 확장 동기화 실패
          });
        }
      });
    },
    [opens, updateFolderExpansion],
  );

  // 🔥 nodes와 opens 객체 생성 (React Arborist 규격)
  const nodes: TreeStateNodes = useMemo(
    () => ({
      value: treeData,
      onChange: handleNodesChange,
    }),
    [treeData, handleNodesChange],
  );

  const opensState: TreeStateOpens = useMemo(
    () => ({
      value: opens,
      onChange: handleOpensChange,
    }),
    [opens, handleOpensChange],
  );

  return {
    nodes,
    opens: opensState,
    loading,
    error,
    updateFolderExpansion,
  };
};

export default useTreeState;
