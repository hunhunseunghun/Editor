import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

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

    // 임시 ID 체크
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

    // 휴지통에 있는 문서 확인
    const document = await db.collection('documents').findOne({
      _id: new ObjectId(documentId),
      author: user._id,
      isDeleted: true,
      isHiddenFromTrash: false, // 휴지통에서 숨겨지지 않은 것만
    });

    if (!document) {
      return NextResponse.json(
        { error: '휴지통에서 문서를 찾을 수 없습니다.' },
        { status: 404 },
      );
    }

    // 휴지통에서 숨김 처리 (실제 삭제하지 않고 조회만 안되도록)
    const result = await db.collection('documents').updateOne(
      { _id: new ObjectId(documentId) },
      {
        $set: {
          isHiddenFromTrash: true, // 휴지통에서 숨김
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
      message: '문서가 휴지통에서 영구 삭제되었습니다.',
    });
  } catch (error) {
    console.error('휴지통 문서 삭제 에러:', error);
    return NextResponse.json(
      { error: '휴지통에서 문서를 삭제하는 중 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}
