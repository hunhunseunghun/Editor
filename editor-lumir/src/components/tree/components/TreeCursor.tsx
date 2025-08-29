'use client';

import React from 'react';

// ===== 커스텀 커서 컴포넌트 - 드롭 위치 표시 =====
export const TreeCursor: React.FC<{
  top: number;
  left: number;
  indent: number;
}> = ({ top, left, indent }) => {
  return (
    <div
      className='absolute top-0 h-[2px] w-full bg-[#2383E2]/30 pointer-events-none z-50'
      style={{
        left: left + indent,
        top: top - 1,
        width: 'calc(100% - 24px)',
        maxWidth: '200px',
      }}
    />
  );
};

// 기본 export 유지
export default TreeCursor;
