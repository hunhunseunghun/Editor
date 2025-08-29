import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { connectToDatabase } from '@/lib/mongodb';

// GET: 폴더 목록 조회
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

    const folders = await db
      .collection('folders')
      .find({
        author: user._id,
        $or: [{ isDeleted: { $exists: false } }, { isDeleted: false }],
      })
      .sort({ order: 1, updatedAt: -1 })
      .toArray();

    const formattedFolders = folders.map((folder) => ({
      ...folder,
      _id: folder._id.toString(),
      author: folder.author.toString(),
      parentId: folder.parentId?.toString() || null,
    }));

    return NextResponse.json(formattedFolders);
  } catch (error) {
    console.error('Folders fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch folders' },
      { status: 500 },
    );
  }
}

// POST: 새 폴더 생성
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 },
      );
    }

    const { name, parentId } = await request.json();
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

    const newFolder = {
      name: name || '새 폴더',
      author: user._id,
      parentId: parentId || null,
      isDeleted: false,
      order: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('folders').insertOne(newFolder);
    
    const createdFolder = {
      ...newFolder,
      _id: result.insertedId.toString(),
      author: user._id.toString(),
      parentId: newFolder.parentId?.toString() || null,
    };

    return NextResponse.json(createdFolder, { status: 201 });
  } catch (error) {
    console.error('Folder creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create folder' },
      { status: 500 },
    );
  }
}
