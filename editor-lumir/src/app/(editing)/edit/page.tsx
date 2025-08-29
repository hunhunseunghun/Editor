'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEdit } from './_context/EditContext';
import { Spinner } from '@/components/ui';

function EditPageContent() {
  const { data: session, status } = useSession();
  const { mountEditPage, loading, error, refetch } = useEdit();
  const pathname = usePathname();

  // URL이 /edit/[id] 형태인지 확인
  const isDocumentPage = pathname.includes('/edit/') && pathname !== '/edit';

  useEffect(() => {
    // 인증되지 않은 상태면 즉시 리다이렉트
    if (status === 'unauthenticated') {
      window.location.href = '/signin';
      return;
    }

    // 인증된 상태에서만 API 호출
    if (status === 'authenticated' && session?.user && !isDocumentPage) {
      mountEditPage();
    }
  }, [mountEditPage, isDocumentPage, status, session]);

  // 로딩 상태 표시
  if (status === 'loading') {
    return (
      <div className='flex-1 flex items-center justify-center'>
        <Spinner size='md' />
      </div>
    );
  }

  // 인증되지 않은 상태 (리다이렉트 중)
  if (status === 'unauthenticated') {
    return (
      <div className='flex-1 flex items-center justify-center'>
        <Spinner size='md' />
      </div>
    );
  }

  // 페이지 로딩 상태 (Context에서 관리)
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
            onClick={refetch}
            className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'>
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  // 문서 목록 페이지 렌더링
  return (
    <main className='flex-1 bg-background transition-all duration-300 h-full w-full overflow-y-auto px-6'>
      <div className='flex-1 flex flex-col bg-white h-full min-h-0'></div>
    </main>
  );
}

export default function EditPage() {
  return <EditPageContent />;
}
