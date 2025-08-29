'use client';

import {
  createContext,
  useContext,
  ReactNode,
  useCallback,
  useState,
} from 'react';
import { useEdit } from './EditContext';
import { Document } from '@/types/entities';

interface DocumentHeaderContextType {
  // 로컬 상태 (독립 관리)
  currentDocument: Document | null;
  previousDocument: Document | null;
  loading: boolean;
  error: string | null;

  문서_상태를_잠금으로_변경한다: (
    id: string,
    isLocked: boolean,
  ) => Promise<void>;
  문서를_삭제한다: (id: string) => Promise<void>;
}

const DocumentHeaderContext = createContext<
  DocumentHeaderContextType | undefined
>(undefined);

export function DocumentHeaderProvider({ children }: { children: ReactNode }) {
  // 로컬 상태 관리 (독립적)
  const [currentDocument, setCurrentDocument] = useState<Document | null>(null);
  const [previousDocument, setPreviousDocument] = useState<Document | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { 현재_문서를_수정한다 } = useEdit();

  // 문서 잠금 상태 변경 함수 (독립 구현)
  const 문서_상태를_잠금으로_변경한다 = useCallback(
    async (id: string, isLocked: boolean) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/edit/document-header/lock', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            documentId: id,
            isLocked: isLocked,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to toggle document lock');
        }

        const responseData = await response.json();
        if (responseData.success) {
          // 로컬 상태 업데이트
          const updatedDocument = {
            ...currentDocument!,
            isLocked: responseData.isLocked,
          };
          setCurrentDocument(updatedDocument);

          // 전역 상태 업데이트 (콜백)
          현재_문서를_수정한다(updatedDocument);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        console.error('Toggle document lock error:', err);
      } finally {
        setLoading(false);
      }
    },
    [currentDocument, 현재_문서를_수정한다],
  );

  // 문서 삭제 함수 (독립 구현)
  const 문서를_삭제한다 = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/edit/document-header/trash', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            documentId: id,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to move document to trash');
        }

        // 성공 시 이전 문서로 이동
        if (previousDocument) {
          setCurrentDocument(previousDocument);
          setPreviousDocument(null);

          // 전역 상태 업데이트 (콜백)
          현재_문서를_수정한다(previousDocument);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        console.error('Move to trash error:', err);
      } finally {
        setLoading(false);
      }
    },
    [previousDocument, 현재_문서를_수정한다],
  );

  const contextValue = {
    currentDocument,
    previousDocument,
    loading,
    error,
    문서_상태를_잠금으로_변경한다,
    문서를_삭제한다,
  };

  return (
    <DocumentHeaderContext.Provider value={contextValue}>
      {children}
    </DocumentHeaderContext.Provider>
  );
}

export function useDocumentHeader() {
  const context = useContext(DocumentHeaderContext);
  if (!context) {
    throw new Error(
      'useDocumentHeader must be used within DocumentHeaderProvider',
    );
  }
  return context;
}
