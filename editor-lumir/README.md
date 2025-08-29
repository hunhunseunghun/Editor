git st# Editor Next - 프로젝트 아키텍처 문서

## 📋 목차

1. [프로젝트 개요](#프로젝트-개요)
2. [기술 스택](#기술-스택)
3. [프로젝트 구조](#프로젝트-구조)
4. [데이터베이스 스키마](#데이터베이스-스키마)
5. [API 엔드포인트](#api-엔드포인트)
6. [인증 시스템](#인증-시스템)
7. [상태 관리](#상태-관리)
8. [UI/UX 컴포넌트](#uiux-컴포넌트)
9. [폰트 시스템](#폰트-시스템)
10. [성능 최적화](#성능-최적화)
11. [보안](#보안)
12. [배포](#배포)

---

## 🎯 프로젝트 개요

**Editor Next**는 Next.js 15와 BlockNote 에디터를 기반으로 한 현대적인 문서 편집 플랫폼입니다. 사용자는 문서를 생성, 편집, 관리할 수 있으며, 폴더 기반의 조직화된 문서 관리 시스템을 제공합니다.

### 주요 기능

- 📝 **리치 텍스트 에디터**: BlockNote 기반 고급 편집 기능
- 📁 **폴더 관리**: 문서의 체계적인 조직화
- 🔐 **인증 시스템**: NextAuth.js 기반 보안 인증
- 🗑️ **소프트 삭제**: 휴지통 기능을 통한 안전한 문서 관리
- 📱 **반응형 디자인**: 모든 디바이스에서 최적화된 경험
- 🎨 **모던 UI**: shadcn/ui 기반의 아름다운 인터페이스

---

## 🛠️ 기술 스택

### Frontend

- **Framework**: Next.js 15.4.4 (App Router)
- **Language**: TypeScript 5
- **UI Library**: React 19.1.0
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui + Radix UI
- **Rich Text Editor**: BlockNote 0.34.0
- **State Management**: Zustand 5.0.6
- **Icons**: Lucide React 0.525.0

### Backend

- **Runtime**: Node.js
- **Database**: MongoDB 5.9.2
- **Authentication**: NextAuth.js 4.24.11
- **Password Hashing**: bcryptjs 3.0.2

## 🔧 환경 설정

### 필수 환경 변수

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 환경 변수들을 설정하세요:

```bash
# MongoDB 설정
MONGODB_URI=mongodb://localhost:27017/editor-lumir
# 또는 MongoDB Atlas 사용 시:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/editor-lumir?retryWrites=true&w=majority
MONGODB_DATABASE=editor-lumir

# NextAuth 설정
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# GitHub OAuth 설정
GITHUB_ID=your-github-client-id
GITHUB_SECRET=your-github-client-secret
```

### MongoDB 설정

1. **로컬 MongoDB 설치**:

   ```bash
   # macOS (Homebrew)
   brew install mongodb-community

   # Ubuntu/Debian
   sudo apt-get install mongodb

   # Windows
   # MongoDB 공식 웹사이트에서 다운로드
   ```

2. **MongoDB Atlas 사용** (권장):
   - [MongoDB Atlas](https://www.mongodb.com/atlas)에서 무료 클러스터 생성
   - 연결 문자열을 `MONGODB_URI` 환경 변수에 설정

### GitHub OAuth 설정

1. [GitHub Developer Settings](https://github.com/settings/developers)에서 새 OAuth App 생성
2. Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
3. Client ID와 Client Secret을 환경 변수에 설정

### Development Tools

- **Bundler**: Turbopack (Next.js 15)
- **Linting**: ESLint 9
- **Package Manager**: npm
- **Type Checking**: TypeScript

---

## 📁 프로젝트 구조

```
editor-next/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API Routes
│   │   │   ├── auth/          # 인증 관련 API
│   │   │   ├── documents/     # 문서 관리 API
│   │   │   └── folders/       # 폴더 관리 API
│   │   ├── auth/              # 인증 페이지
│   │   ├── documents/         # 문서 관련 페이지
│   │   ├── dashboard/         # 대시보드
│   │   ├── globals.css        # 전역 스타일
│   │   └── layout.tsx         # 루트 레이아웃
│   ├── components/            # React 컴포넌트
│   │   ├── auth/              # 인증 관련 컴포넌트
│   │   ├── editor/            # 에디터 컴포넌트
│   │   ├── layout/            # 레이아웃 컴포넌트
│   │   └── ui/                # UI 컴포넌트 (shadcn/ui)
│   ├── lib/                   # 유틸리티 및 설정
│   │   ├── mongodb.ts         # MongoDB 연결
│   │   └── utils.ts           # 유틸리티 함수
│   └── store/                 # 상태 관리 (Zustand)
├── public/                    # 정적 파일
├── database_specification.md  # DB 스펙 문서
├── 엔티티.xml                # ERD 다이어그램
└── package.json              # 프로젝트 설정
```

---

## 🗄️ 데이터베이스 스키마

### MongoDB Collections

#### 1. Users (사용자)

```typescript
interface User {
  _id: ObjectId;
  email: string; // 로그인 ID (unique)
  hashedPassword: string; // 암호화된 비밀번호
  name: string; // 사용자 표시 이름
  avatarUrl: string; // 프로필 이미지 URL
  createdAt: Date; // 계정 생성일시
  updatedAt: Date; // 정보 수정일시
  deletedAt?: Date; // 소프트 삭제 (optional)
}
```

#### 2. Documents (문서)

```typescript
interface Document {
  _id: ObjectId;
  title: string; // 문서 제목
  content: BlockNoteContent[]; // BlockNote 에디터 콘텐츠
  author: string; // 작성자 이메일
  folderId?: string; // 폴더 ID (optional)
  icon?: string; // 문서 아이콘 (optional)
  isLocked?: boolean; // 편집 잠금 상태
  isDeleted?: boolean; // 소프트 삭제 상태
  createdAt: Date; // 생성일시
  updatedAt: Date; // 수정일시
}
```

#### 3. Folders (폴더)

```typescript
interface Folder {
  _id: ObjectId;
  name: string; // 폴더 이름
  description?: string; // 폴더 설명 (optional)
  author: string; // 생성자 이메일
  parentId?: string; // 상위 폴더 ID (optional)
  isDeleted?: boolean; // 소프트 삭제 상태
  createdAt: Date; // 생성일시
  updatedAt: Date; // 수정일시
}
```

#### 4. NextAuth Collections

```typescript
// NextAuth.js에서 자동 생성되는 컬렉션들
interface Account {
  _id: ObjectId;
  userId: ObjectId;
  type: string;
  provider: string;
  providerAccountId: string;
  refresh_token?: string;
  access_token?: string;
  expires_at?: number;
  token_type?: string;
  scope?: string;
  id_token?: string;
  session_state?: string;
}

interface Session {
  _id: ObjectId;
  sessionToken: string;
  userId: ObjectId;
  expires: Date;
}

interface VerificationToken {
  _id: ObjectId;
  identifier: string;
  token: string;
  expires: Date;
}
```

### BlockNote Content 구조

```typescript
interface BlockNoteContent {
  id: string;
  type: 'paragraph' | 'heading' | 'list' | 'quote' | 'code';
  props: {
    textColor?: string;
    backgroundColor?: string;
    textAlignment?: 'left' | 'center' | 'right';
    level?: number; // heading level
  };
  content: BlockNoteInlineContent[];
  children: BlockNoteContent[];
}

interface BlockNoteInlineContent {
  type: 'text' | 'link' | 'image';
  text: string;
  styles?: {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strikethrough?: boolean;
  };
  props?: Record<string, any>;
}
```

---

## 🔌 API 엔드포인트

### 인증 API (`/api/auth`)

- `GET /api/auth/signin` - 로그인 페이지
- `GET /api/auth/signup` - 회원가입 페이지
- `POST /api/auth/signup` - 회원가입 처리
- `[...nextauth]` - NextAuth.js 핸들러

### 문서 API (`/api/documents`)

- `GET /api/documents` - 문서 목록 조회
- `POST /api/documents` - 새 문서 생성
- `GET /api/documents/[id]` - 특정 문서 조회
- `PUT /api/documents/[id]` - 문서 수정
- `DELETE /api/documents/[id]` - 문서 삭제
- `GET /api/documents/trash` - 휴지통 문서 조회

### 폴더 API (`/api/folders`)

- `GET /api/folders` - 폴더 목록 조회
- `POST /api/folders` - 새 폴더 생성
- `GET /api/folders/[id]` - 특정 폴더 조회
- `PUT /api/folders/[id]` - 폴더 수정
- `DELETE /api/folders/[id]` - 폴더 삭제

### API 응답 형식

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
```

---

## 🔐 인증 시스템

### NextAuth.js 설정

- **Provider**: GitHub OAuth + Credentials (이메일/비밀번호)
- **Adapter**: MongoDB Adapter
- **Session Strategy**: JWT
- **Database**: MongoDB Collections (users, accounts, sessions, verificationTokens)

### 인증 플로우

1. **회원가입**: 이메일/비밀번호 → bcryptjs 해싱 → MongoDB 저장
2. **로그인**: 이메일/비밀번호 → bcryptjs 검증 → JWT 토큰 생성
3. **GitHub OAuth**: GitHub 계정으로 소셜 로그인
4. **세션 관리**: JWT 토큰 기반 세션 유지
5. **권한 검증**: API 요청 시 세션 검증

### 보안 기능

- 비밀번호 bcryptjs 해싱
- JWT 토큰 기반 인증
- API 라우트 보호
- 세션 만료 관리

---

## 📊 상태 관리

### Zustand Store 구조

#### Layout Store (`use-layout-store.ts`)

```typescript
interface LayoutStore {
  isMinimized: boolean;
  sidebarUpdateTrigger: number;
  toggleMinimize: () => void;
  triggerSidebarUpdate: () => void;
}
```

#### Auth Store (`use-auth-store.ts`)

```typescript
interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
}
```

#### Document Store (`use-doc-store.ts`)

```typescript
interface DocumentStore {
  currentDocument: Document | null;
  documents: Document[];
  setCurrentDocument: (doc: Document | null) => void;
  updateDocuments: (docs: Document[]) => void;
}
```

---

## 🎨 UI/UX 컴포넌트

### 컴포넌트 계층 구조

#### 1. Layout Components

- `MainLayout.tsx` - 메인 레이아웃
- `Navbar.tsx` - 네비게이션 바
- `Sidebar.tsx` - 사이드바 (문서/폴더 목록)
- `DocumentHeader.tsx` - 문서 헤더

#### 2. Editor Components

- `BlockNoteEditor.tsx` - BlockNote 에디터 래퍼
- `DocumentTitle.tsx` - 문서 제목 편집 컴포넌트
- `DocumentContent.tsx` - 문서 본문 컴포넌트

#### 3. Auth Components

- `AuthGuard.tsx` - 인증 보호 컴포넌트
- `SessionWrapper.tsx` - 세션 래퍼

#### 4. UI Components (shadcn/ui)

- `Button.tsx` - 버튼 컴포넌트
- `Dialog.tsx` - 다이얼로그 컴포넌트
- `DropdownMenu.tsx` - 드롭다운 메뉴
- `Switch.tsx` - 스위치 컴포넌트
- `Avatar.tsx` - 아바타 컴포넌트

### 디자인 시스템

- **Color Scheme**: Tailwind CSS 기반 색상 팔레트
- **Typography**: Pretendard 폰트 패밀리
- **Spacing**: Tailwind CSS spacing scale
- **Components**: shadcn/ui + Radix UI 기반

---

## 🔤 폰트 시스템

### 폰트 우선순위

1. **Pretendard** (한국어 최적화)
2. **Inter** (Google Fonts - 모던한 영문)
3. **Noto Sans KR** (Google Fonts - 한글 지원)
4. **Roboto** (Google UI 폰트)

### 폰트 로딩 방식

- **Pretendard**: CDN을 통한 로딩
- **Google Fonts**: Next.js `next/font/google` 최적화
- **성능 최적화**: `display: 'swap'` 설정

### CSS 변수 설정

```css
--font-sans: 'Pretendard', var(--font-inter), var(--font-noto-sans-kr), var(
    --font-roboto
  ), ...;
```

---

## ⚡ 성능 최적화

### Next.js 최적화

- **App Router**: 서버 컴포넌트 활용
- **Turbopack**: 빠른 개발 서버
- **Image Optimization**: Next.js Image 컴포넌트
- **Font Optimization**: `next/font` 사용

### MongoDB 최적화

- **Connection Pooling**: 최대 10개 연결
- **Indexing**: 자주 조회되는 필드 인덱싱
- **Projection**: 필요한 필드만 조회
- **Pagination**: limit/offset 사용

### React 최적화

- **Memoization**: useMemo, useCallback 활용
- **Code Splitting**: 동적 import
- **Bundle Optimization**: Tree shaking

### 에디터 최적화

- **Debouncing**: 500ms 디바운스로 자동 저장
- **Lazy Loading**: BlockNote 에디터 지연 로딩
- **Content Validation**: 유효한 콘텐츠 구조 검증

---

## 🔒 보안

### 인증 보안

- **Password Hashing**: bcryptjs 사용
- **JWT Tokens**: 안전한 세션 관리
- **Session Validation**: API 요청 시 세션 검증
- **CSRF Protection**: NextAuth.js 내장 보호

### 데이터 보안

- **Input Validation**: 사용자 입력 검증
- **SQL Injection Prevention**: MongoDB 드라이버 사용
- **XSS Protection**: React 내장 보호
- **Content Security Policy**: CSP 헤더 설정

### API 보안

- **Rate Limiting**: 요청 제한 (구현 예정)
- **CORS**: Cross-Origin 요청 제어
- **Error Handling**: 민감한 정보 노출 방지

---

## 🚀 배포

### 환경 변수

```env
# Database
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/
MONGODB_DATABASE=editor_lumir

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# GitHub OAuth
GITHUB_ID=your-github-client-id
GITHUB_SECRET=your-github-client-secret

# Environment
NODE_ENV=development
```

### 빌드 프로세스

1. **Development**: `npm run dev` (Turbopack)
2. **Production Build**: `npm run build`
3. **Production Start**: `npm run start`

### 배포 플랫폼

- **Vercel**: Next.js 최적화 배포
- **Netlify**: 정적 사이트 배포
- **Docker**: 컨테이너화 배포

---

## 📈 향후 계획

### 단기 계획 (1-2개월)

- [ ] 실시간 협업 기능
- [ ] 문서 버전 관리
- [ ] 문서 템플릿 시스템
- [ ] 고급 검색 기능

### 중기 계획 (3-6개월)

- [ ] 팀 협업 기능
- [ ] 문서 공유 및 권한 관리
- [ ] API 문서화
- [ ] 모바일 앱 개발

### 장기 계획 (6개월 이상)

- [ ] AI 기반 문서 작성 도우미
- [ ] 다국어 지원
- [ ] 엔터프라이즈 기능
- [ ] 마이크로서비스 아키텍처

---

## 📚 참고 자료

- [Next.js Documentation](https://nextjs.org/docs)
- [BlockNote Documentation](https://www.blocknotejs.org/)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/)

---

## 🤝 기여 가이드

### 개발 환경 설정

1. Repository 클론
2. `npm install` 실행
3. 환경 변수 설정
4. `npm run dev` 실행

### 코드 컨벤션

- **TypeScript**: 엄격한 타입 체크
- **ESLint**: 코드 품질 관리
- **Prettier**: 코드 포맷팅
- **Conventional Commits**: 커밋 메시지 규칙

### 테스트

- **Unit Tests**: Jest + React Testing Library
- **Integration Tests**: API 엔드포인트 테스트
- **E2E Tests**: Playwright (구현 예정)

---

_이 문서는 프로젝트의 현재 상태를 반영하며, 지속적으로 업데이트됩니다._
