'use client';

import { useState, useEffect, useRef } from 'react';
import { Spinner } from '@/components/ui';

interface DocumentTitleProps {
  title: string;
  onTitleChange: (title: string) => void;
  isLocked?: boolean;
  isLoading?: boolean;
}

export default function DocumentTitle({
  title,
  onTitleChange,
  isLocked = false,
  isLoading = false,
}: DocumentTitleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (title !== undefined && title !== null) {
      setEditTitle(title);
    }
  }, [title]);

  // 제목이 변경될 때 편집 모드 해제
  useEffect(() => {
    if (!isEditing) {
      setIsEditing(false);
    }
  }, [title, isEditing]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      // requestAnimationFrame을 사용하여 DOM 업데이트 후 커서 위치 설정
      requestAnimationFrame(() => {
        if (inputRef.current) {
          const length = inputRef.current.value.length;
          inputRef.current.setSelectionRange(length, length);
        }
      });
    }
  }, [isEditing]);

  const handleSubmit = () => {
    const trimmedTitle = editTitle.trim();
    if (trimmedTitle !== title) {
      onTitleChange(trimmedTitle || 'Untitled');
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      setEditTitle(title);
      setIsEditing(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 50) {
      setEditTitle(value);
    }
  };

  const handleClick = () => {
    if (!isLocked && !isLoading) {
      setIsEditing(true);
    }
  };

  // 로딩 중이거나 title이 아직 로드되지 않은 경우
  if (isLoading || title === undefined || title === null) {
    return (
      <div className='mb-8 px-2 py-1 -mx-2 h-16 flex items-center'>
        <Spinner size='sm' />
      </div>
    );
  }

  if (isLocked) {
    return (
      <div className='mb-8 px-2 py-1 -mx-2 h-16 flex items-center select-text'>
        <h1 className='text-4xl font-bold text-gray-900 leading-tight'>
          {title || 'Untitled'}
        </h1>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className='mb-8 px-2 py-1 -mx-2 h-16 flex items-center'>
        <input
          ref={inputRef}
          type='text'
          value={editTitle}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={handleSubmit}
          className='text-4xl font-bold text-gray-900 bg-transparent border-none outline-none w-full leading-tight'
          maxLength={50}
        />
      </div>
    );
  }

  return (
    <div className='mb-8 px-2 py-1 -mx-2 h-16 flex items-center'>
      <h1
        className='text-4xl font-bold text-gray-900 cursor-text leading-tight'
        onClick={handleClick}
        tabIndex={0}>
        {title || 'Untitled'}
      </h1>
    </div>
  );
}
