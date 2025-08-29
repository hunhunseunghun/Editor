import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Document, Folder } from '@/types/common';
import { useLayoutStore } from '@/store/use-layout-store';

// 🔥 사이드바 데이터 상태 타입
interface SidebarDataState {
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

// 🔥 API 응답 타입
interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

// 🔥 사이드바 데이터 관리 커스텀 훅
export const useSidebarData = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [state, setState] = useState<SidebarDataState>({
    loading: false,
    error: null,
    lastUpdated: null,
  });

  const {
    setSidebarDocuments,
    setSidebarFolders,
    setSidebarDeletedDocuments,
    addSidebarDocument,
    updateSidebarDocumentTitle,
  } = useLayoutStore();

  // 🔥 사용자 찾을 수 없음 에러 체크 및 리다이렉트
  const checkUserNotFoundError = useCallback(
    async (response: Response, context: string): Promise<boolean> => {
      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          `${context} 조회 실패:`,
          response.status,
          response.statusText,
        );
        console.error(`${context} 에러 응답 내용:`, errorText);

        try {
          const errorData = JSON.parse(errorText);
          if (errorData.error === '사용자를 찾을 수 없습니다.') {
            router.push('/auth/signin');
            return true; // 에러 처리됨
          }
        } catch {
          if (errorText.includes('사용자를 찾을 수 없습니다')) {
            router.push('/auth/signin');
            return true; // 에러 처리됨
          }
        }
      }
      return false; // 에러 처리되지 않음
    },
    [router],
  );

  // 🔥 통합 데이터 로딩 함수
  const fetchSidebarData = useCallback(async () => {
    if (!session?.user?.email) {
      setState((prev) => ({ ...prev, error: '인증이 필요합니다.' }));
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const [foldersResponse, docsResponse, trashResponse] = await Promise.all([
        fetch('/api/folders'),
        fetch('/api/documents'),
        fetch('/api/trash/documents'),
      ]);

      // 각 응답에 대해 사용자 찾을 수 없음 에러 체크
      const foldersErrorHandled = await checkUserNotFoundError(
        foldersResponse,
        '폴더 목록',
      );
      const docsErrorHandled = await checkUserNotFoundError(
        docsResponse,
        '문서 목록',
      );
      const trashErrorHandled = await checkUserNotFoundError(
        trashResponse,
        '휴지통 문서 목록',
      );

      if (foldersErrorHandled || docsErrorHandled || trashErrorHandled) {
        return;
      }

      // 폴더 데이터 처리
      if (foldersResponse.ok) {
        const responseData: ApiResponse<Folder[]> =
          await foldersResponse.json();
        setSidebarFolders(responseData.data || []);
      }

      // 문서 데이터 처리
      if (docsResponse.ok) {
        const responseData: ApiResponse<Document[]> = await docsResponse.json();
        const documents = responseData.data || [];

        // Document를 SidebarDocument로 변환
        const sidebarDocs = documents.map((doc: Document) => ({
          _id: doc._id,
          title: doc.title,
          content: doc.content,
          author: doc.author,
          folderId: doc.folderId,
          isLocked: doc.isLocked || false,
          isDeleted: doc.isDeleted || false,
          order: doc.order || 0,
          createdAt: doc.createdAt,
          updatedAt: doc.updatedAt,
          deletedAt: doc.deletedAt,
        }));
        setSidebarDocuments(sidebarDocs);
      }

      // 휴지통 데이터 처리
      if (trashResponse.ok) {
        const responseData: ApiResponse<Document[]> =
          await trashResponse.json();
        setSidebarDeletedDocuments(responseData.data || []);
      }

      setState((prev) => ({
        ...prev,
        loading: false,
        lastUpdated: new Date(),
      }));
    } catch (error) {
      console.error('사이드바 데이터 조회 에러:', error);
      setState((prev) => ({
        ...prev,
        loading: false,
        error: '데이터 로딩 중 오류가 발생했습니다.',
      }));
    }
  }, [
    session,
    checkUserNotFoundError,
    setSidebarDocuments,
    setSidebarFolders,
    setSidebarDeletedDocuments,
  ]);

  // 🔥 문서 생성 함수
  const createDocument = useCallback(
    async (title: string = '새 문서', folderId: string | null = null) => {
      try {
        const response = await fetch('/api/documents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            content: [],
            folderId,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          // 낙관적 업데이트
          const newDocument: Document = {
            _id: data.data._id,
            title: data.data.title || title,
            content: data.data.content || [],
            author: data.data.author,
            folderId: data.data.folderId || null,
            isLocked: data.data.isLocked || false,
            isDeleted: false,
            isHiddenFromTrash: false,
            order: data.data.order || 0,
            createdAt: new Date(data.data.createdAt),
            updatedAt: new Date(data.data.updatedAt),
            deletedAt: null,
          };

          addSidebarDocument(newDocument);
          return data.data._id;
        } else {
          if (data.error === '사용자를 찾을 수 없습니다.') {
            router.push('/auth/signin');
            return null;
          }
          throw new Error(data.error || '문서 생성 중 오류가 발생했습니다.');
        }
      } catch (error) {
        console.error('문서 생성 에러:', error);
        await fetchSidebarData(); // 에러 시 전체 데이터 새로고침
        throw error;
      }
    },
    [addSidebarDocument, router, fetchSidebarData],
  );

  // 🔥 폴더 생성 함수
  const createFolder = useCallback(
    async (
      name: string,
      description: string = '',
      parentId: string | null = null,
    ) => {
      try {
        const response = await fetch('/api/folders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            description,
            parentId,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          // 낙관적 업데이트
          const newFolder: Folder = {
            _id: data.data._id,
            name: data.data.name || name,
            user: data.data.user,
            parentId: data.data.parentId,
            order: data.data.order || 0,
            children: [],
            createdAt: new Date(data.data.createdAt),
            updatedAt: new Date(data.data.updatedAt),
            deletedAt: null,
            isExpanded: false,
            isLocked: false,
            isDeleted: false,
            isHiddenFromTrash: false,
          };

          setSidebarFolders((prev) => [...prev, newFolder]);
          return data.data._id;
        } else {
          if (data.error === '사용자를 찾을 수 없습니다.') {
            router.push('/auth/signin');
            return null;
          }
          throw new Error(data.error || '폴더 생성 중 오류가 발생했습니다.');
        }
      } catch (error) {
        console.error('폴더 생성 에러:', error);
        await fetchSidebarData(); // 에러 시 전체 데이터 새로고침
        throw error;
      }
    },
    [setSidebarFolders, router, fetchSidebarData],
  );

  // 🔥 문서 제목 업데이트 함수
  const updateDocumentTitle = useCallback(
    async (docId: string, newTitle: string) => {
      try {
        // 낙관적 업데이트
        updateSidebarDocumentTitle(docId, newTitle);

        const response = await fetch(`/api/documents/${docId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: newTitle }),
        });

        if (!response.ok) {
          console.error('문서 제목 업데이트 API 실패:', response.status);
          // 실패 시 원래 제목으로 롤백
          const { sidebarDocuments } = useLayoutStore.getState();
          const originalDoc = sidebarDocuments.find((doc) => doc._id === docId);
          if (originalDoc) {
            updateSidebarDocumentTitle(docId, originalDoc.title);
          }
        }
      } catch (error) {
        console.error('문서 제목 업데이트 에러:', error);
        // 에러 시 원래 제목으로 롤백
        const { sidebarDocuments } = useLayoutStore.getState();
        const originalDoc = sidebarDocuments.find((doc) => doc._id === docId);
        if (originalDoc) {
          updateSidebarDocumentTitle(docId, originalDoc.title);
        }
      }
    },
    [updateSidebarDocumentTitle],
  );

  // 🔥 초기 데이터 로드
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.email) {
      fetchSidebarData();
    }
  }, [status, session, fetchSidebarData]);

  return {
    loading: false, // UI에서 로딩 상태 무시
    error: state.error,
    lastUpdated: state.lastUpdated,
    fetchSidebarData,
    createDocument,
    createFolder,
    updateDocumentTitle,
  };
};
