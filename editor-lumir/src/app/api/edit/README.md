# Edit API 구조

이 문서는 `/api/edit/` 하위의 API 구조와 각 폴더의 목적을 설명합니다.

## 📁 전체 구조

```
/api/edit/
├── mount/                    # 페이지 전체 마운트 (통합 데이터)
├── sidebar/                  # 사이드바 관련 기능
│   ├── documents/           # 문서 목록 관리
│   ├── folders/             # 폴더 목록 관리
│   └── user/                # 사용자 정보 관리
├── document-header/          # 문서 헤더 관련 기능
│   ├── lock/                # 문서 잠금/해제
│   ├── trash/               # 문서 휴지통 이동
│   └── share/               # 문서 공유
└── document-content/         # 문서 내용 관련 기능
    ├── create/              # 새 문서 생성
    └── [id]/                # 특정 문서 조회/수정
```

## 🔧 각 폴더별 목적 및 기능

### 1. `/mount/` - 페이지 전체 마운트

**목적**: 페이지 로드 시 필요한 모든 데이터를 한 번에 가져옴

- **GET**: 사용자, 문서, 폴더 정보를 통합하여 반환
- **응답**: `{ sidebar: {...}, documentHeader: {...}, documentContent: {...} }`

### 2. `/sidebar/` - 사이드바 관련 기능

#### 2.1 `/sidebar/documents/`

**목적**: 사이드바에서 문서 목록 관리

- **GET**: 사용자의 모든 문서 목록 조회
- **POST**: 새 문서 생성
- **PUT**: 문서 정보 업데이트
- **DELETE**: 문서 삭제

#### 2.2 `/sidebar/folders/`

**목적**: 사이드바에서 폴더 목록 관리

- **GET**: 사용자의 모든 폴더 목록 조회
- **POST**: 새 폴더 생성
- **PUT**: 폴더 정보 업데이트
- **DELETE**: 폴더 삭제

#### 2.3 `/sidebar/user/`

**목적**: 사이드바에서 사용자 정보 관리

- **GET**: 현재 사용자 정보 조회
- **PUT**: 사용자 정보 업데이트 (이름, 아바타 등)

### 3. `/document-header/` - 문서 헤더 관련 기능

#### 3.1 `/document-header/lock/`

**목적**: 문서 잠금/해제 기능

- **PUT**: 문서 잠금 상태 토글
- **요청**: `{ documentId: string, isLocked: boolean }`
- **응답**: `{ success: boolean, isLocked: boolean }`

#### 3.2 `/document-header/trash/`

**목적**: 문서 휴지통 이동 기능

- **PUT**: 문서를 휴지통으로 이동 (soft delete)
- **요청**: `{ documentId: string }`
- **응답**: `{ success: boolean, message: string }`

#### 3.3 `/document-header/share/`

**목적**: 문서 공유 기능

- **POST**: 문서 공유 링크 생성
- **GET**: 문서 공유 정보 조회
- **DELETE**: 문서 공유 해제
- **요청**: `{ documentId: string, shareType: string, permissions: string[] }`
- **응답**: `{ success: boolean, shareLink: string, shareToken: string }`

### 4. `/document-content/` - 문서 내용 관련 기능

#### 4.1 `/document-content/create/`

**목적**: 새 문서 생성

- **POST**: 새 문서 생성
- **요청**: `{ title: string, content: any[], folderId?: string }`
- **응답**: 생성된 문서 정보

#### 4.2 `/document-content/[id]/`

**목적**: 특정 문서 조회 및 수정

- **GET**: 특정 문서 조회
- **PUT**: 문서 내용 업데이트
- **요청**: `{ title?: string, content?: any[], folderId?: string, isLocked?: boolean }`
- **응답**: 업데이트된 문서 정보

## 🔐 인증 및 권한

모든 API는 다음 인증 절차를 거칩니다:

1. **세션 확인**: `auth()` 함수로 현재 세션 확인
2. **사용자 조회**: 세션의 이메일로 사용자 정보 조회
3. **권한 확인**: 문서/폴더 소유자 확인
4. **데이터 처리**: 권한이 있는 경우에만 데이터 처리

## 📊 데이터베이스 스키마

### Documents Collection

```javascript
{
  _id: ObjectId,
  title: string,
  content: array,
  author: ObjectId, // users collection 참조
  folderId: ObjectId, // folders collection 참조 (선택사항)
  isLocked: boolean,
  isDeleted: boolean,
  order: number,
  createdAt: Date,
  updatedAt: Date
}
```

### Folders Collection

```javascript
{
  _id: ObjectId,
  name: string,
  author: ObjectId, // users collection 참조
  parentId: ObjectId, // folders collection 참조 (선택사항)
  isDeleted: boolean,
  order: number,
  createdAt: Date,
  updatedAt: Date
}
```

### Users Collection

```javascript
{
  _id: ObjectId,
  email: string,
  name: string,
  hashedPassword: string,
  avatarUrl: string,
  createdAt: Date,
  updatedAt: Date,
  deletedAt: Date
}
```

### Document Shares Collection

```javascript
{
  _id: ObjectId,
  documentId: ObjectId, // documents collection 참조
  author: ObjectId, // users collection 참조
  shareType: string, // 'public', 'private', 'restricted'
  permissions: array, // ['read', 'write', 'comment']
  shareToken: string,
  isActive: boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## 🚀 사용 예시

### 문서 생성

```javascript
const response = await fetch('/api/edit/sidebar/documents', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: '새 문서',
    content: [],
    folderId: null,
  }),
});
```

### 문서 잠금

```javascript
const response = await fetch('/api/edit/document-header/lock', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    documentId: 'document_id',
    isLocked: true,
  }),
});
```

### 문서 공유

```javascript
const response = await fetch('/api/edit/document-header/share', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    documentId: 'document_id',
    shareType: 'public',
    permissions: ['read'],
  }),
});
```

## 🔄 에러 처리

모든 API는 일관된 에러 응답 형식을 사용합니다:

```javascript
{
  error: string, // 에러 메시지
  status: number // HTTP 상태 코드
}
```

일반적인 상태 코드:

- `200`: 성공
- `201`: 생성 성공
- `400`: 잘못된 요청
- `401`: 인증 실패
- `404`: 리소스를 찾을 수 없음
- `500`: 서버 내부 오류
