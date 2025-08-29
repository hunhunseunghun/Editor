import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(
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
    const folderId = resolvedParams.id;

    // folderId 유효성 검사
    if (!folderId || folderId === 'undefined') {
      console.error('유효하지 않은 folderId:', folderId);
      return NextResponse.json(
        { error: '유효하지 않은 폴더 ID입니다.' },
        { status: 400 },
      );
    }

    // 임시 ID 체크
    if (folderId.startsWith('temp_')) {
      return NextResponse.json(
        { success: false, error: '임시 폴더는 복원할 수 없습니다.' },
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

    // 휴지통에 있는 폴더 확인
    const folder = await db.collection('folders').findOne({
      _id: new ObjectId(folderId),
      user: user._id,
      isDeleted: true,
      isHiddenFromTrash: false, // 휴지통에서 숨겨지지 않은 것만
    });

    if (!folder) {
      return NextResponse.json(
        { error: '휴지통에서 폴더를 찾을 수 없습니다.' },
        { status: 404 },
      );
    }

    // 폴더 복원 (isDeleted: false, isHiddenFromTrash: false로 설정)
    const result = await db.collection('folders').updateOne(
      { _id: new ObjectId(folderId) },
      {
        $set: {
          isDeleted: false,
          isHiddenFromTrash: false,
          updatedAt: new Date(),
        },
        $unset: {
          deletedAt: '', // deletedAt 필드를 완전히 제거
        },
      },
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: '폴더를 찾을 수 없습니다.' },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: '폴더가 성공적으로 복원되었습니다.',
    });
  } catch (error) {
    console.error('폴더 복원 에러:', error);
    return NextResponse.json(
      { error: '폴더를 복원하는 중 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}
