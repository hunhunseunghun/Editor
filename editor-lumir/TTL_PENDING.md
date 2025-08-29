# ⏸️ TTL 기능 펜딩 처리

## 📋 펜딩 처리된 기능

### **1. TTL 인덱스 생성**

- **Documents 컬렉션**: `{ deletedAt: 1 }` TTL 인덱스
- **Folders 컬렉션**: `{ deletedAt: 1 }` TTL 인덱스
- **설정**: 30일 후 자동 삭제

### **2. 펜딩 처리된 파일들**

#### **A. config.ts**

```typescript
// TTL 인덱스 설정 주석 처리
// TTL_INDEXES: {
//   DOCUMENTS: {
//     field: 'deletedAt',
//     expireAfterSeconds: 30 * 24 * 60 * 60, // 30일
//     partialFilterExpression: { isDeleted: true },
//   },
//   FOLDERS: {
//     field: 'deletedAt',
//     expireAfterSeconds: 30 * 24 * 60 * 60, // 30일
//     partialFilterExpression: { isDeleted: true },
//   },
// },
```

#### **B. lib/database/utils.ts**

```typescript
// TTL 인덱스 생성 코드 주석 처리
// await db.collection(DATABASE_CONFIG.COLLECTIONS.DOCUMENTS).createIndex(
//   { deletedAt: 1 },
//   {
//     expireAfterSeconds: 30 * 24 * 60 * 60, // 30일
//     partialFilterExpression: { isDeleted: true },
//     name: 'deletedAt_1_ttl',
//   },
// );
```

#### **C. scripts/create-trash-indexes.js**

```javascript
// TTL 인덱스 생성 코드 주석 처리
// await db.collection('documents').createIndex(
//   { deletedAt: 1 },
//   {
//     expireAfterSeconds: 30 * 24 * 60 * 60, // 30일
//     partialFilterExpression: { isDeleted: true },
//     name: 'deletedAt_1_ttl',
//   },
// );
```

## 🎯 현재 구현된 기능

### **1. 기본 휴지통 인덱스**

- ✅ `{ isDeleted: 1, deletedAt: 1 }` - 휴지통 조회용
- ✅ `{ author: 1, isDeleted: 1, deletedAt: 1 }` - 사용자별 휴지통 조회
- ✅ `{ user: 1, isDeleted: 1, deletedAt: 1 }` - 사용자별 휴지통 조회

### **2. 휴지통 기능**

- ✅ Soft Delete (실제 삭제 대신 isDeleted=true로 변경)
- ✅ 휴지통 조회
- ✅ 복원 기능
- ✅ 영구 삭제 기능

## 🔄 TTL 기능 활성화 방법

### **1. 언제 활성화할지**

- 기본 휴지통 기능이 안정화된 후
- 사용자 피드백 수집 후
- 성능 최적화가 필요한 시점

### **2. 활성화 단계**

1. **config.ts**: TTL_INDEXES 주석 해제
2. **lib/database/utils.ts**: TTL 인덱스 생성 코드 주석 해제
3. **scripts/create-trash-indexes.js**: TTL 인덱스 생성 코드 주석 해제
4. **인덱스 재생성**: `npm run create-indexes` 실행

### **3. TTL 기능 활성화 시 고려사항**

- **데이터 손실 위험**: 30일 후 자동 삭제
- **사용자 알림**: TTL 기능 활성화 시 사용자에게 알림
- **백업 전략**: 중요한 데이터 백업 방안 고려
- **복구 방안**: 실수로 삭제된 데이터 복구 방법

## 📝 대안 방안

### **1. 수동 정리**

```typescript
// 주기적으로 오래된 휴지통 항목 정리
const cleanupOldTrash = async () => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  await db.collection('documents').deleteMany({
    isDeleted: true,
    deletedAt: { $lt: thirtyDaysAgo },
  });

  await db.collection('folders').deleteMany({
    isDeleted: true,
    deletedAt: { $lt: thirtyDaysAgo },
  });
};
```

### **2. 사용자 설정**

```typescript
// 사용자가 TTL 기간을 설정할 수 있도록
interface UserSettings {
  trashRetentionDays: number; // 7, 30, 90, 365일
  autoCleanupEnabled: boolean;
}
```

### **3. 경고 시스템**

```typescript
// 삭제 예정 항목에 대한 경고
const getExpiringItems = async (userId: string) => {
  const warningDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7일 전

  return await db
    .collection('documents')
    .find({
      author: userId,
      isDeleted: true,
      deletedAt: { $lt: warningDate },
    })
    .toArray();
};
```

---

**📅 펜딩 처리일**: 2024년 8월 5일  
**👤 처리자**: 개발팀  
**📋 상태**: 기본 휴지통 기능 우선 구현
