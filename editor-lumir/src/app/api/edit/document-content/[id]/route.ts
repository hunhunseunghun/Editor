import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// GET: 특정 문서 조회
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    console.log('🔍 API GET: 문서 조회 요청 시작', { documentId: id });

    const session = await auth();
    console.log('🔐 API GET: 세션 확인', {
      hasSession: !!session,
      hasUser: !!session?.user,
      userEmail: session?.user?.email,
    });

    if (!session?.user?.email) {
      console.log('❌ API GET: 인증 실패 - 세션이 없음');
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 },
      );
    }

    const { db } = await connectToDatabase();
    console.log('🗄️ API GET: 데이터베이스 연결 완료');

    const user = await db
      .collection('users')
      .findOne({ email: session.user.email });

    console.log('👤 API GET: 사용자 조회', {
      foundUser: !!user,
      userId: user?._id?.toString(),
    });

    if (!user) {
      console.log('❌ API GET: 사용자를 찾을 수 없음');
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 },
      );
    }

    console.log('📄 API GET: 문서 조회 시도', {
      documentId: id,
      authorId: user._id.toString(),
    });

    const document = await db.collection('documents').findOne({
      _id: new ObjectId(id),
      author: user._id,
      $or: [{ isDeleted: { $exists: false } }, { isDeleted: false }],
    });

    console.log('📄 API GET: 문서 조회 결과', {
      foundDocument: !!document,
      documentTitle: document?.title,
      documentAuthor: document?.author?.toString(),
    });

    if (!document) {
      console.log('❌ API GET: 문서를 찾을 수 없음');
      return NextResponse.json(
        { error: '문서를 찾을 수 없습니다.' },
        { status: 404 },
      );
    }

    console.log('🔍 API GET: 문서 조회', {
      requestedId: id,
      actualId: document._id.toString(),
      title: document.title,
      contentLength: document.content?.length || 0,
      contentPreview: document.content?.[0]?.content?.[0]?.text || '빈 내용',
    });

    const formattedDocument = {
      ...document,
      _id: document._id.toString(),
      author: document.author.toString(),
      folderId: document.folderId?.toString() || null,
    };

    return NextResponse.json(formattedDocument);
  } catch (error) {
    console.error('Document fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch document' },
      { status: 500 },
    );
  }
}

// PUT: 문서 내용 업데이트
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    console.log('🔧 API PUT: 문서 저장 요청 시작', { documentId: id });

    const session = await auth();
    console.log('🔐 API PUT: 세션 확인', {
      hasSession: !!session,
      hasUser: !!session?.user,
      userEmail: session?.user?.email,
    });

    if (!session?.user?.email) {
      console.log('❌ API PUT: 인증 실패 - 세션이 없음');
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 },
      );
    }

    // 요청 본문 안전하게 파싱
    let requestBody;
    try {
      const bodyText = await request.text();
      if (!bodyText || bodyText.trim() === '') {
        return NextResponse.json(
          { error: '요청 본문이 비어있습니다.' },
          { status: 400 },
        );
      }
      requestBody = JSON.parse(bodyText);
    } catch (error) {
      console.error('JSON 파싱 에러:', error);
      return NextResponse.json(
        { error: '잘못된 JSON 형식입니다.' },
        { status: 400 },
      );
    }

    const { title, content, folderId, isLocked } = requestBody;
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
    const existingDocument = await db.collection('documents').findOne({
      _id: new ObjectId(id),
      author: user._id,
      $or: [{ isDeleted: { $exists: false } }, { isDeleted: false }],
    });

    if (!existingDocument) {
      return NextResponse.json(
        { error: '문서를 찾을 수 없습니다.' },
        { status: 404 },
      );
    }

    // 문서 업데이트
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (folderId !== undefined) updateData.folderId = folderId;
    if (isLocked !== undefined) updateData.isLocked = isLocked;

    console.log('💾 API PUT: 문서 저장 시작', {
      documentId: id,
      title: title,
      contentLength: content?.length || 0,
      contentPreview:
        content?.[0]?.content?.[0]?.text?.substring(0, 50) || '빈 내용',
      timestamp: new Date().toISOString(),
    });

    const result = await db
      .collection('documents')
      .updateOne({ _id: new ObjectId(id) }, { $set: updateData });

    if (result.matchedCount === 0) {
      console.error('❌ API PUT: 문서 업데이트 실패', { documentId: id });
      return NextResponse.json(
        { error: '문서 업데이트에 실패했습니다.' },
        { status: 404 },
      );
    }

    console.log('✅ API PUT: 문서 저장 완료', {
      documentId: id,
      matchedCount: result.matchedCount,
    });

    // 업데이트된 문서 조회
    const updatedDocument = await db
      .collection('documents')
      .findOne({ _id: new ObjectId(id) });

    const formattedDocument = {
      ...updatedDocument,
      _id: updatedDocument!._id.toString(),
      author: updatedDocument!.author.toString(),
      folderId: updatedDocument!.folderId?.toString() || null,
    };

    console.log('📤 API PUT: 응답 반환', {
      documentId: formattedDocument._id,
      title: formattedDocument.title,
      contentLength: formattedDocument.content?.length || 0,
    });

    return NextResponse.json(formattedDocument);
  } catch (error) {
    console.error('Document update error:', error);
    return NextResponse.json(
      { error: 'Failed to update document' },
      { status: 500 },
    );
  }
}
