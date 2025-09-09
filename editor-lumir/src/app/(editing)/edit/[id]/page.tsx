'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useEdit } from '../_context/EditContext';
import { useDocumentContent } from '../_context/DocumentContentContext';
import DocumentContentPanel from '../_ui/DocumentContent.section/DocumentContent.panel';
import { Spinner } from '@/components/ui';

export default function DocumentEditPage() {
  const { mountEditPage, loading, error, refetch } = useEdit();
  const { 문서를_조회_한다, currentDocument } = useDocumentContent();
  const params = useParams();
  
  // 하드코딩된 문서 ID (개발용)
  const FIXED_DOCUMENT_ID = '68bfcf76345a021f12b1e69c';
  const documentId = FIXED_DOCUMENT_ID; // URL 파라미터 대신 고정 ID 사용
  
  console.log('🔒 하드코딩된 문서 ID 사용:', FIXED_DOCUMENT_ID);

  // 로컬 초기화 상태 (문서 조회를 위한 것)
  const [isInitialized, setIsInitialized] = useState(false);

  console.log('DocumentEditPage 렌더링:', { documentId, loading, error });

  // 초기 데이터 로딩 (사이드바 데이터) - 한 번만 실행
  useEffect(() => {
    const initializeData = async () => {
      if (isInitialized) return;

      try {
        console.log('mountEditPage 호출됨');
        await mountEditPage();
        setIsInitialized(true);
      } catch (err) {
        console.error('Edit page mount error:', err);
      }
    };

    initializeData();
  }, [mountEditPage, isInitialized]);

  // 특정 문서 로딩 - mountEditPage 완료 후 실행
  useEffect(() => {
    console.log('문서 조회 useEffect 실행:', {
      documentId,
      loading,
      isInitialized,
      hasCurrentDocument: !!currentDocument,
      currentDocumentId: currentDocument?._id,
    });

    // 이미 올바른 문서가 로드되어 있으면 다시 로드하지 않음
    if (currentDocument?._id === documentId) {
      console.log('이미 올바른 문서가 로드됨, 재조회 생략');
      return;
    }

    if (documentId && !loading && isInitialized) {
      console.log('문서를_조회_한다 호출 예정:', documentId);
      // 약간의 지연을 두어 mountEditPage 완료 보장
      const timer = setTimeout(() => {
        문서를_조회_한다(documentId);
      }, 100);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentId, loading, isInitialized, currentDocument?._id]); // currentDocument._id 추가

  // 로딩 상태 (Context에서 관리)
  if (loading) {
    return (
      <div className='flex-1 flex items-center justify-center'>
        <Spinner size='md' />
      </div>
    );
  }

  // 에러 상태 (Context에서 관리)
  if (error) {
    const isDocumentNotFound =
      error.includes('Failed to fetch document: 404') ||
      error.includes('문서를 찾을 수 없습니다');

    return (
      <div className='flex-1 flex items-center justify-center'>
        <div className='text-center'>
          {isDocumentNotFound ? (
            <>
              <div className='text-gray-500 mb-4'>
                요청하신 문서를 찾을 수 없습니다.
              </div>
              <div className='text-sm text-gray-400 mb-6'>
                문서가 삭제되었거나 접근 권한이 없을 수 있습니다.
              </div>
              <div className='space-x-4'>
                <button
                  onClick={() => (window.location.href = '/edit')}
                  className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'>
                  문서 목록으로 돌아가기
                </button>
                <button
                  onClick={() => {
                    setIsInitialized(false);
                    refetch();
                  }}
                  className='px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600'>
                  다시 시도
                </button>
              </div>
            </>
          ) : (
            <>
              <div className='text-red-500 mb-4'>오류: {error}</div>
              <button
                onClick={() => {
                  setIsInitialized(false);
                  refetch();
                }}
                className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'>
                다시 시도
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return <DocumentContentPanel />;
}
