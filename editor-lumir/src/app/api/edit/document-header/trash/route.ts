import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// PUT: 문서 휴지통으로 이동
export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 },
      );
    }

    const { documentId } = await request.json();
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

    // 휴지통으로 이동 (soft delete)
    const result = await db
      .collection('documents')
      .updateOne(
        { _id: new ObjectId(documentId) },
        {
          $set: {
            isDeleted: true,
            deletedAt: new Date(),
            updatedAt: new Date(),
          },
        }
      );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: '문서 삭제에 실패했습니다.' },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: '문서가 휴지통으로 이동되었습니다.',
    });
  } catch (error) {
    console.error('Document trash error:', error);
    return NextResponse.json(
      { error: 'Failed to move document to trash' },
      { status: 500 },
    );
  }
}
