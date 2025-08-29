import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import {
  getAuthenticatedUserId,
  createSuccessResponse,
  createErrorResponse,
  handleApiError,
  validateObjectId,
} from '@/lib/api-utils';

// PUT /api/folders/[id]/expand - 폴더 확장 상태 업데이트
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userId = await getAuthenticatedUserId();
    const { id } = await params;
    const folderId = validateObjectId(id);
    const { isExpanded } = await request.json();

    // 입력 검증
    if (typeof isExpanded !== 'boolean') {
      return createErrorResponse(
        'isExpanded 필드는 boolean 타입이어야 합니다.',
        400,
      );
    }

    const { db } = await connectToDatabase();

    // 폴더 존재 및 권한 확인
    const existingFolder = await db.collection('folders').findOne({
      _id: folderId,
      user: userId,
      deletedAt: { $exists: false },
    });

    if (!existingFolder) {
      return createErrorResponse('폴더를 찾을 수 없습니다.', 404);
    }

    // 확장 상태 업데이트
    const result = await db.collection('folders').updateOne(
      {
        _id: folderId,
        user: userId,
        deletedAt: { $exists: false },
      },
      {
        $set: {
          isExpanded: isExpanded,
          updatedAt: new Date(),
        },
      },
    );

    if (result.matchedCount === 0) {
      return createErrorResponse('폴더를 찾을 수 없습니다.', 404);
    }

    return createSuccessResponse(
      {
        message: '폴더 확장 상태가 업데이트되었습니다.',
        folderId: folderId.toString(),
        isExpanded: isExpanded,
      },
      '폴더 확장 상태가 성공적으로 업데이트되었습니다.',
    );
  } catch (error) {
    console.error('폴더 확장 상태 업데이트 에러:', error);
    return handleApiError(error, '폴더 확장 상태 업데이트');
  }
}
