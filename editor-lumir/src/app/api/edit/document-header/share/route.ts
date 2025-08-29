import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// POST: 문서 공유 링크 생성
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 },
      );
    }

    const { documentId, shareType, permissions } = await request.json();
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
    const document = await db.collection('documents').findOne({
      _id: new ObjectId(documentId),
      author: user._id,
      $or: [{ isDeleted: { $exists: false } }, { isDeleted: false }],
    });

    if (!document) {
      return NextResponse.json(
        { error: '문서를 찾을 수 없습니다.' },
        { status: 404 },
      );
    }

    // 공유 정보 생성
    const shareInfo = {
      documentId: new ObjectId(documentId),
      author: user._id,
      shareType: shareType || 'public', // public, private, restricted
      permissions: permissions || ['read'], // read, write, comment
      shareToken: generateShareToken(), // 공유 토큰 생성
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // 기존 공유 정보가 있으면 업데이트, 없으면 생성
    const existingShare = await db
      .collection('document_shares')
      .findOne({ documentId: new ObjectId(documentId), author: user._id });

    if (existingShare) {
      await db
        .collection('document_shares')
        .updateOne({ _id: existingShare._id }, { $set: shareInfo });
    } else {
      await db.collection('document_shares').insertOne(shareInfo);
    }

    const shareLink = `${
      process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    }/shared/${shareInfo.shareToken}`;

    return NextResponse.json({
      success: true,
      shareLink,
      shareToken: shareInfo.shareToken,
      shareType: shareInfo.shareType,
      permissions: shareInfo.permissions,
    });
  } catch (error) {
    console.error('Document share error:', error);
    return NextResponse.json(
      { error: 'Failed to share document' },
      { status: 500 },
    );
  }
}

// GET: 문서 공유 정보 조회
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('documentId');

    if (!documentId) {
      return NextResponse.json(
        { error: '문서 ID가 필요합니다.' },
        { status: 400 },
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

    const shareInfo = await db.collection('document_shares').findOne({
      documentId: new ObjectId(documentId),
      author: user._id,
      isActive: true,
    });

    if (!shareInfo) {
      return NextResponse.json({
        success: false,
        message: '공유 정보가 없습니다.',
      });
    }

    const shareLink = `${
      process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    }/shared/${shareInfo.shareToken}`;

    return NextResponse.json({
      success: true,
      shareLink,
      shareToken: shareInfo.shareToken,
      shareType: shareInfo.shareType,
      permissions: shareInfo.permissions,
      createdAt: shareInfo.createdAt,
    });
  } catch (error) {
    console.error('Share info fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch share info' },
      { status: 500 },
    );
  }
}

// DELETE: 문서 공유 해제
export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('documentId');

    if (!documentId) {
      return NextResponse.json(
        { error: '문서 ID가 필요합니다.' },
        { status: 400 },
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

    const result = await db.collection('document_shares').updateOne(
      {
        documentId: new ObjectId(documentId),
        author: user._id,
      },
      {
        $set: {
          isActive: false,
          updatedAt: new Date(),
        },
      },
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: '공유 정보를 찾을 수 없습니다.' },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: '문서 공유가 해제되었습니다.',
    });
  } catch (error) {
    console.error('Share delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete share' },
      { status: 500 },
    );
  }
}

// 공유 토큰 생성 함수
function generateShareToken(): string {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}
