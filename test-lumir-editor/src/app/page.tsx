"use client";

import React from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import EditorArea from "@/components/EditorArea";

export default function Home() {
  return (
    <div className="h-screen bg-stone-50 dark:bg-stone-900 flex overflow-hidden">
      {/* 사이드바 - 고정 너비 */}
      <div className="w-55 flex-shrink-0 border-r border-stone-200 dark:border-stone-700">
        <Sidebar />
      </div>

      {/* 메인 콘텐츠 영역 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 헤더 */}
        <div className="h-16 flex-shrink-0 border-b border-stone-200 dark:border-stone-700">
          <Header />
        </div>

        {/* 에디터 영역 */}
        <div className="flex-1 overflow-hidden">
          <div className="flex justify-center items-center w-full h-full">
            <EditorArea />
          </div>
        </div>
      </div>
    </div>
  );
}
