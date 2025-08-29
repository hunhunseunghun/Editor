import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { COLLECTIONS } from '@/lib/database/schema';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 },
      );
    }

    const { db } = await connectToDatabase();

    const deletedDocuments = await db
      .collection(COLLECTIONS.DOCUMENTS)
      .find({
        author: session.user.email,
        isDeleted: true,
      })
      .sort({ deletedAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      data: deletedDocuments.map((doc) => ({
        ...doc,
        _id: doc._id.toString(),
      })),
    });
  } catch (error) {
    console.error('휴지통 문서 목록 조회 에러:', error);
    return NextResponse.json(
      { error: '휴지통 문서 목록 조회 중 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}
