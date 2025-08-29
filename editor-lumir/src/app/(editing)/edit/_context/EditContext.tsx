'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { useSession } from 'next-auth/react';
import { Document, Folder } from '@/types/entities';

interface UserInfo {
  name: string;
  email: string;
  image?: string | null;
}

interface EditContextType {
  // 전역  데이터 (유저,폴더,문서 데이터)
  documents: Document[];
  folders: Folder[];
  user: UserInfo;
  currentDocument: Document | null;
  previousDocument: Document | null;

  // 전역 상태 관리
  loading: boolean;
  error: string | null;
  refetch: () => void;

  fetchData: () => Promise<void>;

  // 전역 데이터 업데이트 함수들
  문서를_추가한다: (document: Document) => void;
  문서를_삭제한다: (documentId: string) => void;
  문서를_수정한다: (newDocuments: Document[]) => void;
  현재_문서를_수정한다: (document: Document | null) => void;

  폴더를_추가한다: (folder: Folder) => void;
  폴더를_삭제한다: (folderId: string) => void;
  폴더들을_수정한다: (folders: Folder[]) => void;
}

const EditContext = createContext<EditContextType | undefined>(undefined);

export function EditProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();

  // 전역 공유 데이터 상태
  const [documents, setDocuments] = useState<Document[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [user, setUser] = useState<UserInfo>({ name: '', email: '' });
  const [currentDocument, setCurrentDocument] = useState<Document | null>(null);
  const [previousDocument, setPreviousDocument] = useState<Document | null>(
    null,
  );

  // 전역 상태 관리
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 전역 데이터 업데이트 함수들
  const 현재_문서를_수정한다 = useCallback((document: Document | null) => {
    setCurrentDocument(document);
  }, []);

  const 문서를_수정한다 = useCallback((newDocuments: Document[]) => {
    setDocuments(newDocuments);
  }, []);

  const 폴더들을_수정한다 = useCallback((newFolders: Folder[]) => {
    setFolders(newFolders);
  }, []);

  const 문서를_추가한다 = useCallback((document: Document) => {
    setDocuments((prev) => [document, ...prev]);
  }, []);

  const 문서를_삭제한다 = useCallback(
    (documentId: string) => {
      setDocuments((prev) => prev.filter((doc) => doc._id !== documentId));
      // 현재 문서가 삭제된 문서라면 이전 문서로 변경
      setCurrentDocument((prev) => {
        if (prev?._id === documentId) {
          return previousDocument;
        }
        return prev;
      });
    },
    [previousDocument],
  );

  const 폴더를_추가한다 = useCallback((folder: Folder) => {
    setFolders((prev) => [folder, ...prev]);
  }, []);

  const 폴더를_삭제한다 = useCallback((folderId: string) => {
    setFolders((prev) => prev.filter((folder) => folder._id !== folderId));
    // 해당 폴더의 문서들을 루트로 이동
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.folderId === folderId ? { ...doc, folderId: null } : doc,
      ),
    );
  }, []);

  // 전역 데이터 로딩 함수
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/edit/mount');

      if (response.status === 401) {
        throw new Error('인증에 실패했습니다.');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to mount edit page');
      }

      const data = await response.json();
      console.log('Edit page mounted successfully:', data);

      if (data.sidebar) {
        setDocuments(data.sidebar.documents || []);
        setFolders(data.sidebar.folders || []);
        setUser(data.sidebar.user || { name: '', email: '' });
      }
      if (data.documentHeader) {
        setCurrentDocument(data.documentHeader.currentDocument);
        setPreviousDocument(data.documentHeader.previousDocument);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Edit page mount error:', err);
    } finally {
      setLoading(false);
    }
  }, [session, status]);

  // 데이터 재로딩 함수
  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/edit/mount');

      if (response.status === 401) {
        throw new Error('인증에 실패했습니다.');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to refresh data');
      }

      const data = await response.json();
      console.log('Data refreshed successfully:', data);

      // 전역 데이터 설정
      if (data.sidebar) {
        setDocuments(data.sidebar.documents || []);
        setFolders(data.sidebar.folders || []);
        setUser(data.sidebar.user || { name: '', email: '' });
      }
      if (data.documentHeader) {
        setCurrentDocument(data.documentHeader.currentDocument);
        setPreviousDocument(data.documentHeader.previousDocument);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Data refresh error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const contextValue = {
    documents,
    folders,
    user,
    currentDocument,
    previousDocument,
    loading,
    error,
    refetch,
    fetchData,
    현재_문서를_수정한다,
    문서를_수정한다,
    폴더들을_수정한다,
    문서를_추가한다,
    문서를_삭제한다,
    폴더를_추가한다,
    폴더를_삭제한다,
  };

  return (
    <EditContext.Provider value={contextValue}>{children}</EditContext.Provider>
  );
}

export function useEdit() {
  const context = useContext(EditContext);
  if (!context) {
    throw new Error('useEdit must be used within EditProvider');
  }
  return context;
}
