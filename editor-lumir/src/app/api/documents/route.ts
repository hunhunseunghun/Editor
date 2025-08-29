import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

const COLLECTIONS = {
  DOCUMENTS: 'documents',
  USERS: 'users',
};

// 🔥 문서 목록 조회
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

    // 문서 조회
    const documents = await db
      .collection(COLLECTIONS.DOCUMENTS)
      .find({
        author: user._id,
        $or: [{ isDeleted: { $exists: false } }, { isDeleted: false }],
      })
      .sort({ order: 1, updatedAt: -1 })
      .toArray();

    // ObjectId를 문자열로 변환
    const formattedDocuments = documents.map((doc) => ({
      ...doc,
      _id: doc._id.toString(),
      author: doc.author.toString(),
      folderId: doc.folderId?.toString() || null,
    }));

    return NextResponse.json({
      success: true,
      data: formattedDocuments,
    });
  } catch (error) {
    console.error('=== 문서 API 핸들러 실패 ===', error);
    return NextResponse.json(
      { error: '문서 목록을 가져오는 중 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}

// 🔥 문서 생성
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

    const { title, content, folderId } = await req.json();

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

    // 기본 콘텐츠 생성
    const defaultContent = [
      {
        id: '1',
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: '새 문서를 시작하세요!',
          },
        ],
      },
    ];

    // 현재 최대 order 값 조회
    const maxOrderDoc = await db
      .collection(COLLECTIONS.DOCUMENTS)
      .find({
        author: user._id,
        $or: [{ isDeleted: { $exists: false } }, { isDeleted: false }],
      })
      .sort({ order: -1 })
      .limit(1)
      .toArray();

    const newOrder = maxOrderDoc.length > 0 ? maxOrderDoc[0].order + 1 : 0;

    const newDocument = {
      title: title || 'Untitled',
      content: content || defaultContent,
      author: user._id,
      folderId: folderId ? new ObjectId(folderId) : null,
      isLocked: false,
      isDeleted: false,
      order: newOrder,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db
      .collection(COLLECTIONS.DOCUMENTS)
      .insertOne(newDocument);

    const createdDocument = {
      _id: result.insertedId.toString(),
      ...newDocument,
      author: user._id.toString(),
      folderId: newDocument.folderId?.toString() || null,
    };

    return NextResponse.json(
      {
        success: true,
        data: createdDocument,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('=== 문서 생성 API 핸들러 실패 ===', error);
    return NextResponse.json(
      { error: '문서를 생성하는 중 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}
