'use client';

import {
  createContext,
  useContext,
  ReactNode,
  useCallback,
  useState,
  useMemo,
} from 'react';
import { useEdit } from './EditContext';
import { Document } from '@/types/entities';

interface DocumentContentContextType {
  // 로컬 상태 (독립 관리)
  currentDocument: Document | null;
  previousDocument: Document | null;
  loading: boolean;
  error: string | null;

  // 문서 내용 관련 함수들
  문서를_조회_한다: (id: string) => Promise<void>;
  문서를_저장_한다: (id: string, content: any) => Promise<void>;
  문서의_정보를_수정_한다: (id: string, data: any) => Promise<void>;
  새로운_문서를_만든다: () => Promise<void>;
}

const DocumentContentContext = createContext<
  DocumentContentContextType | undefined
>(undefined);

export function DocumentContentProvider({ children }: { children: ReactNode }) {
  const [currentDocument, setCurrentDocument] = useState<Document | null>(null);
  const [previousDocument, setPreviousDocument] = useState<Document | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 전역에서 필요한 것만  (최소화) ??!! EditContext 에서 가져오는게 맞나?
  const { 현재_문서를_수정한다 } = useEdit();

  // 문서 조회 함수 (독립 구현)
  const 문서를_조회_한다 = useCallback(
    async (id: string) => {
      // 이미 동일한 문서가 로드되어 있으면 조기 반환
      if (currentDocument?._id === id && !loading) {
        console.log('📖 이미 로드된 문서, 조회 건너뛰기:', { documentId: id });
        return;
      }

      console.log('📖 문서 조회 시도:', {
        documentId: id,
        currentDocumentId: currentDocument?._id,
      });

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/edit/document-content/${id}`);
        console.log('📡 API 응답 상태:', {
          status: response.status,
          ok: response.ok,
          statusText: response.statusText,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('❌ 문서 조회 실패:', {
            status: response.status,
            error: errorData,
          });
          throw new Error(
            errorData.error || `Failed to fetch document: ${response.status}`,
          );
        }

        const document = await response.json();
        console.log('✅ 문서 조회 성공:', {
          documentId: document._id,
          title: document.title,
          contentLength: document.content?.length,
        });

        // 로컬 상태 업데이트
        setPreviousDocument(currentDocument);
        setCurrentDocument(document);

        // 전역 상태 업데이트 (콜백)
        현재_문서를_수정한다(document);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        console.error('Document fetch error:', err);
      } finally {
        setLoading(false);
      }
    },
    [currentDocument?._id, loading, 현재_문서를_수정한다],
  );

  // 문서 저장 함수 (독립 구현)
  const 문서를_저장_한다 = useCallback(
    async (id: string, content: any) => {
      console.log('문서 저장 시도:', {
        id,
        currentDocumentId: currentDocument?._id,
        contentLength: content?.length,
      });

      // currentDocument가 없거나 ID가 일치하지 않아도 저장 시도
      // 단, currentDocument가 있으면 그 정보를 사용하고, 없으면 기본값 사용
      const requestBody = {
        title: currentDocument?.title || '제목 없음',
        content: content,
        folderId: currentDocument?.folderId || null,
        isLocked: currentDocument?.isLocked || false,
      };

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/edit/document-content/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error || `Failed to save document: ${response.status}`,
          );
        }

        const updatedDocument = await response.json();
        console.log('문서 저장 성공:', updatedDocument);

        setCurrentDocument(updatedDocument);

        // 전역 상태 업데이트 (콜백)
        현재_문서를_수정한다(updatedDocument);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        console.error('Document save error:', err);
      } finally {
        setLoading(false);
      }
    },
    [currentDocument, 현재_문서를_수정한다],
  );

  // 문서 정보 수정 함수 (독립 구현)
  const 문서의_정보를_수정_한다 = useCallback(
    async (id: string, data: any) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/edit/document-content/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error('Failed to update document');
        }

        const updatedDocument = await response.json();

        // 로컬 상태 업데이트
        setCurrentDocument(updatedDocument);

        // 전역 상태 업데이트 (콜백)
        현재_문서를_수정한다(updatedDocument);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        console.error('Document update error:', err);
      } finally {
        setLoading(false);
      }
    },
    [현재_문서를_수정한다],
  );

  // 새 문서 생성 함수 (독립 구현)
  const 새로운_문서를_만든다 = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/edit/document-content/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: '새 문서',
          content: [],
          folderId: null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create new document');
      }

      const newDocument = await response.json();
      console.log('✅ 새 문서 생성 성공:', {
        documentId: newDocument._id,
        title: newDocument.title,
      });

      // 로컬 상태 업데이트
      setPreviousDocument(currentDocument);
      setCurrentDocument(newDocument);

      // 전역 상태 업데이트 (콜백)
      현재_문서를_수정한다(newDocument);

      // 새 문서 페이지로 자동 이동
      if (typeof window !== 'undefined') {
        window.location.href = `/edit/${newDocument._id}`;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Create new document error:', err);
    } finally {
      setLoading(false);
    }
  }, [currentDocument, 현재_문서를_수정한다]);

  const contextValue = useMemo(
    () => ({
      currentDocument,
      previousDocument,
      loading,
      error,
      문서를_조회_한다,
      문서를_저장_한다,
      문서의_정보를_수정_한다,
      새로운_문서를_만든다,
    }),
    [
      currentDocument,
      previousDocument,
      loading,
      error,
      문서를_조회_한다,
      문서를_저장_한다,
      문서의_정보를_수정_한다,
      새로운_문서를_만든다,
    ],
  );

  return (
    <DocumentContentContext.Provider value={contextValue}>
      {children}
    </DocumentContentContext.Provider>
  );
}

export function useDocumentContent() {
  const context = useContext(DocumentContentContext);
  if (!context) {
    throw new Error(
      'useDocumentContent must be used within DocumentContentProvider',
    );
  }
  return context;
}
