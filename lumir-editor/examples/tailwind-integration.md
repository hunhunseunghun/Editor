# Tailwind CSS Integration Guide

## 간소화된 @lumir-company/editor와 Tailwind CSS 사용하기

### 1. 설치

```bash
npm install @lumir-company/editor
```

### 2. 기본 설정

```tsx
// CSS 임포트 (필수)
import '@lumir-company/editor/style.css';
```

### 3. 사용 예제

#### 기본 사용법

```tsx
import { LumirEditor } from '@lumir-company/editor';
import '@lumir-company/editor/style.css';

function MyEditor() {
  return (
    <LumirEditor
      className='min-h-[400px] rounded-lg border border-gray-200 shadow-lg'
      initialContent='에디터에 오신 것을 환영합니다!'
    />
  );
}
```

#### 고급 스타일링

```tsx
function CustomEditor() {
  return (
    <div className='max-w-4xl mx-auto p-4'>
      <LumirEditor
        className='
          min-h-[500px] 
          rounded-xl border border-gray-200 shadow-xl
          bg-white dark:bg-gray-900
          focus-within:ring-2 focus-within:ring-blue-500
        '
        theme='light'
        onContentChange={(blocks) => console.log(blocks)}
      />
    </div>
  );
}
```

#### 반응형 디자인

```tsx
function ResponsiveEditor() {
  return (
    <LumirEditor
      className='
        min-h-[300px] sm:min-h-[400px] lg:min-h-[500px]
        rounded-md md:rounded-lg lg:rounded-xl
        border border-gray-300
        shadow-sm md:shadow-md lg:shadow-lg
      '
    />
  );
}
```

### 4. 테마별 스타일링

#### 라이트/다크 모드

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

// 시스템 설정 따르기
<LumirEditor
  theme="light"
  className="
    bg-white text-gray-900 border-gray-200
    dark:bg-gray-900 dark:text-white dark:border-gray-700
  "
/>
```

### 5. cn 유틸리티 사용

```tsx
import { LumirEditor, cn } from '@lumir-company/editor';

function Editor({ isFullscreen }: { isFullscreen?: boolean }) {
  return (
    <LumirEditor
      className={cn(
        'transition-all duration-300 min-h-[400px]',
        isFullscreen && 'fixed inset-0 z-50',
      )}
    />
  );
}
```

### 6. 스타일링 팁

#### 기본 스타일 구조

- `.lumirEditor`: 메인 컨테이너 (기본: `width: 100%; height: 100%; min-width: 250px; overflow: auto;`)
- `.lumirEditor .bn-editor`: 에디터 내용 영역 (현재: Pretendard 폰트, 25px/10px 패딩)
- `.lumirEditor [data-content-type='paragraph']`: 문단 블록 (14px 폰트 크기)

#### 커스텀 CSS로 세밀한 제어

```css
/* globals.css */
.my-custom-editor .bn-editor {
  padding-left: 30px;
  padding-right: 15px;
  font-size: 16px;
}

.my-custom-editor [data-content-type='heading'] {
  font-weight: 700;
  margin-top: 24px;
}
```

```tsx
<LumirEditor className='my-custom-editor' />
```

### 7. 주의사항

- **Pretendard 폰트**: 기본적으로 Pretendard 폰트가 최우선 적용됩니다
- **14px 문단**: 문단 블록의 기본 폰트 크기는 14px입니다
- **패딩**: 기본 패딩은 왼쪽 25px, 오른쪽 10px입니다
