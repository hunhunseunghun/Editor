# @kingdoo/editor

BlockNote 기반의 React 리치 텍스트 에디터 컴포넌트

## 주요 특징

- BlockNote 무료 패키지 의존(@blocknote/core, @blocknote/react, @blocknote/mantine)
- 이미지 업로드/붙여넣기/드래그앤드롭
- 표/헤딩 및 기본 UI(포맷팅/링크/사이드/슬래시/이모지/파일 패널)
- 번들: ESM/CJS + 타입(d.ts)
- **className prop을 통한 커스텀 스타일링 지원**
- 사이드 메뉴 토글: Add(+ ) 버튼 On/Off (드래그 핸들은 항상 유지)

## 사용 방법

### CSS 적용

- 프록시 한 번에 import

```ts
import '@kingdoo/editor/style.css';
```

- 또는 개별 import

```ts
import '@blocknote/core/fonts/inter.css';
import '@blocknote/mantine/style.css';
import '@blocknote/react/style.css';
```

#### className을 통한 스타일 적용

`className` prop을 사용하여 에디터에 커스텀 CSS 클래스를 적용할 수 있습니다:

```tsx
<LumirEditor className='my-custom-editor' />
```

Tailwind 임의 변형을 활용하면 특정 자손만 정밀하게 스타일링할 수 있습니다.

```tsx
// 문단만 14px, 에디터 가로 패딩 26px
<LumirEditor
  className='[&_[data-content-type="paragraph"]]:text-[14px] [&_.bn-editor]:px-[26px]'
  includeDefaultStyles
/>
```

#### CSS에서 스타일 오버라이드

```css
/* 기본 에디터 스타일 */
.my-custom-editor .bn-editor {
  font-size: 14px;
}

/* paragraph 블록만 특정 크기로 */
.my-custom-editor .bn-block[data-content-type='paragraph'] {
  font-size: 12px;
}

/* 모든 블록을 12px로 설정 */
.my-custom-editor .bn-block {
  font-size: 12px;
}
```

### Next.js 예시(SSR 비활성)

```tsx
'use client';
import dynamic from 'next/dynamic';

const LumirEditor = dynamic(
  () => import('@kingdoo/editor').then((m) => m.LumirEditor),
  { ssr: false },
);

export default function Page() {
  return (
    <div style={{ width: 800, height: 600 }}>
      <LumirEditor
        initialContent={[]}
        uploadFile={async (file) => URL.createObjectURL(file)}
        onContentChange={(blocks) => {
          console.log('blocks:', blocks.length);
        }}
        theme='light'
        className='my-editor'
        formattingToolbar
        linkToolbar
        sideMenu
        slashMenu
        emojiPicker
        filePanel
        tableHandles
        comments={false}
      />
    </div>
  );
}
```

### React 예시(Vite 등)

```tsx
import { LumirEditor } from '@kingdoo/editor';
import '@kingdoo/editor/style.css';

export default function App() {
  return (
    <LumirEditor
      initialContent={[]}
      uploadFile={async (file) => URL.createObjectURL(file)}
      className='my-editor'
    />
  );
}
```

## Props 개요

```ts
interface LumirEditorProps {
  // 에디터 옵션
  initialContent?: PartialBlock[];
  uploadFile?: (file: File) => Promise<string>;
  pasteHandler?: (ctx) => boolean | undefined;
  tables?: {
    splitCells?: boolean;
    cellBackgroundColor?: boolean;
    cellTextColor?: boolean;
    headers?: boolean;
  };
  heading?: { levels?: (1 | 2 | 3 | 4 | 5 | 6)[] };
  animations?: boolean;
  defaultStyles?: boolean;
  disableExtensions?: string[];
  domAttributes?: Record<string, string>;
  tabBehavior?: 'prefer-navigate-ui' | 'prefer-indent';
  trailingBlock?: boolean;
  resolveFileUrl?: (url: string) => Promise<string>;

  // 뷰 옵션
  editable?: boolean;
  theme?: 'light' | 'dark' | object;
  formattingToolbar?: boolean;
  linkToolbar?: boolean;
  sideMenu?: boolean;
  slashMenu?: boolean;
  emojiPicker?: boolean;
  filePanel?: boolean;
  tableHandles?: boolean;
  comments?: boolean;
  onSelectionChange?: () => void;
  className?: string; // ✅ Tailwind/CSS 클래스 적용
  includeDefaultStyles?: boolean; // ✅ 기본 스타일 포함 여부
  sideMenuAddButton?: boolean; // ✅ Add 버튼 표시(기본 true). false면 Add 버튼 제거, 드래그 핸들은 유지

  // 콜백
  onContentChange?: (content: PartialBlock[]) => void;
  editorRef?: React.MutableRefObject<EditorType | null>;
}
```

