import { auth } from '@/lib/auth/auth';
import { connectToDatabase } from '@/lib/mongodb';

// ============================================================================
// 인증 및 사용자 관련 유틸리티
// ============================================================================

/**
 * 인증된 사용자 정보를 가져오는 함수
 * @returns 인증된 사용자 정보
 * @throws 인증되지 않은 경우 에러
 */
export async function getAuthenticatedUser() {
  const session = await auth();
  if (!session?.user?.email) {
    throw new Error('인증이 필요합니다.');
  }
  return session.user;
}

/**
 * 이메일로 사용자의 ObjectId를 조회하는 함수
 * @param email - 사용자 이메일
 * @returns 사용자의 ObjectId
 * @throws 이메일이 없거나 사용자를 찾을 수 없는 경우 에러
 */
export async function getUserObjectId(email: string | null | undefined) {
  if (!email) {
    throw new Error('이메일이 필요합니다.');
  }

  const { db } = await connectToDatabase();
  const user = await db.collection('users').findOne({ email });

  if (!user) {
    throw new Error('사용자를 찾을 수 없습니다. 다시 로그인해주세요.');
  }

  return user._id;
}

/**
 * 현재 인증된 사용자의 ObjectId를 가져오는 함수
 * @returns 인증된 사용자의 ObjectId
 * @throws 인증되지 않은 경우 에러
 */
export async function getAuthenticatedUserId() {
  const user = await getAuthenticatedUser();
  return await getUserObjectId(user.email);
}

export async function getCurrentUser() {
  const session = await auth();

  if (!session?.user?.email) {
    return null;
  }

  return session.user;
}
