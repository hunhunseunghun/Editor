"use client";

import React from "react";
import dynamic from "next/dynamic";
import type { DefaultPartialBlock } from "@kingdoo/editor";

// CSS는 globals.css에서 처리

// SSR 비활성화하여 LumirEditor를 동적으로 로드
const LumirEditor = dynamic(
  () => import("@kingdoo/editor").then((m) => m.LumirEditor),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">에디터 로딩 중...</div>
      </div>
    ),
  }
);

// 하드코딩된 에디터 컨텐츠 (올바른 블록 형태)
const HARDCODED_CONTENT: DefaultPartialBlock[] = [
  {
    type: "paragraph",
    props: {
      textColor: "default",
      backgroundColor: "default",
      textAlignment: "left",
    },
    content: [
      {
        type: "text",
        text: "This is a test document for the Lumir Editor component.",
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
      "Content changed: Block content updated",
      newContent.length,
      "blocks"
    );
  };

  return (
    <div className="w-[400px] h-[100px] p-0">
      <LumirEditor sideMenuAddButton={false} />
    </div>
  );
}