## Export된 타입들

패키지에서 사용할 수 있는 모든 타입들을 import할 수 있습니다:

### 컴포넌트 타입

```ts
import type {
  LumirEditorProps, // 메인 컴포넌트 props 인터페이스
  EditorType, // 에디터 인스턴스 타입
  DefaultPartialBlock, // 기본 블록 타입
} from '@kingdoo/editor';
```

### BlockNote 코어 타입

```ts
import type {
  DefaultBlockSchema, // 기본 블록 스키마
  DefaultInlineContentSchema, // 기본 인라인 콘텐츠 스키마
  DefaultStyleSchema, // 기본 스타일 스키마
  PartialBlock, // 부분 블록 타입
  BlockNoteEditor, // 코어 에디터 타입
} from '@kingdoo/editor';
```

### 전체 타입 import 예시

```ts
import {
  LumirEditor,
  type LumirEditorProps,
  type EditorType,
  type DefaultPartialBlock,
  type DefaultBlockSchema,
  type PartialBlock,
} from '@kingdoo/editor';
```

### 타입 사용 예시

```tsx
// 에디터 ref 타입 지정
const editorRef = useRef<EditorType>(null);

// 콘텐츠 변경 핸들러 타입 지정
const handleContentChange = (content: DefaultPartialBlock[]) => {
  console.log('Content changed:', content);
};

// 커스텀 props 타입 정의
interface CustomEditorProps extends Partial<LumirEditorProps> {
  customProp?: string;
}
```

## Props 상세(옵션/기본값/사용법)

### 에디터 옵션

- initialContent

  - 설명: 생성 시 로드할 블록 JSON 배열
  - 기본값: 빈 문단 1개(내부 기본)
  - 예시:
    ```ts
    initialContent={[{ type: 'paragraph', content: [{ type: 'text', text: 'Hello' }] }]}
    ```

- uploadFile(file: File) => Promise<string>

  - 설명: 파일 업로드 후 공개 접근 가능한 URL 문자열을 반환
  - 기본값: 제공하지 않으면 내부에서 URL.createObjectURL로 임시 URL 생성
  - 예시:
    ```ts
    uploadFile={async (file) => {
      const url = await myUploader(file); // S3/GCS 등 업로드
      return url; // 예: https://cdn.example.com/...
    }}
    ```

- pasteHandler(ctx)

  - 설명: 붙여넣기 동작 커스터마이즈. 반환 true면 기본 처리 취소
  - ctx: { event: ClipboardEvent; editor; defaultPasteHandler(opts?) }
  - 옵션: defaultPasteHandler({ pasteBehavior: 'prefer-markdown' | 'prefer-html' })
  - 기본값: 이미지 파일이 있으면 업로드/삽입, 없으면 defaultPasteHandler()
  - 예시:
    ```ts
    pasteHandler={({ event, defaultPasteHandler }) => {
      if (event.clipboardData?.getData('text/plain')?.startsWith('http')) {
        // URL만 붙여넣을 땐 HTML 선호
        return defaultPasteHandler({ pasteBehavior: 'prefer-html' }) ?? false;
      }
      return defaultPasteHandler() ?? false;
    }}
    ```

- tables

  - 설명: 표 기능 토글
  - 항목 및 기본값: splitCells(true), cellBackgroundColor(true), cellTextColor(true), headers(true)
  - 예시:
    ```ts
    tables={{ splitCells: true, cellBackgroundColor: true, cellTextColor: true, headers: true }}
    ```

- heading

  - 설명: 사용 가능한 헤딩 레벨 목록
  - 기본값: 지정 안 하면 [1,2,3,4,5,6]
  - 예시: `heading={{ levels: [1,2,3] }}`

- animations

  - 설명: 블록 변환 애니메이션
  - 기본값: true

- defaultStyles

  - 설명: 기본 폰트/요소 스타일 초기화 적용
  - 기본값: true

- disableExtensions

  - 설명: TipTap/BlockNote 확장 비활성화(문자열 이름)
  - 주의: 내부 이름 일치 필요, 오동작 시 기능 손실 가능
  - 예시: `disableExtensions={['blockquote']}`

- domAttributes

  - 설명: 에디터 DOM 루트에 추가할 속성
  - 예시: `domAttributes={{ 'data-editor': 'lumir' }}`

- tabBehavior

  - 설명: Tab 키 동작
  - 값: 'prefer-navigate-ui' | 'prefer-indent'
  - 기본값: 'prefer-navigate-ui'

- trailingBlock

  - 설명: 문서 끝에 항상 한 개의 빈 블록 유지
  - 기본값: true

