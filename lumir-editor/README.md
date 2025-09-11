# LumirEditor

이미지 전용 BlockNote 기반 Rich Text 에디터 React 컴포넌트

## ✨ 주요 특징

- 🖼️ **이미지 전용 에디터**: 이미지 업로드/드래그앤드롭만 지원 (Base64 변환)
- 🚀 **간소화된 API**: 핵심 기능만 포함한 미니멀한 인터페이스
- 🎨 **BlockNote Theme 지원**: 공식 theme prop으로 에디터 스타일링
- 🔧 **TypeScript 지원**: 완전한 타입 안전성
- 📝 **Pretendard 폰트**: 기본 폰트로 Pretendard 최우선 적용 (14px)
- ⚡ **경량화**: 비디오/오디오/파일 업로드 기능 제거로 빠른 로딩

## 📦 설치

```bash
npm install @lumir-company/editor
```

## 🚀 기본 사용법

### 1. CSS 임포트 (필수)

```tsx
import '@lumir-company/editor/style.css';
```

### 2. 기본 사용

```tsx
import { LumirEditor } from '@lumir-company/editor';
import '@lumir-company/editor/style.css';

export default function App() {
  return (
    <div className='w-full h-[400px]'>
      <LumirEditor onContentChange={(blocks) => console.log(blocks)} />
    </div>
  );
}
```

### 3. Next.js에서 사용 (SSR 비활성화)

```tsx
'use client';
import dynamic from 'next/dynamic';

const LumirEditor = dynamic(
  () => import('@lumir-company/editor').then((m) => m.LumirEditor),
  { ssr: false },
);

export default function Editor() {
  return (
    <div className='w-full h-[500px]'>
      <LumirEditor />
    </div>
  );
}
```

## 📚 핵심 Props

| Prop                | 타입                               | 기본값    | 설명             |
| ------------------- | ---------------------------------- | --------- | ---------------- |
| `initialContent`    | `DefaultPartialBlock[] \| string`  | -         | 초기 콘텐츠      |
| `className`         | `string`                           | `""`      | CSS 클래스       |
| `theme`             | `"light" \| "dark" \| ThemeObject` | `"light"` | 에디터 테마      |
| `onContentChange`   | `(blocks) => void`                 | -         | 콘텐츠 변경 콜백 |
| `editable`          | `boolean`                          | `true`    | 편집 가능 여부   |
| `sideMenuAddButton` | `boolean`                          | `false`   | Add 버튼 표시    |

### 고급 Props

| Prop                  | 타입                              | 기본값 | 설명                 |
| --------------------- | --------------------------------- | ------ | -------------------- |
| `uploadFile`          | `(file: File) => Promise<string>` | -      | 커스텀 이미지 업로더 |
| `storeImagesAsBase64` | `boolean`                         | `true` | Base64 저장 여부     |
| `formattingToolbar`   | `boolean`                         | `true` | 서식 툴바 표시       |
| `linkToolbar`         | `boolean`                         | `true` | 링크 툴바 표시       |
| `sideMenu`            | `boolean`                         | `true` | 사이드 메뉴 표시     |
| `slashMenu`           | `boolean`                         | `true` | 슬래시 메뉴 표시     |
| `emojiPicker`         | `boolean`                         | `true` | 이모지 피커 표시     |
| `filePanel`           | `boolean`                         | `true` | 파일 패널 표시       |
| `tableHandles`        | `boolean`                         | `true` | 표 핸들 표시         |
| `tables`              | `TableConfig`                     | -      | 테이블 설정          |
| `heading`             | `HeadingConfig`                   | -      | 헤딩 설정            |
| `animations`          | `boolean`                         | `true` | 애니메이션 활성화    |
| `defaultStyles`       | `boolean`                         | `true` | 기본 스타일 적용     |

### Props 사용 예시

```tsx
import { LumirEditor } from '@lumir-company/editor';

// 1. 초기 콘텐츠 설정
<LumirEditor
  initialContent="에디터 시작 텍스트"
/>

// 2. 블록 배열로 초기 콘텐츠 설정
<LumirEditor
  initialContent={[
    {
      type: 'paragraph',
      content: [{ type: 'text', text: '안녕하세요!' }]
    },
    {
      type: 'heading',
      props: { level: 2 },
      content: [{ type: 'text', text: '제목입니다' }]
    }
  ]}
/>

// 3. 이벤트 핸들러 사용
<LumirEditor
  onContentChange={(blocks) => {
    console.log('변경된 콘텐츠:', blocks);
    saveToDatabase(blocks);
  }}
  onSelectionChange={() => {
    console.log('선택 영역이 변경되었습니다');
  }}
/>

// 4. UI 컴포넌트 제어
<LumirEditor
  sideMenuAddButton={true}      // Add 버튼 표시
  formattingToolbar={false}     // 서식 툴바 숨김
  linkToolbar={false}           // 링크 툴바 숨김
  slashMenu={false}             // 슬래시 메뉴 숨김
  emojiPicker={false}           // 이모지 피커 숨김
/>

// 5. 읽기 전용 모드
<LumirEditor
  editable={false}
  initialContent={savedContent}
  formattingToolbar={false}
  sideMenu={false}
/>

// 6. 커스텀 이미지 업로더
<LumirEditor
  uploadFile={async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });
    return (await response.json()).url;
  }}
  storeImagesAsBase64={false}
/>

// 7. 테이블과 헤딩 설정
<LumirEditor
  tables={{
    splitCells: true,
    cellBackgroundColor: true,
    cellTextColor: true,
    headers: true
  }}
  heading={{
    levels: [1, 2, 3, 4] // H1~H4만 허용
  }}
/>

// 8. 애니메이션과 스타일 제어
<LumirEditor
  animations={false}        // 애니메이션 비활성화
  defaultStyles={true}      // 기본 스타일 사용
/>

// 9. 완전한 설정 예시
<LumirEditor
  initialContent="시작 텍스트"
  className="min-h-[400px] border rounded-lg"
  theme="light"
  editable={true}
  sideMenuAddButton={true}
  formattingToolbar={true}
  linkToolbar={true}
  slashMenu={true}
  emojiPicker={true}
  onContentChange={(blocks) => console.log(blocks)}
  onSelectionChange={() => console.log('선택 변경')}
  uploadFile={customUploader}
  storeImagesAsBase64={false}
/>
```

