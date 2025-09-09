import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { connectToDatabase } from '@/lib/mongodb';
import {
  createSuccessResponse,
  createErrorResponse,
  handleApiError,
} from '@/lib/api-utils';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return createErrorResponse('인증이 필요합니다.', 401);
    }

    const { db } = await connectToDatabase();

    // 사용자 조회
    const user = await db
      .collection('users')
      .findOne({ email: session.user.email });
    if (!user) {
      return createErrorResponse('사용자를 찾을 수 없습니다.', 404);
    }

    // 휴지통에서 삭제된 폴더 조회 (isHiddenFromTrash: false인 것만)
    const folders = await db
      .collection('folders')
      .find({
        user: user._id,
        isDeleted: true,
        isHiddenFromTrash: false, // 휴지통에서 숨겨지지 않은 것만
      })
      .sort({ deletedAt: -1 }) // 최근 삭제된 순으로 정렬
      .toArray();

    // ObjectId를 문자열로 변환
    const formattedFolders = folders.map((folder) => ({
      ...folder,
      _id: folder._id.toString(),
      user: folder.user.toString(),
      parentId: folder.parentId ? folder.parentId.toString() : null,
    }));

    return createSuccessResponse(
      formattedFolders,
      '휴지통 폴더 목록을 성공적으로 조회했습니다.',
    );
  } catch (error) {
    return handleApiError(error, '휴지통 폴더 조회');
  }
}
