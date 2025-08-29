import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// 🔥 폴더 목록 조회
export async function GET() {
  try {
    // 인증 확인
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 },
      );
    }

    // MongoDB 연결
    const { db } = await connectToDatabase();

    // 사용자 조회 또는 생성
    let user = await db
      .collection('users')
      .findOne({ email: session.user.email });

    if (!user) {
      const newUser = {
        email: session.user.email,
        name: session.user.name || session.user.email,
        hashedPassword: null,
        avatarUrl: session.user.image || null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      const result = await db.collection('users').insertOne(newUser);
      user = { _id: result.insertedId, ...newUser };
    }

    // 폴더 조회
    const folders = await db
      .collection('folders')
      .find({
        user: user._id,
        deletedAt: { $exists: false },
      })
      .sort({ order: 1, createdAt: 1 })
      .toArray();

    // ObjectId를 문자열로 변환
    const formattedFolders = folders.map((folder) => ({
      ...folder,
      _id: folder._id.toString(),
      user: folder.user.toString(),
      parentId: folder.parentId?.toString() || null,
    }));

    return NextResponse.json({
      success: true,
      data: formattedFolders,
    });
  } catch (error) {
    console.error('=== 폴더 API 핸들러 실패 ===', error);
    return NextResponse.json(
      { error: '폴더 목록을 가져오는 중 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}

// 🔥 폴더 생성
export async function POST(req: NextRequest) {
  try {
    // 인증 확인
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 },
      );
    }

    const { name, description, parentId } = await req.json();

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: '폴더 이름은 필수입니다.' },
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

    // 현재 최대 order 값 조회
    const maxOrderFolder = await db
      .collection('folders')
      .find({
        user: user._id,
        deletedAt: { $exists: false },
      })
      .sort({ order: -1 })
      .limit(1)
      .toArray();

    const newOrder =
      maxOrderFolder.length > 0 ? maxOrderFolder[0].order + 1 : 0;

    const newFolder = {
      name: name.trim(),
      description: description?.trim() || '',
      user: user._id,
      parentId: parentId ? new ObjectId(parentId) : null,
      isLocked: false,
      isDeleted: false,
      order: newOrder,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('folders').insertOne(newFolder);

    const createdFolder = {
      _id: result.insertedId.toString(),
      ...newFolder,
      user: user._id.toString(),
      parentId: newFolder.parentId?.toString() || null,
    };

    return NextResponse.json(
      {
        success: true,
        data: createdFolder,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('=== 폴더 생성 API 핸들러 실패 ===', error);
    return NextResponse.json(
      { error: '폴더를 생성하는 중 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}
