import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import {
  getAuthenticatedUserId,
  createSuccessResponse,
  createErrorResponse,
  handleApiError,
  validateObjectId,
} from '@/lib/api-utils';

// GET /api/folders/[id] - 특정 폴더 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userId = await getAuthenticatedUserId();
    const { id } = await params;
    const folderId = validateObjectId(id);

    const { db } = await connectToDatabase();

    const folder = await db.collection('folders').findOne({
      _id: folderId,
      user: userId,
      deletedAt: { $exists: false },
    });

    if (!folder) {
      return createErrorResponse('폴더를 찾을 수 없습니다.', 404);
    }

    return createSuccessResponse({
      ...folder,
      _id: folder._id.toString(),
      user: folder.user.toString(),
      parentId: folder.parentId ? folder.parentId.toString() : null,
    });
  } catch (error) {
    return handleApiError(error, '폴더 조회');
  }
}

// PUT /api/folders/[id] - 폴더 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userId = await getAuthenticatedUserId();
    const { id } = await params;
    const folderId = validateObjectId(id);
    const { name, description, parentId, order, isExpanded } =
      await request.json();

    const { db } = await connectToDatabase();

    const updateData: any = { updatedAt: new Date() };
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined)
      updateData.description = description?.trim() || '';
    if (parentId !== undefined) {
      updateData.parentId = parentId ? new ObjectId(parentId) : null;
    }
    if (order !== undefined) {
      updateData.order = order;
    }
    if (isExpanded !== undefined) {
      updateData.isExpanded = isExpanded;
    }

    const result = await db.collection('folders').updateOne(
      {
        _id: folderId,
        user: userId,
        deletedAt: { $exists: false },
      },
      { $set: updateData },
    );

    if (result.matchedCount === 0) {
      console.error('폴더를 찾을 수 없음:', folderId.toString());
      return createErrorResponse('폴더를 찾을 수 없습니다.', 404);
    }

    // 업데이트된 폴더 정보 조회
    const updatedFolder = await db.collection('folders').findOne({
      _id: folderId,
      user: userId,
      deletedAt: { $exists: false },
    });

    return createSuccessResponse(
      {
        message: '폴더가 업데이트되었습니다.',
        folder: {
          _id: updatedFolder?._id.toString(),
          name: updatedFolder?.name,
          parentId: updatedFolder?.parentId?.toString() || null,
        },
      },
      '폴더가 성공적으로 수정되었습니다.',
    );
  } catch (error) {
    console.error('폴더 수정 에러:', error);
    return handleApiError(error, '폴더 수정');
  }
}

// DELETE /api/folders/[id] - 폴더 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userId = await getAuthenticatedUserId();
    const { id } = await params;
    const folderId = validateObjectId(id);

    const { searchParams } = new URL(request.url);
    const permanent = searchParams.get('permanent') === 'true';

    const { db } = await connectToDatabase();

    if (permanent) {
      // 영구 삭제
      const result = await db.collection('folders').deleteOne({
        _id: folderId,
        user: userId,
      });

      if (result.deletedCount === 0) {
        return createErrorResponse('폴더를 찾을 수 없습니다.', 404);
      }
    } else {
      // 소프트 삭제 (휴지통으로 이동)
      const result = await db.collection('folders').updateOne(
        {
          _id: folderId,
          user: userId,
          $or: [{ isDeleted: { $exists: false } }, { isDeleted: false }],
        },
        {
          $set: {
            isDeleted: true,
            isHiddenFromTrash: false, // 휴지통에 표시
            deletedAt: new Date(),
            updatedAt: new Date(),
          },
        },
      );

      if (result.matchedCount === 0) {
        return createErrorResponse('폴더를 찾을 수 없습니다.', 404);
      }
    }

    return createSuccessResponse(
      { message: '폴더가 삭제되었습니다.' },
      '폴더가 성공적으로 삭제되었습니다.',
    );
  } catch (error) {
    return handleApiError(error, '폴더 삭제');
  }
}
