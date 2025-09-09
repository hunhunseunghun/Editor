'use client';

import { EditProvider } from './_context/EditContext';
import { SidebarProvider } from './_context/SidebarContext';
import { DocumentHeaderProvider } from './_context/DocumentHeaderContext';
import { DocumentContentProvider } from './_context/DocumentContentContext';
import SidebarPanel from './_ui/Sidebar.section/Sidebar.panel';
import DocumentHeaderPanel from './_ui/DocumentHeader.section/DocumentHeader.panel';

function EditingLayoutContent({ children }: { children: React.ReactNode }) {
  return (
    <div className='bg-background text-foreground w-full h-full'>
      <div className='relative flex h-screen overflow-hidden'>
        {/* 사이드바 */}
        <div className='w-64 transition-all duration-300'>
          <SidebarPanel />
        </div>

        {/* 메인 콘텐츠 영역 */}
        <div className='flex-1 flex flex-col min-w-0'>
          <DocumentHeaderPanel />
          {children}
        </div>
      </div>
    </div>
  );
}

export default function EditingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <EditProvider>
      <SidebarProvider>
        <DocumentHeaderProvider>
          <DocumentContentProvider>
            <EditingLayoutContent>{children}</EditingLayoutContent>
          </DocumentContentProvider>
        </DocumentHeaderProvider>
      </SidebarProvider>
    </EditProvider>
  );
}
