'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useEdit } from '../_context/EditContext';
import { useDocumentContent } from '../_context/DocumentContentContext';
import DocumentContentPanel from '../_ui/DocumentContent.section/DocumentContent.panel';
import { Spinner } from '@/components/ui';

export default function DocumentEditPage() {
  const { mountEditPage, loading, error, refetch } = useEdit();
  const { 문서를_조회_한다 } = useDocumentContent();
  const params = useParams();
  const documentId = params.id as string;

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
    });
    if (documentId && !loading && isInitialized) {
      console.log('문서를_조회_한다 호출 예정:', documentId);
      // 약간의 지연을 두어 mountEditPage 완료 보장
      const timer = setTimeout(() => {
        문서를_조회_한다(documentId);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [documentId, 문서를_조회_한다, loading, isInitialized]);

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
    return (
      <div className='flex-1 flex items-center justify-center'>
        <div className='text-center'>
          <div className='text-red-500 mb-4'>오류: {error}</div>
          <button
            onClick={() => {
              setIsInitialized(false);
              refetch();
            }}
            className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'>
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return <DocumentContentPanel />;
}
