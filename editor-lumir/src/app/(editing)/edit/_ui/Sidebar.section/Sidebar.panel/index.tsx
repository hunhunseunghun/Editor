'use client';

import React, { useState, useEffect } from 'react';
import { useSidebar } from '@/app/(editing)/edit/_context/SidebarContext';
import UserInfoModule from './UserInfo.module/index';
import TreeViewModule from './TreeView.module/index';
import ActionsModule from './Actions.module/index';

const SidebarPanel = React.memo(function SidebarPanel() {
  const { documents, folders, user } = useSidebar();

  console.log('📋 SidebarPanel에서 받은 데이터:', {
    documentsCount: documents?.length || 0,
    foldersCount: folders?.length || 0,
    userEmail: user?.email,
    documentsData: documents,
    foldersData: folders,
  });

  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 모바일에서는 기본적으로 사이드바 최소화
  useEffect(() => {
    if (isMobile) {
      setIsSidebarMinimized(true);
    }
  }, [isMobile]);

  // 키보드 단축키 추가 (Ctrl+B로 사이드바 토글)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'b') {
        event.preventDefault();
        setIsSidebarMinimized((prev) => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleSidebar = () => setIsSidebarMinimized((prev) => !prev);

  return (
    <aside
      className='group/sidebar w-full h-full overflow-y-auto bg-stone-50 p-1 dark:bg-stone-900 max-w-full relative'
      data-sidebar-container>
      <div className='flex flex-col h-full'>
        <UserInfoModule user={user} isMinimized={isSidebarMinimized} />

        <ActionsModule toggleSidebar={toggleSidebar} />

        <TreeViewModule documents={documents || []} folders={folders || []} />
      </div>
    </aside>
  );
});

export default SidebarPanel;
