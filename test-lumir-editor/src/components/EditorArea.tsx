'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import type { DefaultPartialBlock } from '@kingdoo/editor';

// CSS는 globals.css에서 처리

// SSR 비활성화하여 LumirEditor를 동적으로 로드
const LumirEditor = dynamic(
  () => import('@kingdoo/editor').then((m) => m.LumirEditor),
  {
    ssr: false,
    loading: () => (
      <div className='flex items-center justify-center h-full'>
        <div className='text-gray-500'>에디터 로딩 중...</div>
      </div>
    ),
  },
);

// 하드코딩된 에디터 컨텐츠 (올바른 블록 형태)
const HARDCODED_CONTENT: DefaultPartialBlock[] = [
  {
    type: 'image',
    props: {
      url: '/h_logo.png',
      name: 'h_logo.png',
    },
  },
  {
    type: 'paragraph',
    props: {
      textColor: 'default',
      backgroundColor: 'default',
      textAlignment: 'left',
    },
    content: [
      {
        type: 'text',
        text: 'This is a test document for the Lumir Editor component.',
        styles: {},
      },
    ],
    children: [],
  },
  {
    type: 'paragraph',
    props: {
      textColor: 'default',
      backgroundColor: 'default',
      textAlignment: 'left',
    },
    content: [
      {
        type: 'text',
        text: 'Feel free to start editing and experimenting with the editor!',
        styles: {},
      },
    ],
    children: [],
  },
];

interface EditorAreaProps {
  className?: string;
}

export default function EditorArea({ className }: EditorAreaProps) {
  const [content, setContent] =
    React.useState<DefaultPartialBlock[]>(HARDCODED_CONTENT);

  const handleContentChange = (newContent: DefaultPartialBlock[]) => {
    setContent(newContent);
    console.log(
      'Content changed: Block content updated',
      newContent.length,
      'blocks',
    );
  };

  return (
    <div className={`h-full bg-white dark:bg-stone-900 ${className}`}>
      <div className='h-full p-6 overflow-auto'>
        <div className='max-w-4xl mx-auto h-full'>
          <LumirEditor
            initialContent={content}
            onContentChange={handleContentChange}
            className='h-full min-h-[400px] rounded-lg'
            theme='light'
            formattingToolbar={true}
            linkToolbar={true}
            sideMenu={true}
            slashMenu={true}
            emojiPicker={true}
            filePanel={true}
            tableHandles={true}
            comments={true}
            includeDefaultStyles={true}
          />
        </div>
      </div>
    </div>
  );
}
