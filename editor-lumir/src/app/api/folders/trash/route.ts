import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import {
  getAuthenticatedUserId,
  createSuccessResponse,
  createErrorResponse,
  handleApiError,
} from '@/lib/api-utils';
import { ObjectId } from 'mongodb';

// GET /api/folders/trash - 삭제된 폴더 목록 조회
export async function GET() {
  try {
    const userId = await getAuthenticatedUserId();
    const { db } = await connectToDatabase();

    const deletedFolders = await db
      .collection('folders')
      .find({
        user: userId,
        deletedAt: { $exists: true },
      })
      .sort({ deletedAt: -1 })
      .toArray();

    return createSuccessResponse(
      deletedFolders.map((folder) => ({
        ...folder,
        _id: folder._id.toString(),
        user: folder.user.toString(),
        parentId: folder.parentId ? folder.parentId.toString() : null,
      })),
    );
  } catch (error) {
    return handleApiError(error, '휴지통 폴더 목록 조회');
  }
}

// POST /api/folders/trash/restore - 폴더 복원
export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId();
    const { folderIds } = await request.json();

    if (!Array.isArray(folderIds) || folderIds.length === 0) {
      return createErrorResponse('복원할 폴더 ID 배열이 필요합니다.', 400);
    }

    const { db } = await connectToDatabase();

    const result = await db.collection('folders').updateMany(
      {
        _id: { $in: folderIds.map((id: string) => new ObjectId(id)) },
        user: userId,
        deletedAt: { $exists: true },
      },
      {
        $unset: { deletedAt: '' },
        $set: { updatedAt: new Date() },
      },
    );

    return createSuccessResponse(
      { restoredCount: result.modifiedCount },
      `${result.modifiedCount}개의 폴더가 복원되었습니다.`,
    );
  } catch (error) {
    return handleApiError(error, '폴더 복원');
  }
}
