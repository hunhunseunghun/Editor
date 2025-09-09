'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEdit } from './_context/EditContext';
import { useDocumentContent } from './_context/DocumentContentContext';
import { Spinner } from '@/components/ui';

function EditPageContent() {
  const { data: session, status } = useSession();
  const { mountEditPage, loading, error, refetch, documents } = useEdit();
  const { 새로운_문서를_만든다 } = useDocumentContent();
  const pathname = usePathname();
  const router = useRouter();

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

  // 문서 편집 대시보드 렌더링
  return (
    <main className='flex-1 bg-background transition-all duration-300 h-full w-full overflow-y-auto'>
      <div className='flex-1 flex flex-col bg-white h-full min-h-0'>
        <div className='flex-1 flex items-center justify-center p-8'>
          <div className='text-center max-w-2xl'>
            <div className='mb-8'>
              <h1 className='text-3xl font-bold text-gray-900 mb-4'>
                문서 편집기에 오신 것을 환영합니다
              </h1>
              <p className='text-lg text-gray-600 mb-6'>
                왼쪽 사이드바에서 문서를 선택하여 편집을 시작하세요.
              </p>
            </div>

            {documents.length === 0 ? (
              <div className='bg-gray-50 rounded-lg p-8 mb-6'>
                <div className='text-gray-500 mb-4'>
                  아직 작성한 문서가 없습니다.
                </div>
                <button
                  onClick={async () => {
                    try {
                      await 새로운_문서를_만든다();
                      await refetch();
                    } catch (err) {
                      console.error('새 문서 생성 실패:', err);
                    }
                  }}
                  className='px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors'>
                  첫 번째 문서 만들기
                </button>
              </div>
            ) : (
              <div className='bg-blue-50 rounded-lg p-6 mb-6'>
                <div className='text-blue-700 mb-4'>
                  💡 <strong>{documents.length}개의 문서</strong>가 있습니다
                </div>
                <div className='text-blue-600 text-sm mb-4'>
                  사이드바에서 문서를 클릭하여 편집을 시작하거나, 새 문서를
                  만들어보세요.
                </div>
                <button
                  onClick={async () => {
                    try {
                      await 새로운_문서를_만든다();
                      await refetch();
                    } catch (err) {
                      console.error('새 문서 생성 실패:', err);
                    }
                  }}
                  className='px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors'>
                  + 새 문서 만들기
                </button>
              </div>
            )}

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-500'>
              <div className='flex items-center'>
                <div className='w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3'>
                  📄
                </div>
                <div>
                  <div className='font-medium text-gray-700'>문서 편집</div>
                  <div>사이드바에서 문서를 클릭하세요</div>
                </div>
              </div>
              <div className='flex items-center'>
                <div className='w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3'>
                  📁
                </div>
                <div>
                  <div className='font-medium text-gray-700'>폴더 관리</div>
                  <div>문서를 폴더로 정리하세요</div>
                </div>
              </div>
              <div className='flex items-center'>
                <div className='w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3'>
                  ⌘
                </div>
                <div>
                  <div className='font-medium text-gray-700'>키보드 단축키</div>
                  <div>Ctrl+B로 사이드바 토글</div>
                </div>
              </div>
              <div className='flex items-center'>
                <div className='w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3'>
                  💾
                </div>
                <div>
                  <div className='font-medium text-gray-700'>자동 저장</div>
                  <div>변경사항이 자동으로 저장됩니다</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function EditPage() {
  return <EditPageContent />;
}
