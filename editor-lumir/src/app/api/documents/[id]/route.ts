import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

const COLLECTIONS = {
  DOCUMENTS: 'documents',
  USERS: 'users',
};

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 },
      );
    }

    const resolvedParams = await params;
    const { id } = resolvedParams;
    const { title, content, folderId, isLocked, order } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: '문서 ID가 필요합니다.' },
        { status: 400 },
      );
    }

    // MongoDB 연결
    const { db } = await connectToDatabase();

    // 사용자 조회
    const user = await db
      .collection('users')
      .findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 },
      );
    }

    // 임시 ID 체크 (낙관적 업데이트에서 생성된 임시 항목)
    if (id.startsWith('temp_')) {
      return NextResponse.json(
        { success: false, error: '임시 문서는 업데이트할 수 없습니다.' },
        { status: 400 },
      );
    }

    // 문서 존재 여부 및 권한 확인
    const document = await db.collection(COLLECTIONS.DOCUMENTS).findOne({
      _id: new ObjectId(id),
      author: user._id,
      $or: [{ isDeleted: { $exists: false } }, { isDeleted: false }],
    });

    if (!document) {
      return NextResponse.json(
        { error: '문서를 찾을 수 없습니다.' },
        { status: 404 },
      );
    }

    // 업데이트할 필드 준비
    const updateFields: any = {
      updatedAt: new Date(),
    };

    if (title !== undefined) {
      updateFields.title = title;
    }

    if (content !== undefined) {
      updateFields.content = content;
    }

    if (folderId !== undefined) {
      updateFields.folderId = folderId ? new ObjectId(folderId) : null;
    }

    if (isLocked !== undefined) {
      updateFields.isLocked = isLocked;
    }

    if (order !== undefined) {
      updateFields.order = order;
    }

    // 문서 업데이트
    const result = await db
      .collection(COLLECTIONS.DOCUMENTS)
      .updateOne({ _id: new ObjectId(id) }, { $set: updateFields });

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: '문서를 찾을 수 없습니다.' },
        { status: 404 },
      );
    }

    // 업데이트된 문서 조회
    const updatedDocument = await db
      .collection(COLLECTIONS.DOCUMENTS)
      .findOne({ _id: new ObjectId(id) });

    if (!updatedDocument) {
      return NextResponse.json(
        { error: '업데이트된 문서를 찾을 수 없습니다.' },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...updatedDocument,
        _id: updatedDocument._id.toString(),
        author: updatedDocument.author.toString(),
        folderId: updatedDocument.folderId
          ? updatedDocument.folderId.toString()
          : null,
      },
    });
  } catch (error) {
    console.error('문서 업데이트 에러:', error);
    return NextResponse.json(
      { error: '문서를 업데이트하는 중 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 },
      );
    }

    const resolvedParams = await params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json(
        { error: '문서 ID가 필요합니다.' },
        { status: 400 },
      );
    }

    // MongoDB 연결
    const { db } = await connectToDatabase();

    // 사용자 조회
    const user = await db
      .collection('users')
      .findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 },
      );
    }

    // 임시 ID 체크 (낙관적 업데이트에서 생성된 임시 항목)
    if (id.startsWith('temp_')) {
      return NextResponse.json(
        {
          success: false,
          error: '임시 문서는 아직 생성 중입니다. 잠시 후 다시 시도해주세요.',
        },
        { status: 404 },
      );
    }

    // 문서 조회
    const document = await db.collection(COLLECTIONS.DOCUMENTS).findOne({
      _id: new ObjectId(id),
      author: user._id,
      $or: [{ isDeleted: { $exists: false } }, { isDeleted: false }],
    });

    if (!document) {
      return NextResponse.json(
        { error: '문서를 찾을 수 없습니다.' },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...document,
        _id: document._id.toString(),
        author: document.author.toString(),
        folderId: document.folderId ? document.folderId.toString() : null,
      },
    });
  } catch (error) {
    console.error('문서 조회 에러:', error);
    return NextResponse.json(
      { error: '문서를 조회하는 중 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 },
      );
    }

    const resolvedParams = await params;
    const documentId = resolvedParams.id;

    // documentId 유효성 검사
    if (!documentId || documentId === 'undefined') {
      console.error('유효하지 않은 documentId:', documentId);
      return NextResponse.json(
        { error: '유효하지 않은 문서 ID입니다.' },
        { status: 400 },
      );
    }

    // 임시 ID 체크 (낙관적 업데이트에서 생성된 임시 항목)
    if (documentId.startsWith('temp_')) {
      return NextResponse.json(
        { success: false, error: '임시 문서는 삭제할 수 없습니다.' },
        { status: 400 },
      );
    }

    const { db } = await connectToDatabase();

    // 사용자 조회
    const user = await db
      .collection('users')
      .findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 },
      );
    }

    // 문서 존재 여부 및 권한 확인
    const document = await db.collection(COLLECTIONS.DOCUMENTS).findOne({
      _id: new ObjectId(documentId),
      author: user._id,
      $or: [{ isDeleted: { $exists: false } }, { isDeleted: false }],
    });

    if (!document) {
      return NextResponse.json(
        { error: '문서를 찾을 수 없습니다.' },
        { status: 404 },
      );
    }

    // Soft Delete: isDeleted를 true로 설정하고 deletedAt 추가
    const result = await db.collection(COLLECTIONS.DOCUMENTS).updateOne(
      { _id: new ObjectId(documentId) },
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
      return NextResponse.json(
        { error: '문서를 찾을 수 없습니다.' },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: '문서가 휴지통으로 이동되었습니다.',
    });
  } catch (error) {
    console.error('문서 Soft Delete 에러:', error);
    return NextResponse.json(
      { error: '문서를 휴지통으로 이동하는 중 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}
