'use client';

import React from 'react';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  MoreHorizontal,
  Share2,
  Lock,
  Unlock,
  Star,
  History,
  Download,
  Copy,
  Trash2,
} from 'lucide-react';

// 하드코딩된 문서 데이터
const HARDCODED_DOCUMENT = {
  title: 'Lumir Editor',
  isLocked: false,
  isStarred: false,
  lastModified: '2025. 9. 9. 오후 5:10:00',
  author: 'Lumir User',
};

interface HeaderProps {
  className?: string;
}

export default function Header({ className }: HeaderProps) {
  const [document] = React.useState(HARDCODED_DOCUMENT);
  const [isLocked, setIsLocked] = React.useState(document.isLocked);
  const [isStarred, setIsStarred] = React.useState(document.isStarred);

  const handleAction = (action: string) => {
    console.log('Header action:', action);

    switch (action) {
      case 'lock':
        setIsLocked(!isLocked);
        alert(`문서가 ${!isLocked ? '잠금' : '잠금 해제'}되었습니다.`);
        break;
      case 'star':
        setIsStarred(!isStarred);
        alert(
          `문서가 ${
            !isStarred ? '즐겨찾기에 추가' : '즐겨찾기에서 제거'
          }되었습니다.`,
        );
        break;
      default:
        alert(`${action} 기능은 데모용으로 비활성화되어 있습니다.`);
    }
  };

  return (
    <div className={`h-full bg-white dark:bg-stone-900 ${className}`}>
      <div className='h-full px-6 flex items-center justify-between w-full'>
        {/* 문서 제목 및 정보 */}
        <div className='flex items-center space-x-4 flex-1'>
          <div className='flex items-center space-x-3'>
            <h1 className='text-sm font-semibold text-gray-900'>
              {document.title}
            </h1>

            {/* 문서 상태 표시 */}
            <div className='flex items-center space-x-2'>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => handleAction('lock')}
                className={`p-1 h-6 w-6 ${
                  isLocked ? 'text-red-600' : 'text-gray-400'
                }`}>
                {isLocked ? (
                  <Lock className='h-4 w-4' />
                ) : (
                  <Unlock className='h-4 w-4' />
                )}
              </Button>

              <Button
                variant='ghost'
                size='sm'
                onClick={() => handleAction('star')}
                className={`p-1 h-6 w-6 ${
                  isStarred ? 'text-yellow-500' : 'text-gray-400'
                }`}>
                <Star
                  className={`h-4 w-4 ${isStarred ? 'fill-current' : ''}`}
                />
              </Button>
            </div>
          </div>

          {/* 문서 메타 정보 */}
          <div className='hidden md:flex items-center space-x-4 text-sm text-gray-500'>
            <span>작성자: {document.author}</span>
            <Separator orientation='vertical' className='h-4' />
            <span>최종 수정: {document.lastModified}</span>
          </div>
        </div>

        {/* 액션 버튼들 */}
        <div className='flex items-center space-x-2'>
          {/* 공유 버튼 */}
          <Button
            variant='outline'
            size='sm'
            onClick={() => handleAction('공유')}
            className='hidden sm:flex'>
            <Share2 className='h-4 w-4 mr-2' />
            공유
          </Button>

          {/* 더보기 메뉴 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='outline' size='sm'>
                <MoreHorizontal className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-48'>
              <DropdownMenuItem onClick={() => handleAction('공유')}>
                <Share2 className='h-4 w-4 mr-2' />
                공유
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => handleAction('복사')}>
                <Copy className='h-4 w-4 mr-2' />
                링크 복사
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => handleAction('다운로드')}>
                <Download className='h-4 w-4 mr-2' />
                다운로드
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => handleAction('버전 히스토리')}>
                <History className='h-4 w-4 mr-2' />
                버전 히스토리
              </DropdownMenuItem>

              <Separator />

              <DropdownMenuItem onClick={() => handleAction('휴지통으로 이동')}>
                <Trash2 className='h-4 w-4 mr-2' />
                휴지통으로 이동
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
