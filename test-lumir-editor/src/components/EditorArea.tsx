'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import type { DefaultPartialBlock } from '@lumir-company/editor';

// CSS는 globals.css에서 처리

// SSR 비활성화하여 LumirEditor를 동적으로 로드
const LumirEditor = dynamic(
  () => import('@lumir-company/editor').then((m) => m.LumirEditor),
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

  // BlockNote 공식 Theme 객체들
  const redTheme = {
    colors: {
      editor: { text: '#dc2626', background: '#fef2f2' },
      menu: { text: '#991b1b', background: '#ffffff' },
      tooltip: { text: '#7f1d1d', background: '#fee2e2' },
      hovered: { text: '#b91c1c', background: '#fecaca' },
      selected: { text: '#ffffff', background: '#dc2626' },
      disabled: { text: '#9ca3af', background: '#f3f4f6' },
      shadow: '#ef4444',
      border: '#fca5a5',
      sideMenu: '#dc2626',
    },
    borderRadius: 12,
    fontFamily: 'Pretendard, system-ui, sans-serif',
  };

  const blueTheme = {
    colors: {
      editor: { text: '#1e40af', background: '#eff6ff' },
      menu: { text: '#1d4ed8', background: '#ffffff' },
      tooltip: { text: '#1e3a8a', background: '#dbeafe' },
      hovered: { text: '#2563eb', background: '#bfdbfe' },
      selected: { text: '#ffffff', background: '#3b82f6' },
      disabled: { text: '#9ca3af', background: '#f3f4f6' },
      shadow: '#3b82f6',
      border: '#93c5fd',
      sideMenu: '#2563eb',
    },
    borderRadius: 8,
    fontFamily: 'Pretendard, Inter, sans-serif',
  };

  const greenTheme = {
    colors: {
      editor: { text: '#166534', background: '#f0fdf4' },
      menu: { text: '#15803d', background: '#ffffff' },
      tooltip: { text: '#14532d', background: '#dcfce7' },
      hovered: { text: '#16a34a', background: '#bbf7d0' },
      selected: { text: '#ffffff', background: '#22c55e' },
      disabled: { text: '#9ca3af', background: '#f3f4f6' },
      shadow: '#22c55e',
      border: '#86efac',
      sideMenu: '#16a34a',
    },
    borderRadius: 16,
    fontFamily: 'Pretendard, Georgia, serif',
  };

  const darkTheme = {
    colors: {
      editor: { text: '#f8fafc', background: '#0f172a' },
      menu: { text: '#e2e8f0', background: '#1e293b' },
      tooltip: { text: '#cbd5e1', background: '#334155' },
      hovered: { text: '#f1f5f9', background: '#475569' },
      selected: { text: '#0f172a', background: '#e2e8f0' },
      disabled: { text: '#64748b', background: '#374151' },
      shadow: '#000000',
      border: '#475569',
      sideMenu: '#64748b',
    },
    borderRadius: 10,
    fontFamily: 'Pretendard, monospace',
  };

  const lightDarkTheme = {
    light: {
      colors: {
        editor: { text: '#374151', background: '#ffffff' },
        menu: { text: '#111827', background: '#f9fafb' },
        tooltip: { text: '#4b5563', background: '#f3f4f6' },
        hovered: { text: '#1f2937', background: '#e5e7eb' },
        selected: { text: '#ffffff', background: '#6366f1' },
      },
      borderRadius: 6,
      fontFamily: 'Pretendard, sans-serif',
    },
    dark: {
      colors: {
        editor: { text: '#f9fafb', background: '#111827' },
        menu: { text: '#e5e7eb', background: '#1f2937' },
        tooltip: { text: '#d1d5db', background: '#374151' },
        hovered: { text: '#f3f4f6', background: '#4b5563' },
        selected: { text: '#111827', background: '#a78bfa' },
      },
      borderRadius: 8,
      fontFamily: 'Pretendard, sans-serif',
    },
  };

  return (
    <div className='space-y-4 p-4'>
      {/* 기본 스타일 */}
      <div className='w-[500px] h-[180px]'>
        <h3 className='text-sm font-medium mb-2'>
          기본 스타일 기본 theme="light"
        </h3>
        <LumirEditor theme='light' />
      </div>
    </div>
  );
}
