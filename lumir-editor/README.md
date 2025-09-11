# LumirEditor

BlockNote 기반의 고급 Rich Text 에디터 React 컴포넌트

## ✨ 주요 특징

- 🚀 **하이브리드 콘텐츠 지원**: JSON 객체 배열 또는 JSON 문자열 모두 지원
- 📷 **이미지 처리**: 업로드/붙여넣기/드래그앤드롭 완벽 지원
- 🎨 **유연한 스타일링**: Tailwind CSS 클래스와 커스텀 CSS 모두 지원
- 📱 **반응형 UI**: 모든 툴바와 메뉴 개별 제어 가능
- 🔧 **TypeScript 완벽 지원**: 모든 타입 정의 포함
- ⚡ **최적화된 성능**: 스마트 렌더링과 메모리 관리

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

에디터가 제대로 작동하려면 반드시 CSS 파일을 임포트해야 합니다:

```tsx
// App.tsx 또는 main.tsx에서
import "@lumir-company/editor/style.css";
```

**또는 개별 CSS 임포트:**

```tsx
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import "@blocknote/react/style.css";
```

### 3. TypeScript 설정 (권장)

`tsconfig.json`에서 모듈 해석 설정:

```json
{
  "compilerOptions": {
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "jsx": "react-jsx",
    "lib": ["dom", "dom.iterable", "es6"]
  }
}
```

### 4. Tailwind CSS 설정 (선택사항)

패키지의 Tailwind 클래스를 사용하려면 `tailwind.config.js`에 추가:

```js
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}", // 기존 경로들
    "./node_modules/@lumir-company/editor/dist/**/*.js", // 패키지 경로 추가
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

### 5. 번들러별 설정

#### Next.js

```tsx
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@lumir-company/editor"],
  experimental: {
    esmExternals: true,
  },
};

module.exports = nextConfig;
```

#### Vite

```ts
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ["@lumir-company/editor"],
  },
});
```

#### Webpack

```js
// webpack.config.js
module.exports = {
  resolve: {
    alias: {
      // BlockNote 관련 폴리필이 필요한 경우
      crypto: "crypto-browserify",
      stream: "stream-browserify",
    },
  },
};
```

## 🚀 사용법

### 기본 사용법

```tsx
import { LumirEditor } from "@lumir-company/editor";
import "@lumir-company/editor/style.css";

export default function App() {
  return (
    <LumirEditor
      initialContent="빈 상태에서 시작"
      onContentChange={(blocks) => {
        console.log("변경된 내용:", blocks);
      }}
    />
  );
}
```

### Next.js에서 사용

```tsx
"use client";
import dynamic from "next/dynamic";

const LumirEditor = dynamic(
  () => import("@lumir-company/editor").then((m) => m.LumirEditor),
  { ssr: false }
);

export default function EditorPage() {
  return (
    <div className="container mx-auto p-4">
      <LumirEditor
        initialContent={[
          {
            type: "paragraph",
            content: [{ type: "text", text: "안녕하세요!" }],
          },
        ]}
        onContentChange={(blocks) => saveDocument(blocks)}
        uploadFile={async (file) => {
          // 파일 업로드 로직
          const url = await uploadToServer(file);
          return url;
        }}
        theme="light"
        className="min-h-[400px] rounded-lg border"
      />
    </div>
  );
}
```

### 고급 설정 예시

```tsx
<LumirEditor
  // 콘텐츠 설정
  initialContent='[{"type":"paragraph","content":[{"type":"text","text":"JSON 문자열도 지원"}]}]'
  placeholder="여기에 내용을 입력하세요..."
  initialEmptyBlocks={5}
  // 파일 업로드
  uploadFile={async (file) => await uploadToS3(file)}
  storeImagesAsBase64={false}
  allowVideoUpload={true}
  allowAudioUpload={true}
  // UI 커스터마이징
  theme="dark"
  formattingToolbar={true}
  sideMenuAddButton={false} // Add 버튼 숨기고 드래그만
  className="min-h-[600px] rounded-xl shadow-lg"
  // 이벤트 핸들러
  onContentChange={(blocks) => {
    autoSave(JSON.stringify(blocks));
  }}
  onSelectionChange={() => updateToolbar()}
