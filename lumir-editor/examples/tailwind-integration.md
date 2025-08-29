# Tailwind CSS Integration Guide

## 프로젝트에서 @kingdoo/editor와 Tailwind CSS 사용하기

### 1. 설치

```bash
npm install @kingdoo/editor
```

### 2. Tailwind 설정

#### 방법 A: content 경로에 패키지 추가 (권장)

```js
// tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    // 패키지 내부의 컴파일된 JS 파일 포함
    './node_modules/@kingdoo/editor/dist/**/*.{js,mjs}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

#### 방법 B: Tailwind CSS v4 사용 시

```css
/* app.css */
@import 'tailwindcss';
@source "../node_modules/@kingdoo/editor";
```

### 3. 사용 예제

#### 기본 사용법

```tsx
import { LumirEditor } from '@kingdoo/editor';
import '@kingdoo/editor/style.css';

function MyEditor() {
  return (
    <LumirEditor
      className='min-h-[500px] rounded-lg shadow-lg border border-gray-200 dark:border-gray-700'
      includeDefaultStyles={false} // 기본 스타일 제거
    />
  );
}
```

#### 커스텀 컨테이너와 함께 사용

```tsx
function CustomEditor() {
  return (
    <div className='max-w-4xl mx-auto p-4'>
      <div className='bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden'>
        <div className='border-b border-gray-200 dark:border-gray-700 p-4'>
          <h2 className='text-xl font-semibold text-gray-900 dark:text-gray-100'>
            문서 편집기
          </h2>
        </div>
        <LumirEditor
          className='min-h-[400px] p-4'
          theme='light'
          includeDefaultStyles={true} // 기본 w-full h-full overflow-auto 포함
        />
      </div>
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
        text-sm sm:text-base
        px-2 sm:px-4 lg:px-6
      '
    />
  );
}
```

### 4. 주의사항

1. **PurgeCSS/JIT 모드**: Tailwind가 동적으로 생성되는 클래스를 제거하지 않도록 주의
2. **클래스 충돌**: BlockNote의 기본 스타일과 충돌할 수 있으므로 필요시 `!important` 사용
3. **다크 모드**: `theme` prop과 Tailwind의 다크 모드 클래스를 함께 사용

### 5. 고급 스타일링

#### CSS 변수를 활용한 테마 커스터마이징

```css
/* globals.css */
.lumir-editor-custom {
  --bn-colors-editor-background: theme('colors.gray.50');
  --bn-colors-editor-text: theme('colors.gray.900');
  --bn-colors-menu-background: theme('colors.white');
  --bn-colors-menu-text: theme('colors.gray.700');
}

.dark .lumir-editor-custom {
  --bn-colors-editor-background: theme('colors.gray.900');
  --bn-colors-editor-text: theme('colors.gray.100');
  --bn-colors-menu-background: theme('colors.gray.800');
  --bn-colors-menu-text: theme('colors.gray.300');
}
```

```tsx
<LumirEditor className='lumir-editor-custom' theme='light' />
```

### 6. 타입 안전성을 위한 cn 유틸리티 사용

```tsx
import { LumirEditor, cn } from '@kingdoo/editor';

function Editor({ isFullscreen }: { isFullscreen?: boolean }) {
  return (
    <LumirEditor
      className={cn(
        'transition-all duration-300',
        isFullscreen ? 'fixed inset-0 z-50' : 'relative min-h-[400px]',
      )}
    />
  );
}
```

### 7. tailwind-merge 통합 (선택사항)

더 안전한 클래스 병합을 원한다면:

```bash
npm install clsx tailwind-merge
```

```tsx
// utils/cn.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```