- resolveFileUrl(url: string) => Promise<string>
  - 설명: 파일 표시용 URL을 런타임에 변환(CORS/서명 URL 등)
  - 예시: `resolveFileUrl={async (u) => u}`

#### 이미지 저장 방식 관련

- storeImagesAsBase64 (boolean)
  - 설명: 외부 `uploadFile`이 없는 경우 이미지 폴백 저장 방식을 결정합니다.
  - 기본값: `true` (Base64 Data URL 저장)
  - `false`일 때: 브라우저 `URL.createObjectURL`로 임시 URL을 사용해 미리보기 삽입
  - 주의: `uploadFile`이 제공되면 이 옵션은 무시되고 업로더가 항상 우선됩니다.

### 뷰 옵션

- editable

  - 설명: 편집 가능 여부
  - 기본값: true

- theme

  - 설명: 테마 문자열 또는 사용자 정의 객체
  - 값: 'light' | 'dark' | 커스텀 테마 객체
  - 기본값: 'light'

- formattingToolbar | linkToolbar | sideMenu | slashMenu | emojiPicker | filePanel | tableHandles | comments

  - 설명: 각 UI 컴포넌트 토글
  - 기본값: 모두 true(명시적으로 false를 줄 때만 비활성)
  - 예시: `formattingToolbar={false}`

- onSelectionChange

  - 설명: 선택 상태 변경 시 호출되는 콜백
  - 예시: `onSelectionChange={() => { /* UI 반영 */ }}`

- className

  - 설명: 에디터에 적용할 커스텀 CSS/Tailwind 클래스
  - 기본값: 빈 문자열
  - 예시: `className="min-h-[400px] rounded-lg shadow-lg"`

- includeDefaultStyles

  - 설명: 기본 스타일(w-full h-full overflow-auto) 포함 여부
  - 기본값: true
  - 예시: `includeDefaultStyles={false}`로 기본 스타일 제거

- sideMenuAddButton
  - 설명: 블록 사이드 메뉴의 Add(+ ) 버튼 표시 여부. false면 Add 버튼만 제거하고 드래그 핸들은 그대로 유지
  - 기본값: true
  - 공식 패턴: 기본 사이드메뉴를 끄고(SideMenuController로) 커스텀 사이드메뉴 렌더
  - 예시:
    ```tsx
    // Add 버튼 제거, 드래그 핸들 유지
    <LumirEditor sideMenuAddButton={false} />
    ```

### 콜백/레퍼런스

- onContentChange(content)

  - 설명: 상위 블록 배열이 변경될 때 호출
  - 사용: 자동 저장/동기화 트리거로 활용
  - 예시:
    ```ts
    onContentChange={(blocks) => saveDraft(blocks)}
    ```

- editorRef
  - 설명: 에디터 인스턴스 접근(명령형 API)
  - 대표 메서드: `focus()`, `pasteHTML(html)`, `insertBlocks(blocks, at)` 등
  - 예시:
    ```tsx
    const ref = useRef(null as any);
    <LumirEditor editorRef={ref} />
    <button onClick={() => ref.current?.focus()}>Focus</button>
    <button onClick={() => ref.current?.pasteHTML('<img src="/x.png"/>')}>Insert</button>
    ```

### 기본 동작 요약

- 모든 UI 토글 props는 명시적으로 false를 주지 않으면 기본 활성
- heading.levels 미지정 시 1~6 사용 가능
- tables 하위 옵션 미지정 시 모두 활성
- uploadFile 미제공 시 createObjectURL로 임시 URL 생성해 미리보기 삽입

## 이미지 처리

- 업로드: `uploadFile(file)` → URL 반환 → `<img src>` 삽입
- 붙여넣기: 클립보드 이미지 자동 업로드/삽입(없으면 기본 핸들러)
- 드래그앤드롭: `image/*` 만 처리

### 이미지 저장 방식 선택(Base64 기본)

- 기본값: 외부 `uploadFile`이 없을 때 이미지 파일은 Base64 Data URL로 저장됩니다.
- 전환: URL(ObjectURL) 저장으로 바꾸려면 `storeImagesAsBase64={false}`를 전달하세요.
- 주입: S3/GCS 등 외부 업로더를 제공하면 `uploadFile`이 항상 우선 적용됩니다.

```tsx
// Base64(기본)
<LumirEditor />

// Base64 → URL(ObjectURL)로 폴백 동작 전환
<LumirEditor storeImagesAsBase64={false} />

// 커스텀 업로더(S3 등)
<LumirEditor uploadFile={async (file) => {
  const url = await myS3Uploader(file);
  return url; // 예: https://cdn.example.com/path/file.png
}} />
```

### 드래그앤드롭 중복 삽입 방지