/>
```

## 📚 Props API

### 📝 콘텐츠 관련

| Prop                 | 타입                                       | 기본값      | 설명                                          |
| -------------------- | ------------------------------------------ | ----------- | --------------------------------------------- |
| `initialContent`     | `DefaultPartialBlock[] \| string`          | `undefined` | 초기 콘텐츠 (JSON 객체 배열 또는 JSON 문자열) |
| `initialEmptyBlocks` | `number`                                   | `3`         | 초기 빈 블록 개수                             |
| `placeholder`        | `string`                                   | `undefined` | 첫 번째 블록의 placeholder 텍스트             |
| `onContentChange`    | `(content: DefaultPartialBlock[]) => void` | `undefined` | 콘텐츠 변경 시 호출되는 콜백                  |

#### 사용 예시:

```tsx
// 1. JSON 객체 배열로 초기 콘텐츠 설정
const initialBlocks = [
  {
    type: "paragraph",
    props: {
      textColor: "default",
      backgroundColor: "default",
      textAlignment: "left"
    },
    content: [{ type: "text", text: "환영합니다!", styles: {} }],
    children: []
  }
];

<LumirEditor initialContent={initialBlocks} />

// 2. JSON 문자열로 설정 (API 응답, 로컬스토리지 등)
const savedContent = localStorage.getItem('editorContent');
<LumirEditor initialContent={savedContent} />

// 3. Placeholder와 빈 블록 개수 설정
<LumirEditor
  placeholder="제목을 입력하세요..."
  initialEmptyBlocks={1} // 한 개의 빈 블록만 생성
/>

// 4. 다양한 초기 상태 조합
<LumirEditor
  initialContent="" // 빈 문자열
  placeholder="새 문서를 작성하세요"
  initialEmptyBlocks={5} // 5개의 빈 블록 생성
  onContentChange={(content) => {
    // 실시간으로 변경사항 감지
    console.log(`총 ${content.length}개 블록`);
    autosave(JSON.stringify(content));
  }}
/>
```

#### ⚠️ 중요한 사용 팁:

- `initialContent`가 있으면 `placeholder`와 `initialEmptyBlocks`는 무시됩니다
- 콘텐츠 변경 시 `onContentChange`는 항상 `DefaultPartialBlock[]` 타입으로 반환됩니다
- 빈 문자열이나 잘못된 JSON은 자동으로 빈 블록으로 변환됩니다

### 📁 파일 및 미디어

| Prop                  | 타입                              | 기본값      | 설명                                        |
| --------------------- | --------------------------------- | ----------- | ------------------------------------------- |
| `uploadFile`          | `(file: File) => Promise<string>` | `undefined` | 커스텀 파일 업로드 함수                     |
| `storeImagesAsBase64` | `boolean`                         | `true`      | 폴백 이미지 저장 방식 (Base64 vs ObjectURL) |
| `allowVideoUpload`    | `boolean`                         | `false`     | 비디오 업로드 허용                          |
| `allowAudioUpload`    | `boolean`                         | `false`     | 오디오 업로드 허용                          |
| `allowFileUpload`     | `boolean`                         | `false`     | 일반 파일 업로드 허용                       |

#### 사용 예시:

```tsx
// 1. 기본 이미지 업로드 (Base64 저장)
<LumirEditor />  // storeImagesAsBase64={true}가 기본값

// 2. ObjectURL 방식 (브라우저 메모리)
<LumirEditor storeImagesAsBase64={false} />

// 3. 커스텀 업로드 함수 (S3, Cloudinary 등)
<LumirEditor
  uploadFile={async (file) => {
    // 파일 크기 검증
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('파일 크기는 5MB 이하여야 합니다');
    }

    // FormData로 업로드
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "editor-uploads");

    const response = await fetch("/api/upload", {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${userToken}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('업로드 실패');
    }

    const { url } = await response.json();
    return url; // 반드시 접근 가능한 public URL 반환
  }}
  // 비디오와 오디오도 허용
  allowVideoUpload={true}
  allowAudioUpload={true}
/>

// 4. AWS S3 직접 업로드 예시
<LumirEditor
  uploadFile={async (file) => {
    // 1. Presigned URL 받기
    const presignedResponse = await fetch('/api/s3/presigned-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileName: file.name,
        fileType: file.type,
      }),
    });

    const { uploadUrl, fileUrl } = await presignedResponse.json();

    // 2. S3에 직접 업로드
    await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });

    // 3. 공개 URL 반환
    return fileUrl;
  }}
