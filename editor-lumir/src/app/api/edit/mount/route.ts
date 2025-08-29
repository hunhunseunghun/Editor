import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { connectToDatabase } from '@/lib/mongodb';

const COLLECTIONS = {
  DOCUMENTS: 'documents',
  FOLDERS: 'folders',
  USERS: 'users',
};

export async function GET() {
  try {
    const session = await auth();

    const { db } = await connectToDatabase();

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

    // 문서와 폴더 조회
    const [documents, folders] = await Promise.all([
      db
        .collection(COLLECTIONS.DOCUMENTS)
        .find({
          author: user._id,
          $or: [{ isDeleted: { $exists: false } }, { isDeleted: false }],
        })
        .sort({ order: 1, updatedAt: -1 })
        .toArray(),
      db
        .collection(COLLECTIONS.FOLDERS)
        .find({
          author: user._id,
          $or: [{ isDeleted: { $exists: false } }, { isDeleted: false }],
        })
        .sort({ order: 1, updatedAt: -1 })
        .toArray(),
    ]);

    // ObjectId를 문자열로 변환
    const formattedDocuments = documents.map((doc) => ({
      ...doc,
      _id: doc._id.toString(),
      author: doc.author.toString(),
      folderId: doc.folderId?.toString() || null,
    }));

    const formattedFolders = folders.map((folder) => ({
      ...folder,
      _id: folder._id.toString(),
      author: folder.author.toString(),
      parentId: folder.parentId?.toString() || null,
    }));

    // 현재 문서와 이전 문서
    const currentDocument =
      formattedDocuments.length > 0 ? formattedDocuments[0] : null;
    const previousDocument =
      formattedDocuments.length > 1 ? formattedDocuments[1] : null;

    // 통합된 데이터 반환
    return NextResponse.json({
      sidebar: {
        documents: formattedDocuments,
        folders: formattedFolders,
        user: {
          name: user.name,
          email: user.email,
          image: user.avatarUrl,
        },
      },
      documentHeader: {
        currentDocument,
        previousDocument,
      },
      documentContent: {
        documents: formattedDocuments,
        currentDocument,
        documentContent: currentDocument?.content || [],
      },
    });
  } catch (error) {
    console.error('Edit page mount error:', error);
    return NextResponse.json(
      { error: 'Failed to mount edit page' },
      { status: 500 },
    );
  }
}
