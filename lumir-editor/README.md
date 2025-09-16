# LumirEditor

🖼️ **이미지 전용** BlockNote 기반 Rich Text 에디터

## ✨ 핵심 특징

- **이미지 전용**: 이미지 업로드/드래그앤드롭만 지원 (S3 연동 또는 커스텀 업로더)
- **로딩 스피너**: 이미지 업로드 중 자동 스피너 표시
- **애니메이션 최적화**: 기본 애니메이션 비활성화로 성능 향상
- **TypeScript**: 완전한 타입 안전성
- **경량화**: 비디오/오디오/파일 업로드 기능 제거

## 📦 설치

```bash
npm install @lumir-company/editor
```

## 🚀 기본 사용법

### 1. CSS 임포트 (필수)

```tsx
import "@lumir-company/editor/style.css";
```

### 2. 기본 사용

```tsx
import { LumirEditor } from "@lumir-company/editor";
import "@lumir-company/editor/style.css";

export default function App() {
  return (
    <div className="w-full h-[400px]">
      <LumirEditor onContentChange={(blocks) => console.log(blocks)} />
    </div>
  );
}
```

### 3. Next.js에서 사용 (SSR 비활성화)

```tsx
"use client";
import dynamic from "next/dynamic";

const LumirEditor = dynamic(
  () =>
    import("@lumir-company/editor").then((m) => ({ default: m.LumirEditor })),
  { ssr: false }
);

export default function Editor() {
  return (
    <div className="w-full h-[500px]">
      <LumirEditor />
    </div>
  );
}
```

## 📚 핵심 Props

| Prop              | 타입                               | 기본값    | 설명             |
| ----------------- | ---------------------------------- | --------- | ---------------- |
| `initialContent`  | `DefaultPartialBlock[] \| string`  | -         | 초기 콘텐츠      |
| `onContentChange` | `(blocks) => void`                 | -         | 콘텐츠 변경 콜백 |
| `uploadFile`      | `(file: File) => Promise<string>`  | -         | 커스텀 업로더    |
| `s3Upload`        | `S3UploaderConfig`                 | -         | S3 업로드 설정   |
| `className`       | `string`                           | `""`      | CSS 클래스       |
| `theme`           | `"light" \| "dark" \| ThemeObject` | `"light"` | 에디터 테마      |
| `editable`        | `boolean`                          | `true`    | 편집 가능 여부   |

### S3 업로드 설정

```tsx
interface S3UploaderConfig {
  apiEndpoint: string; // '/api/s3/presigned' (필수)
  env: "development" | "production"; // 환경 (필수)
  author: "admin" | "user"; // 작성자 타입 (필수)
  userId: string; // 사용자 ID (필수)
  path: string; // 파일 경로 (필수)
}
```

## 🖼️ 이미지 업로드 방식

### 1. S3 업로드 (권장)

```tsx
<LumirEditor
  s3Upload={{
    apiEndpoint: "/api/s3/presigned",
    env: "development",
    author: "user",
    userId: "user123",
    path: "editor-images",
  }}
  onContentChange={(blocks) => console.log(blocks)}
/>
```

### 2. 커스텀 업로더

```tsx
<LumirEditor
  uploadFile={async (file) => {
    const formData = new FormData();
    formData.append("image", file);
    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    return (await response.json()).url;
  }}
/>
```

### 3. S3 Helper 함수 사용

```tsx
import { LumirEditor, createS3Uploader } from "@lumir-company/editor";

const s3Uploader = createS3Uploader({
  apiEndpoint: "/api/s3/presigned",
  env: "production",
  author: "user",
  userId: "user123",
  path: "images",
});

<LumirEditor uploadFile={s3Uploader} />;
```

## 📖 주요 타입

```tsx
import type {
  LumirEditorProps,
  DefaultPartialBlock,
  S3UploaderConfig,
  ContentUtils,
  EditorConfig,
} from "@lumir-company/editor";

// 콘텐츠 검증
const isValidContent = ContentUtils.isValidJSONString(jsonString);
const blocks = ContentUtils.parseJSONContent(jsonString);

// 에디터 설정
const tableConfig = EditorConfig.getDefaultTableConfig();
const headingConfig = EditorConfig.getDefaultHeadingConfig();
```

## 💡 사용 팁

```tsx
// 1. 컨테이너 크기 설정
<div className="h-[400px]">
  <LumirEditor />
</div>

// 2. 읽기 전용 모드
<LumirEditor
  editable={false}
  initialContent={savedContent}
/>

// 3. 테마 적용
<LumirEditor theme="dark" />

// 4. 반응형 디자인
<div className="w-full h-64 md:h-96 lg:h-[500px]">
  <LumirEditor className="h-full" />
</div>
```

## ⚠️ 중요 사항

1. **CSS 임포트 필수**: `import "@lumir-company/editor/style.css";`
2. **Next.js SSR 비활성화**: `dynamic`으로 클라이언트 사이드 렌더링만 사용
3. **이미지만 지원**: PNG, JPG, GIF, WebP, BMP, SVG (비디오/오디오/파일 ❌)
4. **S3 설정**: 계층 구조 `{env}/{author}/{userId}/{path}/{date}/{time}/{filename}`

## 📄 라이선스

MIT License