/>
```

#### 🔧 업로드 함수 설계 가이드:

**입력:** `File` 객체
**출력:** `Promise<string>` (접근 가능한 URL)

```tsx
// 올바른 예시
const uploadFile = async (file: File): Promise<string> => {
  // 업로드 로직...
  return "https://cdn.example.com/uploads/image.jpg"; // ✅ 공개 URL
};

// 잘못된 예시
const uploadFile = async (file: File): Promise<string> => {
  return "file://local/path.jpg"; // ❌ 로컬 경로
  return "blob:http://localhost/temp"; // ❌ Blob URL
};
```

#### ⚠️ 중요한 업로드 팁:

- `uploadFile`이 없으면 `storeImagesAsBase64` 설정에 따라 Base64 또는 ObjectURL 사용
- 업로드 실패 시 에러를 던지면 해당 파일은 삽입되지 않음
- 반환된 URL은 브라우저에서 직접 접근 가능해야 함
- 대용량 파일은 청크 업로드나 압축을 고려하세요

### 🎛️ 에디터 기능

| Prop                | 타입                                      | 기본값                    | 설명                 |
| ------------------- | ----------------------------------------- | ------------------------- | -------------------- |
| `tables`            | `TableConfig`                             | `모두 true`               | 표 기능 설정         |
| `heading`           | `{levels?: (1\|2\|3\|4\|5\|6)[]}`         | `{levels: [1,2,3,4,5,6]}` | 헤딩 레벨 설정       |
| `animations`        | `boolean`                                 | `true`                    | 블록 변환 애니메이션 |
| `defaultStyles`     | `boolean`                                 | `true`                    | 기본 스타일 적용     |
| `disableExtensions` | `string[]`                                | `[]`                      | 비활성화할 확장 기능 |
| `tabBehavior`       | `"prefer-navigate-ui" \| "prefer-indent"` | `"prefer-navigate-ui"`    | Tab 키 동작          |
| `trailingBlock`     | `boolean`                                 | `true`                    | 문서 끝 빈 블록 유지 |

### 🎨 UI 및 테마

| Prop                   | 타입                          | 기본값    | 설명                  |
| ---------------------- | ----------------------------- | --------- | --------------------- |
| `theme`                | `"light" \| "dark" \| object` | `"light"` | 에디터 테마           |
| `editable`             | `boolean`                     | `true`    | 편집 가능 여부        |
| `className`            | `string`                      | `""`      | 커스텀 CSS 클래스     |
| `includeDefaultStyles` | `boolean`                     | `true`    | 기본 스타일 포함 여부 |

### 🛠️ 툴바 및 메뉴

| Prop                | 타입      | 기본값 | 설명                      |
| ------------------- | --------- | ------ | ------------------------- |
| `formattingToolbar` | `boolean` | `true` | 서식 툴바 표시            |
| `linkToolbar`       | `boolean` | `true` | 링크 툴바 표시            |
| `sideMenu`          | `boolean` | `true` | 사이드 메뉴 표시          |
| `sideMenuAddButton` | `boolean` | `true` | 사이드 메뉴 Add 버튼 표시 |
| `slashMenu`         | `boolean` | `true` | 슬래시 메뉴 표시          |
| `emojiPicker`       | `boolean` | `true` | 이모지 피커 표시          |
| `filePanel`         | `boolean` | `true` | 파일 패널 표시            |
| `tableHandles`      | `boolean` | `true` | 표 핸들 표시              |
| `comments`          | `boolean` | `true` | 댓글 기능 표시            |

### 🔗 고급 설정

| Prop                | 타입                                         | 기본값      | 설명                 |
| ------------------- | -------------------------------------------- | ----------- | -------------------- |
| `editorRef`         | `React.MutableRefObject<EditorType \| null>` | `undefined` | 에디터 인스턴스 참조 |
| `domAttributes`     | `Record<string, string>`                     | `{}`        | DOM 속성 추가        |
| `resolveFileUrl`    | `(url: string) => Promise<string>`           | `undefined` | 파일 URL 변환 함수   |
| `onSelectionChange` | `() => void`                                 | `undefined` | 선택 영역 변경 콜백  |

## 📖 타입 정의

### 주요 타입 가져오기

```tsx
import type {
  LumirEditorProps,
  EditorType,
  DefaultPartialBlock,
  DefaultBlockSchema,
  DefaultInlineContentSchema,
  DefaultStyleSchema,
  PartialBlock,
  BlockNoteEditor,
} from "@lumir-company/editor";
```

### 타입 사용 예시

```tsx
import { useRef } from "react";
import {
  LumirEditor,
  type EditorType,
  type DefaultPartialBlock,
} from "@lumir-company/editor";

