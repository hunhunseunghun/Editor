'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, FileText, RotateCcw, X, Loader2, Folder } from 'lucide-react';
import { useLayoutStore } from '@/store/use-layout-store';
import { useSidebarData } from '@/hooks/useSidebarData';
import { Document, Folder as FolderType } from '@/types/entities';

interface TrashDialogProps {
  children: React.ReactNode;
}

// 디바운스 훅
const useDebounceCallback = (delay: number) => {
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const delayedCallback = useCallback(
    (callback: () => void) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      const newTimeoutId = setTimeout(callback, delay);
      setTimeoutId(newTimeoutId);
    },
    [delay, timeoutId],
  );

  return { delayedCallback };
};

export default function TrashDialog({ children }: TrashDialogProps) {
  const router = useRouter();
  // const closeButtonRef = useRef<HTMLButtonElement>(null);
  const { delayedCallback } = useDebounceCallback(500);
  const { triggerSidebarUpdate } = useLayoutStore();
  const { fetchSidebarData } = useSidebarData();

  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [activeTab, setActiveTab] = useState<'documents' | 'folders'>(
    'documents',
  );
  const [deletedDocuments, setDeletedDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [deletedFolders, setDeletedFolders] = useState<FolderType[]>([]);
  const [filteredFolders, setFilteredFolders] = useState<FolderType[]>([]);

  // 휴지통 문서 목록 가져오기
  const fetchTrashDocuments = useCallback(async (keyword?: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/trash/documents');
      if (response.ok) {
        const responseData = await response.json();
        const documents = responseData.data || [];
        setDeletedDocuments(documents);

        // 검색어가 있으면 필터링
        if (keyword) {
          const filtered = documents.filter((doc: Document) =>
            doc.title.toLowerCase().includes(keyword.toLowerCase()),
          );
          setFilteredDocuments(filtered);
        } else {
          setFilteredDocuments(documents);
        }
      }
    } catch (error) {
      console.error('휴지통 문서 조회 에러:', error);
      alert('휴지통 문서를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  // 휴지통 폴더 목록 가져오기
  const fetchTrashFolders = useCallback(async (keyword?: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/trash/folders');
      if (response.ok) {
        const responseData = await response.json();
        const folders = responseData.data || [];
        setDeletedFolders(folders);

        // 검색어가 있으면 필터링
        if (keyword) {
          const filtered = folders.filter((folder: FolderType) =>
            folder.name.toLowerCase().includes(keyword.toLowerCase()),
          );
          setFilteredFolders(filtered);
        } else {
          setFilteredFolders(folders);
        }
      } else {
        console.error('휴지통 폴더 조회 실패:', response.statusText);
        alert('휴지통 폴더를 불러오는 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('휴지통 폴더 조회 에러:', error);
      alert('휴지통 폴더를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  // 휴지통 데이터 가져오기 (문서 + 폴더)
  const fetchTrashData = useCallback(
    async (keyword?: string) => {
      setLoading(true);
      try {
        await Promise.all([
          fetchTrashDocuments(keyword),
          fetchTrashFolders(keyword),
        ]);
      } catch (error) {
        console.error('휴지통 데이터 조회 에러:', error);
        alert('휴지통 데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    },
    [fetchTrashDocuments, fetchTrashFolders],
  );

  // 검색 핸들러
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchKeyword(value);

      delayedCallback(() => {
        if (value) {
          // 문서 필터링
          const filteredDocs = deletedDocuments.filter((doc) =>
            doc.title.toLowerCase().includes(value.toLowerCase()),
          );
          setFilteredDocuments(filteredDocs);

          // 폴더 필터링
          const filteredFolders = deletedFolders.filter((folder) =>
            folder.name.toLowerCase().includes(value.toLowerCase()),
          );
          setFilteredFolders(filteredFolders);
        } else {
          setFilteredDocuments(deletedDocuments);
          setFilteredFolders(deletedFolders);
        }
      });
    },
    [deletedDocuments, deletedFolders, delayedCallback],
  );

  // 문서 복구
  const handleRestoreDocument = useCallback(
    async (docId: string) => {
      try {
        const response = await fetch(`/api/trash/documents/${docId}/restore`, {
          method: 'POST',
        });

        if (response.ok) {
          // 목록에서 제거
          setDeletedDocuments((prev) =>
            prev.filter((doc) => doc._id !== docId),
          );
          setFilteredDocuments((prev) =>
            prev.filter((doc) => doc._id !== docId),
          );

          // 사이드바 업데이트 트리거
          triggerSidebarUpdate('restore', docId);
          fetchSidebarData(); // 사이드바 데이터 새로고침

          // 성공 메시지
          alert('문서가 성공적으로 복원되었습니다.');

          // 문서 페이지로 이동
          router.push(`/documents/${docId}`);
        } else {
          console.error('문서 복구 실패:', response.statusText);
          alert('문서 복구 중 오류가 발생했습니다.');
        }
      } catch (error) {
        console.error('문서 복구 에러:', error);
        alert('문서 복구 중 오류가 발생했습니다.');
      }
    },
    [router, triggerSidebarUpdate, fetchSidebarData],
  );

  const handleDeletePermanently = useCallback(
    async (docId: string) => {
      if (
        !confirm(
          '정말 영구적으로 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
        )
      ) {
        return;
      }

      try {
        const response = await fetch(`/api/trash/documents/${docId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          // 목록에서 제거
          setDeletedDocuments((prev) =>
            prev.filter((doc) => doc._id !== docId),
          );
          setFilteredDocuments((prev) =>
            prev.filter((doc) => doc._id !== docId),
          );

          // 성공 메시지
          alert('문서가 영구적으로 삭제되었습니다.');

          // 사이드바 업데이트 트리거
          triggerSidebarUpdate('delete', docId);
          fetchSidebarData(); // 사이드바 데이터 새로고침
        } else {
          console.error('문서 영구 삭제 중 오류가 발생했습니다.');
          alert('문서 영구 삭제 중 오류가 발생했습니다.');
        }
      } catch (error) {
        console.error('문서 영구 삭제 에러:', error);
        alert('문서 영구 삭제 중 오류가 발생했습니다.');
      }
    },
    [triggerSidebarUpdate, fetchSidebarData],
  );

  // 폴더 복구
  const handleRestoreFolder = useCallback(
    async (folderId: string) => {
      try {
        const response = await fetch(`/api/trash/folders/${folderId}/restore`, {
          method: 'POST',
        });

        if (response.ok) {
          // 목록에서 제거
          setDeletedFolders((prev) =>
            prev.filter((folder) => folder._id !== folderId),
          );
          setFilteredFolders((prev) =>
            prev.filter((folder) => folder._id !== folderId),
          );

          // 성공 메시지
          alert('폴더가 성공적으로 복원되었습니다.');

          // 사이드바 업데이트 트리거
          triggerSidebarUpdate('restore', folderId);
          fetchSidebarData(); // 사이드바 데이터 새로고침
        } else {
          console.error('폴더 복구 실패:', response.statusText);
          alert('폴더 복구 중 오류가 발생했습니다.');
        }
      } catch (error) {
        console.error('폴더 복구 에러:', error);
        alert('폴더 복구 중 오류가 발생했습니다.');
      }
    },
    [triggerSidebarUpdate, fetchSidebarData],
  );

  // 폴더 영구 삭제
  const handleDeleteFolderPermanently = useCallback(
    async (folderId: string) => {
      if (
        !confirm(
          '정말 영구적으로 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
        )
      ) {
        return;
      }

      try {
        const response = await fetch(`/api/trash/folders/${folderId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          // 목록에서 제거
          setDeletedFolders((prev) =>
            prev.filter((folder) => folder._id !== folderId),
          );
          setFilteredFolders((prev) =>
            prev.filter((folder) => folder._id !== folderId),
          );

          // 성공 메시지
          alert('폴더가 영구적으로 삭제되었습니다.');

          // 사이드바 업데이트 트리거
          triggerSidebarUpdate('delete', folderId);
          fetchSidebarData(); // 사이드바 데이터 새로고침
        } else {
          console.error('폴더 영구 삭제 중 오류가 발생했습니다.');
          alert('폴더 영구 삭제 중 오류가 발생했습니다.');
        }
      } catch (error) {
        console.error('폴더 영구 삭제 에러:', error);
        alert('폴더 영구 삭제 중 오류가 발생했습니다.');
      }
    },
    [triggerSidebarUpdate, fetchSidebarData],
  );

  // 문서 클릭 핸들러 (현재 사용되지 않음)
  // const handleDocumentClick = useCallback(
  //   (docId: string) => {
  //     closeButtonRef.current?.click();
  //     router.push(`/documents/${docId}`);
  //   },
  //   [router],
  // );

  // 다이얼로그 열기/닫기 핸들러
  const handleOpenChange = useCallback(
    (open: boolean) => {
      setIsOpen(open);
      if (open) {
        fetchTrashData();
      }
    },
    [fetchTrashData],
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        autoFocus={false}
        onOpenAutoFocus={(e) => e.preventDefault()}
        className='top-[5%] flex w-[90%] translate-y-[0] flex-col gap-0 overflow-hidden rounded-xl p-0 md:!max-w-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700'>
        <DialogTitle className='sr-only'>Trash</DialogTitle>
        {/* 헤더 */}
        <div className='mb-1 flex items-center justify-between p-3 dark:border-stone-700'>
          <div className='flex items-center'>
            <Trash2 className='mr-2 h-4 w-4 text-stone-600 dark:text-stone-400' />
            <p className='text-base font-medium leading-none text-stone-900 dark:text-stone-100'>
              휴지통
            </p>
          </div>
          <Button
            variant='ghost'
            size='sm'
            className='h-6 w-6 p-0 text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 hover:cursor-pointer'
            onClick={() => setIsOpen(false)}>
            <X className='h-4 w-4' />
          </Button>
        </div>

        {/* 탭 */}
        <div className='flex border-b'>
          <Button
            variant={'ghost'}
            size='sm'
            data-state={activeTab === 'folders' ? 'active' : 'inactive'}
            className='rounded-none border-b-2 border-transparent px-1 py-1 data-[state=active]:border-stone-600 dark:data-[state=active]:border-stone-400 data-[state=active]:text-stone-900 dark:data-[state=active]:text-stone-100 text-stone-600 dark:text-stone-400 dark:hover:text-stone-100 hover:cursor-pointer hover:bg-transparent'
            onClick={() => setActiveTab('folders')}>
            <Folder className='mr-0.5 h-2 w-2' />
            {filteredFolders.length}
          </Button>
          <Button
            variant={'ghost'}
            size='sm'
            data-state={activeTab === 'documents' ? 'active' : 'inactive'}
            className='rounded-none border-b-2 border-transparent px-1 py-1 data-[state=active]:border-stone-600 dark:data-[state=active]:border-stone-400 data-[state=active]:text-stone-900 dark:data-[state=active]:text-stone-100 text-stone-600 dark:text-stone-400 dark:hover:text-stone-100 hover:cursor-pointer hover:bg-transparent'
            onClick={() => setActiveTab('documents')}>
            <FileText className='mr-0.5 h-2 w-2' />
            {filteredDocuments.length}
          </Button>
        </div>

        {/* 검색 바 */}
        <div className='px-3 pb-3 pt-3'>
          <Input
            type='text'
            placeholder={`검색`}
            className='rounded-xl border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder:text-stone-500 dark:placeholder:text-stone-400 focus:border-stone-400 dark:focus:border-stone-500'
            value={searchKeyword}
            onChange={handleSearchChange}
            autoFocus={false}
          />
        </div>

        {/* 검색 결과 표시 */}
        {searchKeyword && (
          <p className='px-3 py-2 text-xs text-stone-600 dark:text-stone-400'>
            Showing search result for{' '}
            <i className='font-medium text-stone-900 dark:text-stone-100'>
              {searchKeyword}
            </i>
          </p>
        )}

        {/* 로딩 상태 */}
        {loading && !deletedDocuments.length && !deletedFolders.length && (
          <div className='flex h-28 items-center justify-center text-stone-500 dark:text-stone-400'>
            <Loader2 className='h-4 w-4 animate-spin' />
          </div>
        )}

        {/* 빈 상태 */}
        {!loading &&
          ((activeTab === 'documents' &&
            !filteredDocuments.length &&
            !searchKeyword) ||
            (activeTab === 'folders' &&
              !filteredFolders.length &&
              !searchKeyword)) && (
            <div className='flex min-h-28 items-center justify-center text-stone-500 dark:text-stone-400'>
              <p className='text-sm font-light'>Empty</p>
            </div>
          )}

        {/* 검색 결과 없음 */}
        {!loading &&
          ((activeTab === 'documents' &&
            !filteredDocuments.length &&
            searchKeyword) ||
            (activeTab === 'folders' &&
              !filteredFolders.length &&
              searchKeyword)) && (
            <div className='flex min-h-28 items-center justify-center text-sm text-stone-500 dark:text-stone-400'>
              검색 결과 없음
              <span className='ml-1 max-w-[100px] truncate align-middle font-medium italic text-stone-900 dark:text-stone-100'>
                {searchKeyword}
              </span>
            </div>
          )}

        {/* 폴더 목록 */}
        {activeTab === 'folders' && filteredFolders.length > 0 && (
          <ScrollArea className='w-full pb-2'>
            <div className='max-h-[340px] min-h-28 w-full'>
              {filteredFolders.map((folder) => (
                <div
                  key={folder._id}
                  title='Click to restore'
                  className='relative flex h-10 max-w-full items-center gap-x-2 px-3 transition hover:bg-secondary'>
                  <Folder className='h-4 w-4 text-muted-foreground' />
                  <span className='max-w-[260px] truncate whitespace-nowrap pr-3 text-sm text-primary md:max-w-[460px]'>
                    {folder.name || 'Untitled'}
                  </span>

                  <div
                    className='absolute right-0 top-0 flex h-full items-center gap-x-1 pr-3'
                    onClick={(e) => {
                      e.stopPropagation();
                    }}>
                    <Button
                      title='Click to restore'
                      className='h-6 w-6 text-muted-foreground hover:bg-primary/10'
                      variant='ghost'
                      size='icon'
                      onClick={() => handleRestoreFolder(folder._id)}>
                      <RotateCcw size={16} />
                    </Button>
                    <Button
                      title='Click to delete permanently'
                      className='h-6 w-6 text-muted-foreground hover:bg-primary/10'
                      variant='ghost'
                      size='icon'
                      onClick={() => handleDeleteFolderPermanently(folder._id)}>
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        {/* 문서 목록 */}
        {activeTab === 'documents' && filteredDocuments.length > 0 && (
          <ScrollArea className='w-full pb-2'>
            <div className='max-h-[340px] min-h-28 w-full'>
              {filteredDocuments.map((doc) => (
                <div
                  key={doc._id}
                  title='Click to open'
                  className='relative flex h-10 max-w-full items-center gap-x-2 px-3 transition-all duration-200 hover:bg-secondary '>
                  <FileText className='h-4 w-4 text-stone-500 dark:text-stone-400' />
                  <span className='max-w-[260px] truncate whitespace-nowrap pr-3 text-sm font-light text-stone-900 dark:text-stone-100 md:max-w-[460px]'>
                    {doc.title || 'Untitled'}
                  </span>

                  <div
                    className='absolute right-0 top-0 flex h-full items-center gap-x-1 pr-3'
                    onClick={(e) => {
                      e.stopPropagation();
                    }}>
                    <Button
                      title='Click to restore'
                      className='h-6 w-6 text-muted-foreground '
                      variant='ghost'
                      size='icon'
                      onClick={() => handleRestoreDocument(doc._id)}>
                      <RotateCcw size={16} />
                    </Button>
                    <Button
                      title='Click to delete permanently'
                      className='h-6 w-6 text-muted-foreground '
                      variant='ghost'
                      size='icon'
                      onClick={() => handleDeletePermanently(doc._id)}>
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
