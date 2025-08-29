import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { connectToDatabase } from '@/lib/mongodb';

// GET: 사용자 정보 조회
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

    const user = await db
      .collection('users')
      .findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 },
      );
    }

    const userInfo = {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      image: user.avatarUrl,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return NextResponse.json(userInfo);
  } catch (error) {
    console.error('User fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 },
    );
  }
}

// PUT: 사용자 정보 업데이트
export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 },
      );
    }

    const { name, avatarUrl } = await request.json();
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

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (name !== undefined) updateData.name = name;
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;

    const result = await db
      .collection('users')
      .updateOne({ _id: user._id }, { $set: updateData });

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: '사용자 업데이트에 실패했습니다.' },
        { status: 404 },
      );
    }

    // 업데이트된 사용자 정보 조회
    const updatedUser = await db.collection('users').findOne({ _id: user._id });

    const userInfo = {
      _id: updatedUser!._id.toString(),
      name: updatedUser!.name,
      email: updatedUser!.email,
      image: updatedUser!.avatarUrl,
      createdAt: updatedUser!.createdAt,
      updatedAt: updatedUser!.updatedAt,
    };

    return NextResponse.json(userInfo);
  } catch (error) {
    console.error('User update error:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 },
    );
  }
}