function MyEditor() {
  const editorRef = useRef<EditorType>(null);

  const handleContentChange = (content: DefaultPartialBlock[]) => {
    console.log("변경된 블록:", content);
    saveToDatabase(JSON.stringify(content));
  };

  const insertImage = () => {
    editorRef.current?.pasteHTML('<img src="/example.jpg" alt="Example" />');
  };

  return (
    <div>
      <button onClick={insertImage}>이미지 삽입</button>
      <LumirEditor
        editorRef={editorRef}
        onContentChange={handleContentChange}
      />
    </div>
  );
}
```

## 🎨 스타일 커스터마이징 완벽 가이드

### 1. 기본 스타일 시스템

LumirEditor는 3가지 스타일링 방법을 제공합니다:

1. **기본 스타일**: `includeDefaultStyles={true}` (권장)
2. **Tailwind CSS**: `className` prop으로 유틸리티 클래스 적용
3. **커스텀 CSS**: 전통적인 CSS 클래스와 선택자 사용

### 2. 기본 설정 및 제어

```tsx
// 기본 스타일 포함 (권장)
<LumirEditor
  includeDefaultStyles={true}  // 기본값
  className="추가-커스텀-클래스"
/>

// 기본 스타일 완전 제거 (고급 사용자)
<LumirEditor
  includeDefaultStyles={false}
  className="완전-커스텀-에디터-스타일"
/>
```

### 3. Tailwind CSS 스타일링

#### 기본 레이아웃 스타일링

```tsx
<LumirEditor
  className="
    min-h-[500px] max-w-4xl mx-auto
    rounded-xl border border-gray-200 shadow-lg
    bg-white dark:bg-gray-900
  "
/>
```

#### 반응형 스타일링

```tsx
<LumirEditor
  className="
    h-64 md:h-96 lg:h-[500px]
    text-sm md:text-base
    p-2 md:p-4 lg:p-6
    rounded-md md:rounded-lg lg:rounded-xl
    shadow-sm md:shadow-md lg:shadow-lg
  "
/>
```

#### 고급 내부 요소 스타일링

```tsx
<LumirEditor
  className="
    /* 에디터 영역 패딩 조정 */
    [&_.bn-editor]:px-8 [&_.bn-editor]:py-4
    
    /* 특정 블록 타입 스타일링 */
    [&_[data-content-type='paragraph']]:text-base [&_[data-content-type='paragraph']]:leading-relaxed
    [&_[data-content-type='heading']]:font-bold [&_[data-content-type='heading']]:text-gray-900
    [&_[data-content-type='list']]:ml-4
    
    /* 포커스 상태 스타일링 */
    focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500
    
    /* 테마별 스타일링 */
    dark:[&_.bn-editor]:bg-gray-800 dark:[&_.bn-editor]:text-white
    
    /* 호버 효과 */
    hover:shadow-md transition-shadow duration-200
  "
/>
```

#### 테마별 스타일링

```tsx
// 라이트 모드
<LumirEditor
  theme="light"
  className="
    bg-white text-gray-900 border-gray-200
    [&_.bn-editor]:bg-white
    [&_[data-content-type='paragraph']]:text-gray-800
  "
/>

// 다크 모드
<LumirEditor
  theme="dark"
  className="
    bg-gray-900 text-white border-gray-700
    [&_.bn-editor]:bg-gray-900
    [&_[data-content-type='paragraph']]:text-gray-100
  "
/>
```

### 4. CSS 클래스 스타일링

#### 기본 CSS 구조

```css
/* 메인 에디터 컨테이너 */
.my-custom-editor {
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  background: white;
}

/* 에디터 내용 영역 */
.my-custom-editor .bn-editor {
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 14px;
  line-height: 1.6;
  padding: 24px;
  min-height: 200px;
}