## 🎨 Theme 스타일링

### 기본 테마

```tsx
// 라이트 모드
<LumirEditor theme="light" />

// 다크 모드
<LumirEditor theme="dark" />
```

### 커스텀 테마 (권장)

```tsx
const customTheme = {
  colors: {
    editor: {
      text: '#1f2937',
      background: '#ffffff',
    },
    menu: {
      text: '#374151',
      background: '#f9fafb',
    },
    tooltip: {
      text: '#6b7280',
      background: '#f3f4f6',
    },
    hovered: {
      text: '#111827',
      background: '#e5e7eb',
    },
    selected: {
      text: '#ffffff',
      background: '#3b82f6',
    },
    disabled: {
      text: '#9ca3af',
      background: '#f3f4f6',
    },
    shadow: '#000000',
    border: '#d1d5db',
    sideMenu: '#6b7280',
  },
  borderRadius: 8,
  fontFamily: 'Pretendard, system-ui, sans-serif',
};

<LumirEditor theme={customTheme} />;
```

### 라이트/다크 모드 조장장

```tsx
const dualTheme = {
  light: {
    colors: {
      editor: { text: '#374151', background: '#ffffff' },
      menu: { text: '#111827', background: '#f9fafb' },
    },
  },
  dark: {
    colors: {
      editor: { text: '#f9fafb', background: '#111827' },
      menu: { text: '#e5e7eb', background: '#1f2937' },
    },
  },
};

<LumirEditor theme={dualTheme} />;
```

## 🖼️ 이미지 업로드

### 자동 Base64 변환

```tsx
// 기본적으로 이미지가 Base64로 자동 변환됩니다
<LumirEditor
  onContentChange={(blocks) => {
    // 이미지가 포함된 블록들을 확인
    const hasImages = blocks.some((block) =>
      block.content?.some((content) => content.type === 'image'),
    );
    if (hasImages) {
      console.log('이미지가 포함된 콘텐츠:', blocks);
    }
  }}
/>
```

## 📖 타입 정의

```tsx
import type {
  LumirEditorProps,
  DefaultPartialBlock,
  ContentUtils,
  EditorConfig,
} from '@lumir-company/editor';

// 콘텐츠 검증
const isValidContent = ContentUtils.isValidJSONString(jsonString);
const blocks = ContentUtils.parseJSONContent(jsonString);

// 에디터 설정
const tableConfig = EditorConfig.getDefaultTableConfig();
const headingConfig = EditorConfig.getDefaultHeadingConfig();
```

## 💡 사용 팁

### 1. 컨테이너 크기 설정

```tsx
// 고정 높이
<div className='h-[400px]'>
  <LumirEditor />
</div>

// 최소 높이
<div className='min-h-[300px]'>
  <LumirEditor />
</div>
```

### 2. 반응형 디자인

```tsx
<div className='w-full h-64 md:h-96 lg:h-[500px]'>
  <LumirEditor className='h-full' theme='light' />
</div>
```

### 3. 읽기 전용 모드

```tsx
<LumirEditor
  editable={false}
  initialContent={savedContent}
  formattingToolbar={false}
  sideMenu={false}
/>
```

## ⚠️ 중요 사항

### 1. CSS 임포트 필수

```tsx
// 반드시 CSS를 임포트해야 합니다
import '@lumir-company/editor/style.css';
```

### 2. Next.js SSR 비활성화

```tsx
// 서버 사이드 렌더링을 비활성화해야 합니다
const LumirEditor = dynamic(
  () => import('@lumir-company/editor').then((m) => m.LumirEditor),
  { ssr: false },
);
```

### 3. 이미지만 지원

- ✅ 이미지 파일: PNG, JPG, GIF, WebP, BMP, SVG
- ❌ 비디오, 오디오, 일반 파일 업로드 불가
- 🔄 자동 Base64 변환 또는 커스텀 업로더 사용

## 📋 변경 기록

### v0.0.1

- 🎉 **초기 릴리스**: 이미지 전용 BlockNote 에디터
- 🖼️ **이미지 업로드**: Base64 변환 및 드래그앤드롭 지원
- 🎨 **Theme 지원**: BlockNote 공식 theme prop 지원
- 📝 **Pretendard 폰트**: 기본 폰트 설정 (14px)
- 🚫 **미디어 제한**: 비디오/오디오/파일 업로드 비활성화

## 📄 라이선스

MIT License
