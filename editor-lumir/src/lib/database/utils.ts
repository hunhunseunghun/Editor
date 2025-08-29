import { ObjectId } from 'mongodb';
import { connectToDatabase } from '@/lib/mongodb';
import { DATABASE_CONFIG } from '@/constants/config';

// ============================================================================
// 데이터베이스 유틸리티
// ============================================================================

/**
 * 안전하게 ObjectId를 생성하는 함수
 * @param id - 문자열 ID
 * @returns ObjectId 또는 null (유효하지 않은 경우)
 */
export function safeObjectId(id: string): ObjectId | null {
  try {
    return new ObjectId(id);
  } catch {
    return null;
  }
}

/**
 * ObjectId를 검증하고 반환하는 함수
 * @param id - 문자열 ID
 * @returns ObjectId
 * @throws 유효하지 않은 ID 형식인 경우 에러
 */
export function validateObjectId(id: string): ObjectId {
  // 임시 ID 체크 (낙관적 업데이트에서 생성된 임시 항목)
  if (id.startsWith('temp_')) {
    throw new Error('임시 ID는 데이터베이스 작업에 사용할 수 없습니다.');
  }

  const objectId = safeObjectId(id);
  if (!objectId) {
    throw new Error('유효하지 않은 ID 형식입니다.');
  }
  return objectId;
}

/**
 * 배치 업데이트를 수행하는 함수
 * @param collection - 컬렉션 이름
 * @param updates - 업데이트 배열
 * @param userId - 사용자 ObjectId
 * @returns 배치 업데이트 결과
 */
export async function batchUpdate(
  collection: string,
  updates: Array<{ filter: Record<string, any>; update: Record<string, any> }>,
  userId: ObjectId,
) {
  const { db } = await connectToDatabase();
  const bulkOps = updates.map(({ filter, update }) => ({
    updateOne: {
      filter: { ...filter, $or: [{ author: userId }, { user: userId }] },
      update: { $set: { ...update, updatedAt: new Date() } },
    },
  }));

  if (bulkOps.length > 0) {
    return await db.collection(collection).bulkWrite(bulkOps);
  }
  return { modifiedCount: 0 };
}

/**
 * 휴지통 관련 인덱스를 생성하는 함수
 * @returns 인덱스 생성 결과
 */
export async function createTrashIndexes() {
  const { db } = await connectToDatabase();

  try {
    // Documents 컬렉션 인덱스 생성
    await db
      .collection(DATABASE_CONFIG.COLLECTIONS.DOCUMENTS)
      .createIndex(
        { isDeleted: 1, deletedAt: 1 },
        { background: true, name: 'isDeleted_1_deletedAt_1' },
      );

    await db
      .collection(DATABASE_CONFIG.COLLECTIONS.DOCUMENTS)
      .createIndex(
        { author: 1, isDeleted: 1, deletedAt: 1 },
        { background: true, name: 'author_1_isDeleted_1_deletedAt_1' },
      );

    // Documents 휴지통 숨김 인덱스 생성
    await db
      .collection(DATABASE_CONFIG.COLLECTIONS.DOCUMENTS)
      .createIndex(
        { isDeleted: 1, isHiddenFromTrash: 1 },
        { background: true, name: 'isDeleted_1_isHiddenFromTrash_1' },
      );

    await db
      .collection(DATABASE_CONFIG.COLLECTIONS.DOCUMENTS)
      .createIndex(
        { author: 1, isDeleted: 1, isHiddenFromTrash: 1 },
        { background: true, name: 'author_1_isDeleted_1_isHiddenFromTrash_1' },
      );

    // Documents TTL 인덱스 생성 (펜딩)
    // await db.collection(DATABASE_CONFIG.COLLECTIONS.DOCUMENTS).createIndex(
    //   { deletedAt: 1 },
    //   {
    //     expireAfterSeconds: 30 * 24 * 60 * 60, // 30일
    //     partialFilterExpression: { isDeleted: true },
    //     name: 'deletedAt_1_ttl',
    //   },
    // );

    // Folders 컬렉션 인덱스 생성
    await db
      .collection(DATABASE_CONFIG.COLLECTIONS.FOLDERS)
      .createIndex(
        { isDeleted: 1, deletedAt: 1 },
        { background: true, name: 'isDeleted_1_deletedAt_1' },
      );

    await db
      .collection(DATABASE_CONFIG.COLLECTIONS.FOLDERS)
      .createIndex(
        { user: 1, isDeleted: 1, deletedAt: 1 },
        { background: true, name: 'user_1_isDeleted_1_deletedAt_1' },
      );

    // Folders 휴지통 숨김 인덱스 생성
    await db
      .collection(DATABASE_CONFIG.COLLECTIONS.FOLDERS)
      .createIndex(
        { isDeleted: 1, isHiddenFromTrash: 1 },
        { background: true, name: 'isDeleted_1_isHiddenFromTrash_1' },
      );

    await db
      .collection(DATABASE_CONFIG.COLLECTIONS.FOLDERS)
      .createIndex(
        { user: 1, isDeleted: 1, isHiddenFromTrash: 1 },
        { background: true, name: 'user_1_isDeleted_1_isHiddenFromTrash_1' },
      );

    // Folders TTL 인덱스 생성 (펜딩)
    // await db.collection(DATABASE_CONFIG.COLLECTIONS.FOLDERS).createIndex(
    //   { deletedAt: 1 },
    //   {
    //     expireAfterSeconds: 30 * 24 * 60 * 60, // 30일
    //     partialFilterExpression: { isDeleted: true },
    //     name: 'deletedAt_1_ttl',
    //   },
    // );

    return {
      success: true,
      message: '휴지통 인덱스가 성공적으로 생성되었습니다.',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류',
    };
  }
}

/**
 * 데이터베이스 초기화 함수 (인덱스 생성 포함)
 * @returns 초기화 결과
 */
export async function initializeDatabase() {
  try {
    // 휴지통 인덱스 생성
    const result = await createTrashIndexes();

    return result;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류',
    };
  }
}