/* 포커스 상태 */
.my-custom-editor:focus-within {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
```

#### 블록별 세부 스타일링

```css
/* 문단 블록 */
.my-custom-editor .bn-block[data-content-type="paragraph"] {
  margin-bottom: 12px;
  font-size: 14px;
  color: #374151;
}

/* 헤딩 블록 */
.my-custom-editor .bn-block[data-content-type="heading"] {
  font-weight: 700;
  margin: 24px 0 12px 0;
  color: #111827;
}

.my-custom-editor .bn-block[data-content-type="heading"][data-level="1"] {
  font-size: 28px;
  border-bottom: 2px solid #e5e7eb;
  padding-bottom: 8px;
}
```

## 🔧 고급 사용법

### 명령형 API 사용

```tsx
function AdvancedEditor() {
  const editorRef = useRef<EditorType>(null);

  const insertTable = () => {
    editorRef.current?.insertBlocks(
      [
        {
          type: "table",
          content: {
            type: "tableContent",
            rows: [{ cells: ["셀 1", "셀 2"] }, { cells: ["셀 3", "셀 4"] }],
          },
        },
      ],
      editorRef.current.getTextCursorPosition().block
    );
  };

  return (
    <div>
      <button onClick={insertTable}>표 삽입</button>
      <button onClick={() => editorRef.current?.focus()}>포커스</button>
      <LumirEditor editorRef={editorRef} />
    </div>
  );
}
```

### 커스텀 붙여넣기 핸들러

```tsx
<LumirEditor
  pasteHandler={({ event, defaultPasteHandler }) => {
    const text = event.clipboardData?.getData("text/plain");

    // URL 감지 시 자동 링크 생성
    if (text?.startsWith("http")) {
      return defaultPasteHandler({ pasteBehavior: "prefer-html" }) ?? false;
    }

    // 기본 처리
    return defaultPasteHandler() ?? false;
  }}
/>
```

### 실시간 자동 저장

```tsx
function AutoSaveEditor() {
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "error">(
    "saved"
  );

  const handleContentChange = useCallback(
    debounce(async (content: DefaultPartialBlock[]) => {
      setSaveStatus("saving");
      try {
        await saveToServer(JSON.stringify(content));
        setSaveStatus("saved");
      } catch (error) {
        setSaveStatus("error");
      }
    }, 1000),
    []
  );

  return (
    <div>
      <div className="mb-2">
        상태: <span className={`badge badge-${saveStatus}`}>{saveStatus}</span>
      </div>
      <LumirEditor onContentChange={handleContentChange} />
    </div>
  );
}
```

## 📱 반응형 디자인

```tsx
<LumirEditor
  className="
    w-full h-96
    md:h-[500px] 
    lg:h-[600px]
    rounded-lg 
    border border-gray-300
    md:rounded-xl
    lg:shadow-xl
  "
  // 모바일에서는 일부 툴바 숨김
  formattingToolbar={true}
  filePanel={window.innerWidth > 768}
  tableHandles={window.innerWidth > 1024}
/>
```

## ⚠️ 주의사항 및 문제 해결

### 1. SSR 환경 (필수)

Next.js 등 SSR 환경에서는 반드시 클라이언트 사이드에서만 렌더링해야 합니다:

```tsx
// ✅ 올바른 방법
const LumirEditor = dynamic(
  () => import("@lumir-company/editor").then((m) => m.LumirEditor),
  { ssr: false }
);

// ❌ 잘못된 방법 - SSR 오류 발생
import { LumirEditor } from "@lumir-company/editor";
```

### 2. React StrictMode

React 19/Next.js 15 일부 환경에서 StrictMode 이슈가 보고되었습니다. 문제 발생 시 임시로 StrictMode를 비활성화하는 것을 고려해보세요.

### 3. 일반적인 설치 문제

#### TypeScript 타입 오류

```bash
# TypeScript 타입 문제 해결
npm install --save-dev @types/react @types/react-dom

# 또는 tsconfig.json에서
{
  "compilerOptions": {
    "skipLibCheck": true
  }
}
```

#### CSS 스타일이 적용되지 않는 경우

```tsx
// 1. CSS 파일이 올바르게 임포트되었는지 확인
import "@lumir-company/editor/style.css";

// 2. Tailwind CSS 설정 확인
// tailwind.config.js에 패키지 경로 추가 필요

// 3. CSS 우선순위 문제인 경우
.my-editor {
  /* !important 사용 또는 더 구체적인 선택자 */
}
```

#### 번들러 호환성 문제

```js
// Webpack 설정
module.exports = {
  resolve: {
    fallback: {
      crypto: require.resolve("crypto-browserify"),
      stream: require.resolve("stream-browserify"),
    },
  },
};

// Vite 설정
export default defineConfig({
  optimizeDeps: {
    include: ["@lumir-company/editor"],
  },
});
```

#### 이미지 업로드 문제

```tsx
// CORS 문제 해결
const uploadFile = async (file: File) => {
  const response = await fetch("/api/upload", {
    method: "POST",
    headers: {
      // CORS 헤더 확인
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`업로드 실패: ${response.status}`);
  }

  return url; // 반드시 접근 가능한 public URL
};
```

### 4. 성능 최적화

#### 큰 문서 처리

```tsx
// 대용량 문서의 경우 초기 렌더링 최적화
<LumirEditor
  initialContent={largeContent}
  // 불필요한 기능 비활성화
  animations={false}
  formattingToolbar={false}
  // 메모리 사용량 줄이기
  storeImagesAsBase64={false}
/>
```

#### 메모리 누수 방지

```tsx
// 컴포넌트 언마운트 시 정리
useEffect(() => {
  return () => {
    // 에디터 정리 로직
    if (editorRef.current) {
      editorRef.current = null;
    }
  };
}, []);
```

## 🚀 시작하기 체크리스트

프로젝트에 LumirEditor를 성공적으로 통합하기 위한 체크리스트:

### 📋 필수 설치 단계

- [ ] 패키지 설치: `npm install @lumir-company/editor`
- [ ] CSS 임포트: `import "@lumir-company/editor/style.css"`
- [ ] TypeScript 타입 설치: `npm install --save-dev @types/react @types/react-dom`
- [ ] SSR 환경이라면 dynamic import 설정

### 🎨 스타일링 설정

- [ ] Tailwind CSS 사용 시 `tailwind.config.js`에 패키지 경로 추가
- [ ] 기본 스타일 적용 확인: `includeDefaultStyles={true}`
- [ ] 커스텀 스타일이 필요하면 `className` prop 활용

### 🔧 기능 설정

- [ ] 파일 업로드가 필요하면 `uploadFile` 함수 구현
- [ ] 콘텐츠 변경 감지가 필요하면 `onContentChange` 콜백 설정
- [ ] 필요에 따라 툴바와 메뉴 표시/숨김 설정

### ✅ 테스트 확인

- [ ] 기본 텍스트 입력 동작 확인
- [ ] 이미지 업로드/붙여넣기 동작 확인
- [ ] 스타일이 올바르게 적용되는지 확인
- [ ] 다양한 브라우저에서 테스트

## 📋 변경 기록

### v0.2.0 (최신)

- ✨ **하이브리드 콘텐츠 지원**: `initialContent`에서 JSON 객체 배열과 JSON 문자열 모두 지원
- ✨ **Placeholder 기능**: 첫 번째 블록에 placeholder 텍스트 설정 가능
- ✨ **초기 블록 개수 설정**: `initialEmptyBlocks` prop으로 빈 블록 개수 조정
- 🔧 **유틸리티 클래스 추가**: `ContentUtils`, `EditorConfig` 클래스로 코드 정리
- 📁 **타입 분리**: 모든 타입 정의를 별도 파일로 분리하여 관리 개선
- 🎨 **기본 스타일 최적화**: 더 나은 기본 패딩과 스타일 적용

### v0.1.15

- 🐛 파일 검증 로직 보완

### v0.1.14

- 🔧 슬래시 추천 메뉴 항목 변경

### v0.1.13

- ⚙️ Audio, Video, Movie 업로드 기본값을 false로 변경

### v0.1.12

- 🐛 조건부 Helper 항목 렌더링 수정

### v0.1.11

- 🐛 이미지 중복 드롭 이슈 수정

### v0.1.10

- 🎨 기본 이미지 저장 방식을 Base64로 설정
- ✨ `storeImagesAsBase64` prop 추가
- 🐛 드래그앤드롭 중복 삽입 방지

### v0.1.0

- 🎉 초기 릴리스

## 📄 라이선스

이 패키지는 BlockNote의 무료 기능만을 사용합니다.

- 의존성: `@blocknote/core`, `@blocknote/react`, `@blocknote/mantine`
- BlockNote 라이선스를 따릅니다.