- 에디터 내부에서 dragover/drop 이벤트에 대해 `preventDefault + stopPropagation(+ stopImmediatePropagation)`을 적용하여 BlockNote의 기본 드롭 처리와 커스텀 드롭이 모두 실행되는 중복을 방지합니다.
- 결과: 동일 이미지를 2회 삽입하는 현상을 차단합니다.

### 이미지/파일 블록 구조 예시

- 이미지(URL)

```json
[
  {
    "id": "auto-or-your-id",
    "type": "image",
    "props": {
      "url": "https://your.cdn/image.png",
      "caption": "",
      "previewWidth": 512,
      "textAlignment": "left",
      "textColor": "default",
      "backgroundColor": "default"
    },
    "content": null,
    "children": []
  }
]
```

- 이미지(Base64)

```json
{
  "type": "image",
  "props": {
    "url": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "caption": "",
    "previewWidth": 512,
    "textAlignment": "left",
    "textColor": "default",
    "backgroundColor": "default"
  },
  "children": []
}
```

## 표/헤딩/툴바 예시

```tsx
<LumirEditor
  tables={{
    splitCells: true,
    cellBackgroundColor: true,
    cellTextColor: true,
    headers: true,
  }}
  heading={{ levels: [1, 2, 3, 4, 5, 6] }}
  formattingToolbar
  linkToolbar
  sideMenu
  slashMenu
  filePanel
/>
```

## 블록 사이드 메뉴 커스터마이즈(공식 가이드 기반)

아래는 BlockNote 공식 패턴을 `LumirEditor` 내부에 적용한 결과입니다. `sideMenuAddButton={false}`일 때 기본 사이드메뉴를 비활성화하고, 컨트롤러로 드래그 핸들만 노출합니다.

```tsx
// 내부 구현 개요
// <BlockNoteView sideMenu={false}>
//   <SideMenuController sideMenu={(props) => (
//     <SideMenu {...props}>
//       <DragHandleButton {...props} />
//     </SideMenu>
//   )} />
// </BlockNoteView>
```

## SSR/StrictMode 주의

- 클라이언트 전용: Next.js에서는 `dynamic({ ssr:false })` 권장
- React 19/Next 15 일부 환경 StrictMode 이슈 보고됨 → 필요 시 임시 비활성 고려

## 라이선스/크레딧

- 의존: `@blocknote/core`, `@blocknote/react`, `@blocknote/mantine`
- 본 패키지는 BlockNote 무료 기능만 사용합니다.

## Tailwind CSS 통합

### 프로젝트에서 Tailwind CSS 사용하기

이 패키지에 포함된 Tailwind 클래스를 사용하려면, 프로젝트의 `tailwind.config.js`에 패키지 경로를 추가해주세요:

```js
// tailwind.config.js
module.exports = {
  content: [
    // 기존 경로들...
    './node_modules/@kingdoo/editor/dist/**/*.js',
  ],
  // ...
};
```

또는 Tailwind CSS v4를 사용하는 경우 CSS 파일에서:

```css
@import 'tailwindcss';
@source "../node_modules/@kingdoo/editor";
```

### className을 통한 스타일 커스터마이징

Tailwind 클래스를 사용하여 에디터의 스타일을 커스터마이징할 수 있습니다:

```tsx
<LumirEditor className='min-h-[500px] rounded-lg shadow-lg border border-gray-200' />
```

## 변경 기록

- 0.1.15: 파일 검증 로직 보완
- 0.1.14: 슬래쉬 추천 메뉴 항목 변경
- 0.1.13: Audio, Video, Movie 업로드 Default : false
- 0.1.12: 조건부 Helper 항목 렌더링 픽스.
- 0.1.11: 이미지 중복 드롭 이슈 픽스.
- 0.1.10:
  - 기본 이미지 저장 방식을 Base64로 설정(`storeImagesAsBase64` 기본값 true)
  - `storeImagesAsBase64` prop 추가: 폴백 저장 방식을 Base64 ↔ URL(ObjectURL)로 전환 가능
  - 드래그앤드롭 중복 삽입 방지: 기본/커스텀 드롭 처리 동시 실행 차단
- 0.1.9: 에디터 types export, 정리
- 0.1.8: Font 상속 변경
- 0.1.7: 사이드메뉴 토글 안정화(기본 사이드메뉴 끄고 Controller로 주입), DragHandle 전용 메뉴 기본 제공, README 보강, Tailwind 예시 추가
- 0.1.1: `sideMenuAddButton` 추가(플러스 버튼 토글, 드래그 핸들 유지), 공식 가이드와 동일한 커스텀 사이드메뉴 패턴 연동
- 0.1.0: 초기 스캐폴딩
