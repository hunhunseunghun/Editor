'use client';

import {
  createContext,
  useContext,
  ReactNode,
  useCallback,
  useState,
} from 'react';
import { useEdit } from './EditContext';
import { Document, Folder } from '@/types/entities';

interface User {
  name: string;
  email: string;
  image?: string | null;
}

interface SidebarContextType {
  // 로컬 상태 (독립 관리)

  documents: Document[];
  folders: Folder[];
  user: User;
  loading: boolean;
  error: string | null;

  // 사이드바 관련 함수들 (독립 구현)
  문서를_만든다: () => Promise<void>;
  폴더를_만든다: () => Promise<void>;
  문서를_삭제한다: (id: string) => Promise<void>;
  폴더를_삭제한다: (id: string) => Promise<void>;
  문서를_수정한다: (id: string, data: Partial<Document>) => Promise<void>;
  폴더를_수정한다: (id: string, data: Partial<Folder>) => Promise<void>;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  // 로컬 상태 관리 (독립적)
  const [documents, setDocuments] = useState<Document[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { 문서를_수정한다: updateDocuments, 폴더들을_수정한다: updateFolders } =
    useEdit();

  // 문서 생성 함수 (독립 구현)
  const 문서를_만든다 = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/edit/sidebar/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: '새 문서',
          content: [],
          folderId: null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create document');
      }

      const newDocument = await response.json();

      // 로컬 상태 업데이트
      setDocuments((prev) => [newDocument, ...prev]);

      // 전역 상태 업데이트 (콜백)
      updateDocuments([newDocument, ...documents]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Create document error:', err);
    } finally {
      setLoading(false);
    }
  }, [documents, updateDocuments]);

  // 폴더 생성 함수 (독립 구현)
  const 폴더를_만든다 = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/edit/sidebar/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: '새 폴더',
          parentId: null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create folder');
      }

      const newFolder = await response.json();

      // 로컬 상태 업데이트
      setFolders((prev) => [newFolder, ...prev]);

      // 전역 상태 업데이트 (콜백)
      updateFolders([newFolder, ...folders]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Create folder error:', err);
    } finally {
      setLoading(false);
    }
  }, [folders, updateFolders]);

  // 문서 삭제 함수 (독립 구현)
  const 문서를_삭제한다 = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/documents/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete document');
        }

        // 로컬 상태 업데이트
        const updatedDocuments = documents.filter((doc) => doc._id !== id);
        setDocuments(updatedDocuments);

        // 전역 상태 업데이트 (콜백)
        updateDocuments(updatedDocuments);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        console.error('Delete document error:', err);
      } finally {
        setLoading(false);
      }
    },
    [documents, updateDocuments],
  );

  // 폴더 삭제 함수 (독립 구현)
  const 폴더를_삭제한다 = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/folders/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete folder');
        }

        // 로컬 상태 업데이트
        const updatedFolders = folders.filter((folder) => folder._id !== id);
        setFolders(updatedFolders);

        // 전역 상태 업데이트 (콜백)
        updateFolders(updatedFolders);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        console.error('Delete folder error:', err);
      } finally {
        setLoading(false);
      }
    },
    [folders, updateFolders],
  );

  // 문서 수정 함수 (독립 구현)
  const 문서를_수정한다 = useCallback(
    async (id: string, data: Partial<Document>) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/documents/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error('Failed to update document');
        }

        const updatedDocument = await response.json();

        // 로컬 상태 업데이트
        const updatedDocuments = documents.map((doc) =>
          doc._id === id ? updatedDocument : doc,
        );
        setDocuments(updatedDocuments);

        // 전역 상태 업데이트 (콜백)
        updateDocuments(updatedDocuments);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        console.error('Update document error:', err);
      } finally {
        setLoading(false);
      }
    },
    [documents, updateDocuments],
  );

  // 폴더 수정 함수 (독립 구현)
  const 폴더를_수정한다 = useCallback(
    async (id: string, data: Partial<Folder>) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/folders/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error('Failed to update folder');
        }

        const updatedFolder = await response.json();

        // 로컬 상태 업데이트
        const updatedFolders = folders.map((folder) =>
          folder._id === id ? updatedFolder : folder,
        );
        setFolders(updatedFolders);

        // 전역 상태 업데이트 (콜백)
        updateFolders(updatedFolders);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        console.error('Update folder error:', err);
      } finally {
        setLoading(false);
      }
    },
    [folders, updateFolders],
  );

  const contextValue = {
    documents,
    folders,
    loading,
    error,
    문서를_만든다,
    폴더를_만든다,
    문서를_삭제한다,
    폴더를_삭제한다,
    문서를_수정한다,
    폴더를_수정한다,
  };

  return (
    <SidebarContext.Provider value={contextValue}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within SidebarProvider');
  }
  return context;
}
