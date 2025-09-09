'use client';

import React, { useState } from 'react';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  ChevronDown,
  ChevronRight,
  FileText,
  Folder,
  MoreHorizontal,
  Plus,
  Trash2,
  Settings,
  User,
  HelpCircle,
} from 'lucide-react';

// 하드코딩된 데이터
const HARDCODED_DATA = {
  user: {
    name: 'Lumir User',
    email: 'user@lumireditor.com',
    avatar: 'N',
  },
  folders: [
    {
      id: '1',
      name: 'Lumir Editor',
      isExpanded: true,
      documents: [
        {
          id: 'doc-1',
          title: 'Lumir Editor',
          icon: FileText,
        },
      ],
    },
  ],
};

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(['1']),
  );

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const handleDocumentClick = (docId: string) => {
    console.log('Document clicked:', docId);
    // 하드코딩된 동작 - 실제로는 라우팅 처리
  };

  const handleAction = (action: string) => {
    console.log('Action:', action);
    alert(`${action} 기능은 데모용으로 비활성화되어 있습니다.`);
  };

  return (
    <aside
      className={`group/sidebar w-full h-full overflow-hidden bg-stone-50 dark:bg-stone-900 relative ${className}`}
      data-sidebar-container>
      <div className='flex flex-col h-full'>
        {/* 헤더 */}
        <div className='p-4 border-b border-stone-200 dark:border-stone-700'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-2'>
              <div className='w-8 h-8 bg-stone-900 dark:bg-stone-100 rounded-lg flex items-center justify-center'>
                <span className='text-white dark:text-stone-900 font-semibold text-sm'>
                  L
                </span>
              </div>
              <span className='font-semibold text-stone-900 dark:text-stone-100'>
                Seunghun
              </span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' size='sm'>
                  <MoreHorizontal className='h-4 w-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                <DropdownMenuItem onClick={() => handleAction('설정')}>
                  <Settings className='h-4 w-4 mr-2 text-stone-600 dark:text-stone-400' />
                  설정
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAction('도움말')}>
                  <HelpCircle className='h-4 w-4 mr-2 text-stone-600 dark:text-stone-400' />
                  도움말
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* 액션 버튼들 */}
        <div className='p-3 space-y-2'>
          <Button
            variant='outline'
            size='sm'
            className='w-full justify-start text-left border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
            onClick={() => handleAction('새 문서')}>
            <Plus className='h-4 w-4 mr-2 text-stone-600 dark:text-stone-400' />
            새 문서
          </Button>
          <Button
            variant='outline'
            size='sm'
            className='w-full justify-start text-left border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
            onClick={() => handleAction('새 폴더')}>
            <Folder className='h-4 w-4 mr-2 text-stone-600 dark:text-stone-400' />
            새 폴더
          </Button>
        </div>

        <Separator />

        {/* 문서 트리 */}
        <ScrollArea className='flex-1 px-3'>
          <div className='py-2'>
            {HARDCODED_DATA.folders.map((folder) => {
              const isExpanded = expandedFolders.has(folder.id);

              return (
                <div key={folder.id} className='mb-1'>
                  {/* 폴더 헤더 */}
                  <div className='flex items-center justify-between group hover:bg-stone-100 dark:hover:bg-stone-800 rounded-md px-2 py-1'>
                    <button
                      onClick={() => toggleFolder(folder.id)}
                      className='flex items-center space-x-2 flex-1 text-left'>
                      {isExpanded ? (
                        <ChevronDown className='h-4 w-4 text-stone-500 dark:text-stone-400' />
                      ) : (
                        <ChevronRight className='h-4 w-4 text-stone-500 dark:text-stone-400' />
                      )}
                      <Folder className='h-4 w-4 text-stone-700 dark:text-stone-300' />
                      <span className='text-sm font-medium text-stone-900 dark:text-stone-100'>
                        {folder.name}
                      </span>
                    </button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant='ghost'
                          size='sm'
                          className='opacity-0 group-hover:opacity-100 transition-opacity p-1 h-6 w-6'>
                          <MoreHorizontal className='h-3 w-3' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end'>
                        <DropdownMenuItem
                          onClick={() => handleAction('폴더명 수정')}>
                          폴더명 수정
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleAction('폴더 삭제')}>
                          <Trash2 className='h-4 w-4 mr-2' />
                          폴더 삭제
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* 폴더 내 문서들 */}
                  {isExpanded && (
                    <div className='ml-6 mt-1 space-y-1'>
                      {folder.documents.map((doc) => (
                        <div
                          key={doc.id}
                          className='flex items-center justify-between group hover:bg-stone-100 dark:hover:bg-stone-800 rounded-md px-2 py-1 cursor-pointer'
                          onClick={() => handleDocumentClick(doc.id)}>
                          <div className='flex items-center space-x-2'>
                            <FileText className='h-4 w-4 text-stone-600 dark:text-stone-400' />
                            <span className='text-sm text-stone-700 dark:text-stone-300'>
                              {doc.title}
                            </span>
                          </div>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant='ghost'
                                size='sm'
                                className='opacity-0 group-hover:opacity-100 transition-opacity p-1 h-6 w-6'
                                onClick={(e) => e.stopPropagation()}>
                                <MoreHorizontal className='h-3 w-3' />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align='end'>
                              <DropdownMenuItem
                                onClick={() => handleAction('문서 수정')}>
                                문서 수정
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleAction('문서 삭제')}>
                                <Trash2 className='h-4 w-4 mr-2' />
                                문서 삭제
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>

        <Separator />

        {/* 사용자 프로필 */}
        <div className='p-3'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' className='w-full justify-start p-2'>
                <div className='flex items-center space-x-3'>
                  <div className='w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center'>
                    <span className='text-white font-semibold text-sm'>
                      {HARDCODED_DATA.user.avatar}
                    </span>
                  </div>
                  <div className='flex-1 text-left'>
                    <div className='text-sm font-medium text-gray-900'>
                      {HARDCODED_DATA.user.name}
                    </div>
                    <div className='text-xs text-gray-500'>
                      {HARDCODED_DATA.user.email}
                    </div>
                  </div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-56'>
              <DropdownMenuItem onClick={() => handleAction('프로필')}>
                <User className='h-4 w-4 mr-2' />
                프로필
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAction('설정')}>
                <Settings className='h-4 w-4 mr-2' />
                설정
              </DropdownMenuItem>
              <Separator />
              <DropdownMenuItem onClick={() => handleAction('로그아웃')}>
                로그아웃
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </aside>
  );
}
