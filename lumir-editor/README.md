# LumirEditor

간소화된 BlockNote 기반 Rich Text 에디터 React 컴포넌트

## ✨ 주요 특징

- 🚀 **간단한 API**: 핵심 기능만 포함한 미니멀한 인터페이스
- 🎨 **Tailwind CSS 완벽 지원**: className props로 자유로운 스타일링
- 🔧 **TypeScript 지원**: 완전한 타입 안전성
- 📝 **Pretendard 폰트**: 기본 폰트로 Pretendard 최우선 적용
- ⚡ **경량화**: 불필요한 기능 제거로 빠른 로딩

## 📦 설치 및 초기 세팅

### 1. 패키지 설치

```bash
npm install @lumir-company/editor
# 또는
yarn add @lumir-company/editor
# 또는
pnpm add @lumir-company/editor
```

### 2. 필수 CSS 임포트

```tsx
// App.tsx 또는 globals.css에서
import '@lumir-company/editor/style.css';
```

### 3. Next.js 설정 (SSR 사용 시)

```tsx
'use client';
import dynamic from 'next/dynamic';

const LumirEditor = dynamic(
  () => import('@lumir-company/editor').then((m) => m.LumirEditor),
  { ssr: false },
);
```

## 🚀 사용법

### 기본 사용법

```tsx
import { LumirEditor } from '@lumir-company/editor';
import '@lumir-company/editor/style.css';

export default function App() {
  return (
    <LumirEditor
      initialContent='에디터에 오신 것을 환영합니다!'
      className='min-h-[400px] rounded-lg border'
      onContentChange={(blocks) => {
        console.log('변경된 내용:', blocks);
      }}
    />
  );
}
```

### Tailwind CSS 스타일링

```tsx
<LumirEditor
  className='
    min-h-[500px] max-w-4xl mx-auto
    rounded-xl border border-gray-200 shadow-lg
    bg-white dark:bg-gray-900
    focus-within:ring-2 focus-within:ring-blue-500
  '
  theme='light'
  onContentChange={(blocks) => saveDocument(blocks)}
/>
```

### Next.js에서 사용

```tsx
'use client';
import dynamic from 'next/dynamic';

const LumirEditor = dynamic(
  () => import('@lumir-company/editor').then((m) => m.LumirEditor),
  { ssr: false },
);

export default function EditorPage() {
  return (
    <div className='container mx-auto p-4'>
      <LumirEditor
        initialContent={[
          {
            type: 'paragraph',
            content: [{ type: 'text', text: '안녕하세요!' }],
          },
        ]}
        className='min-h-[400px] rounded-lg border'
        onContentChange={(blocks) => saveDocument(blocks)}
      />
    </div>
  );
}
```

## 📚 Props API

### 핵심 Props

| Prop                 | 타입                                       | 기본값    | 설명                |
| -------------------- | ------------------------------------------ | --------- | ------------------- |
| `initialContent`     | `DefaultPartialBlock[] \| string`          | -         | 초기 콘텐츠         |
| `initialEmptyBlocks` | `number`                                   | `3`       | 초기 빈 블록 개수   |
| `className`          | `string`                                   | `""`      | Tailwind CSS 클래스 |
| `editable`           | `boolean`                                  | `true`    | 편집 가능 여부      |
| `theme`              | `"light" \| "dark" \| any`                 | `"light"` | 에디터 테마         |
| `onContentChange`    | `(content: DefaultPartialBlock[]) => void` | -         | 콘텐츠 변경 콜백    |
| `onSelectionChange`  | `() => void`                               | -         | 선택 영역 변경 콜백 |

### UI 컴포넌트 제어

| Prop                | 타입      | 기본값  | 설명             |
| ------------------- | --------- | ------- | ---------------- |
| `formattingToolbar` | `boolean` | `true`  | 서식 툴바 표시   |
| `linkToolbar`       | `boolean` | `true`  | 링크 툴바 표시   |
| `sideMenu`          | `boolean` | `true`  | 사이드 메뉴 표시 |
| `slashMenu`         | `boolean` | `true`  | 슬래시 메뉴 표시 |
| `emojiPicker`       | `boolean` | `true`  | 이모지 피커 표시 |
| `filePanel`         | `boolean` | `true`  | 파일 패널 표시   |
| `tableHandles`      | `boolean` | `true`  | 표 핸들 표시     |
| `sideMenuAddButton` | `boolean` | `false` | Add 버튼 표시    |

### 사용 예시

```tsx
// 기본 사용
<LumirEditor
  initialContent="시작 텍스트"
  className="min-h-[400px] border rounded-lg"
/>

// 커스텀 설정
<LumirEditor
  initialContent={savedContent}
  theme="dark"
  className="max-w-4xl mx-auto shadow-lg"
  sideMenuAddButton={true}
  onContentChange={(blocks) => saveToServer(blocks)}
/>
```

## 🎨 스타일링 가이드

### 기본 스타일링

```tsx
// 기본 스타일 포함 (권장)
<LumirEditor className="min-h-[400px] border rounded-lg" />

// 커스텀 스타일링
<LumirEditor
  className="
    min-h-[500px] max-w-4xl mx-auto
    rounded-xl border border-gray-200 shadow-lg
    bg-white dark:bg-gray-900
  "
/>
```

### 반응형 디자인

```tsx
<LumirEditor
  className='
    h-64 md:h-96 lg:h-[500px]
    text-sm md:text-base
    p-2 md:p-4 lg:p-6
    rounded-md md:rounded-lg lg:rounded-xl
  '
/>
```

### 테마별 스타일링

```tsx
// 라이트 모드
<LumirEditor
  theme="light"
  className="bg-white text-gray-900 border-gray-200"
/>

// 다크 모드
<LumirEditor
  theme="dark"
  className="bg-gray-900 text-white border-gray-700"
/>
```

## 📖 타입 정의

```tsx
import type {
  LumirEditorProps,
  DefaultPartialBlock,
  EditorType,
} from '@lumir-company/editor';

function MyEditor() {
  const handleContentChange = (content: DefaultPartialBlock[]) => {
    console.log('변경된 블록:', content);
    saveToDatabase(JSON.stringify(content));
  };

  return <LumirEditor onContentChange={handleContentChange} />;
}
```

## ⚠️ 주의사항

### SSR 환경 (Next.js)

```tsx
// ✅ 올바른 방법
const LumirEditor = dynamic(
  () => import('@lumir-company/editor').then((m) => m.LumirEditor),
  { ssr: false },
);

// ❌ 잘못된 방법 - SSR 오류 발생
import { LumirEditor } from '@lumir-company/editor';
```

### CSS 스타일이 적용되지 않는 경우

```tsx
// CSS 파일을 반드시 임포트
import '@lumir-company/editor/style.css';
```

## 📋 변경 기록

### v0.2.0 (최신)

- ✨ **간소화된 API**: 핵심 기능만 포함한 미니멀한 인터페이스
- 🎨 **Pretendard 폰트**: 기본 폰트로 Pretendard 최우선 적용 (14px 문단 크기)
- 🚀 **경량화**: 불필요한 기능 제거로 빠른 로딩
- 💨 **Tailwind CSS 완벽 지원**: className props로 자유로운 스타일링

## 📄 라이선스

MIT License - BlockNote 라이선스를 따릅니다.
