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
  // EditContext에서 전역 데이터 가져오기
  const {
    documents,
    folders,
    user: globalUser,
    loading: globalLoading,
    error: globalError,
    문서를_수정한다: updateDocuments,
    폴더들을_수정한다: updateFolders,
    문서를_추가한다: addDocument,
    폴더를_추가한다: addFolder,
    문서를_삭제한다: deleteDocument,
    폴더를_삭제한다: deleteFolder,
  } = useEdit();

  // 로컬 상태 (사이드바 특화 기능용)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // User 타입을 맞추기 위한 변환
  const user: User = {
    name: globalUser.name,
    email: globalUser.email,
    image: globalUser.image,
  };

  console.log('🔍 SidebarProvider 데이터 상태:', {
    documentsCount: documents?.length || 0,
    foldersCount: folders?.length || 0,
    globalLoading,
    globalError,
    userEmail: user.email,
    documentsData: documents,
    foldersData: folders,
  });

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
      console.log('📝 사이드바에서 새 문서 생성 성공:', {
        documentId: newDocument._id,
        title: newDocument.title,
      });

      // 전역 상태 업데이트 (새 문서 추가)
      addDocument(newDocument);

      // 새 문서 페이지로 자동 이동
      if (typeof window !== 'undefined') {
        window.location.href = `/edit/${newDocument._id}`;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Create document error:', err);
    } finally {
      setLoading(false);
    }
  }, [addDocument]);

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

      // 전역 상태 업데이트 (새 폴더 추가)
      addFolder(newFolder);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Create folder error:', err);
    } finally {
      setLoading(false);
    }
  }, [addFolder]);

  // 문서 삭제 함수 (독립 구현)
  const 문서를_삭제한다 = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);

      try {
        console.log('🗑️ 문서 삭제 시도:', { documentId: id });

        const response = await fetch(`/api/documents/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const errorData = await response.text();
          console.error('문서 삭제 실패:', response.status, errorData);
          throw new Error(
            `Failed to delete document: ${response.status} ${response.statusText}`,
          );
        }

        const result = await response.json();
        console.log('✅ 문서 삭제 성공:', result);

        // 전역 상태에서 문서 삭제
        deleteDocument(id);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        console.error('❌ 문서 삭제 오류:', err);
        alert(`문서 삭제 중 오류가 발생했습니다: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    },
    [deleteDocument],
  );

  // 폴더 삭제 함수 (독립 구현)
  const 폴더를_삭제한다 = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);

      try {
        console.log('🗑️ 폴더 삭제 시도:', { folderId: id });

        const response = await fetch(`/api/folders/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const errorData = await response.text();
          console.error('폴더 삭제 실패:', response.status, errorData);
          throw new Error(
            `Failed to delete folder: ${response.status} ${response.statusText}`,
          );
        }

        const result = await response.json();
        console.log('✅ 폴더 삭제 성공:', result);

        // 전역 상태에서 폴더 삭제
        deleteFolder(id);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        console.error('❌ 폴더 삭제 오류:', err);
        alert(`폴더 삭제 중 오류가 발생했습니다: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    },
    [deleteFolder],
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

        // 전역 상태 업데이트
        const updatedDocuments = documents.map((doc) =>
          doc._id === id ? updatedDocument : doc,
        );
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

        // 전역 상태 업데이트
        const updatedFolders = folders.map((folder) =>
          folder._id === id ? updatedFolder : folder,
        );
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
    user,
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
