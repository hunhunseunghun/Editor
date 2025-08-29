import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { connectToDatabase } from '@/lib/mongodb';

// GET: 문서 목록 조회
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

    const documents = await db
      .collection('documents')
      .find({
        author: user._id,
        $or: [{ isDeleted: { $exists: false } }, { isDeleted: false }],
      })
      .sort({ order: 1, updatedAt: -1 })
      .toArray();

    const formattedDocuments = documents.map((doc) => ({
      ...doc,
      _id: doc._id.toString(),
      author: doc.author.toString(),
      folderId: doc.folderId?.toString() || null,
    }));

    return NextResponse.json(formattedDocuments);
  } catch (error) {
    console.error('Documents fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 },
    );
  }
}

// POST: 새 문서 생성
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 },
      );
    }

    const { title, content, folderId } = await request.json();
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

    const newDocument = {
      title: title || '새 문서',
      content: content || [],
      author: user._id,
      folderId: folderId || null,
      isLocked: false,
      isDeleted: false,
      order: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('documents').insertOne(newDocument);

    const createdDocument = {
      ...newDocument,
      _id: result.insertedId.toString(),
      author: user._id.toString(),
      folderId: newDocument.folderId?.toString() || null,
    };

    return NextResponse.json(createdDocument, { status: 201 });
  } catch (error) {
    console.error('Document creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create document' },
      { status: 500 },
    );
  }
}
