'use client';

import { useDocumentHeader } from '@/app/(editing)/edit/_context/DocumentHeaderContext';

interface DocumentTitleModuleProps {
  document?: any;
}

export default function DocumentTitleModule({
  document: _document,
}: DocumentTitleModuleProps) {
  const { currentDocument, previousDocument } = useDocumentHeader();

  // 표시할 문서 정보 결정 (현재 문서가 없으면 이전 문서 사용)
  const displayDocument = currentDocument || previousDocument;

  return (
    <div className='flex items-center flex-1 min-w-0'>
      <h2 className='text-sm font-medium text-gray-600 truncate'>
        {displayDocument?.title || '문서 생성'}
      </h2>
    </div>
  );
}
