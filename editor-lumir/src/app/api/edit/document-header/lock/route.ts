import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// PUT: 문서 잠금/해제 토글
export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 },
      );
    }

    const { documentId, isLocked } = await request.json();
    const { db } = await connectToDatabase();
    
    const user = await db
      .collection('users')
      .findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 },
      );
    }

    // 문서 존재 및 권한 확인
    const document = await db
      .collection('documents')
      .findOne({
        _id: new ObjectId(documentId),
        author: user._id,
      });

    if (!document) {
      return NextResponse.json(
        { error: '문서를 찾을 수 없습니다.' },
        { status: 404 },
      );
    }

    // 잠금 상태 업데이트
    const result = await db
      .collection('documents')
      .updateOne(
        { _id: new ObjectId(documentId) },
        {
          $set: {
            isLocked: isLocked,
            updatedAt: new Date(),
          },
        }
      );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: '문서 업데이트에 실패했습니다.' },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      isLocked: isLocked,
    });
  } catch (error) {
    console.error('Document lock toggle error:', error);
    return NextResponse.json(
      { error: 'Failed to toggle document lock' },
      { status: 500 },
    );
  }
}
