'use client';

import { useDocumentHeader } from '@/app/(editing)/edit/_context/DocumentHeaderContext';
import DocumentTitleModule from './DocumentTitle.module/index';
import DocumentActionsModule from './DocumentActions.module/index';

export default function DocumentHeaderPanel() {
  const { currentDocument } = useDocumentHeader();

  return (
    <div className='border-b bg-white px-6 py-3 flex items-center justify-between'>
      <div className='flex items-center flex-1 min-w-0'>
        <DocumentTitleModule document={currentDocument} />
      </div>
      <div className='flex items-center gap-2'>
        <DocumentActionsModule document={currentDocument} />
      </div>
    </div>
  );
}
