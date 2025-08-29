import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { connectToDatabase } from '@/lib/mongodb';
import {
  COLLECTIONS,
  TreeNode,
  TreeUpdateRequest,
  CreateNodeRequest,
} from '@/lib/database/schema';
import { ObjectId } from 'mongodb';

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

    // 사용자 ID 조회 (이메일로)
    const user = await db
      .collection('users')
      .findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 },
      );
    }

    const userId = user._id;

    // 폴더와 문서를 병렬로 조회 (ObjectId 사용)
    const [folders, documents] = await Promise.all([
      db
        .collection('folders')
        .find({
          user: userId,
          deletedAt: { $exists: false },
        })
        .sort({ order: 1, createdAt: 1 })
        .toArray(),
      db
        .collection(COLLECTIONS.DOCUMENTS)
        .find({
          author: userId,
          $or: [{ isDeleted: { $exists: false } }, { isDeleted: false }],
        })
        .sort({ order: 1, updatedAt: -1 })
        .toArray(),
    ]);

    // 문서를 폴더별로 그룹화
    const documentsByFolder: Record<string, any[]> = {};
    const ungroupedDocuments: any[] = [];

    documents.forEach((doc) => {
      if (doc.folderId) {
        const folderIdStr = doc.folderId.toString();
        if (!documentsByFolder[folderIdStr]) {
          documentsByFolder[folderIdStr] = [];
        }
        documentsByFolder[folderIdStr].push(doc);
      } else {
        ungroupedDocuments.push(doc);
      }
    });

    // React-arborist 트리 구조로 변환
    const treeData: TreeNode[] = [];

    // 폴더들을 트리 아이템으로 변환
    folders.forEach((folder) => {
      const folderIdStr = folder._id.toString();
      const folderDocuments = documentsByFolder[folderIdStr] || [];

      const folderNode: TreeNode = {
        id: folderIdStr,
        name: folder.name,
        type: 'folder',
        children: folderDocuments.map(
          (doc): TreeNode => ({
            id: doc._id.toString(),
            name: doc.title || 'Untitled',
            type: 'document' as const,
            parentId: folderIdStr,
            children: [],
            folderId: folderIdStr,
            order: doc.order,
            createdAt: doc.createdAt
              ? new Date(doc.createdAt).toISOString()
              : null,
            updatedAt: doc.updatedAt
              ? new Date(doc.updatedAt).toISOString()
              : null,
            isLocked: doc.isLocked,
            isDeleted: false,
          }),
        ),
        order: folder.order,
        parentId: folder.parentId ? folder.parentId.toString() : null,
        createdAt: folder.createdAt
          ? new Date(folder.createdAt).toISOString()
          : null,
        updatedAt: folder.updatedAt
          ? new Date(folder.updatedAt).toISOString()
          : null,
        folderId: null,
        isLocked: false,
        isDeleted: false,
      };

      treeData.push(folderNode);
    });

    // 폴더가 없는 문서들을 추가
    ungroupedDocuments.forEach((doc) => {
      treeData.push({
        id: doc._id.toString(),
        name: doc.title || 'Untitled',
        type: 'document',
        parentId: null,
        children: [],
        folderId: null,
        order: doc.order,
        createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : null,
        updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : null,
        isLocked: doc.isLocked,
        isDeleted: false,
      } as TreeNode);
    });

    // order 기준으로 정렬
    treeData.sort((a, b) => {
      const orderA = a.order ?? 0;
      const orderB = b.order ?? 0;
      return orderA - orderB;
    });

    return NextResponse.json({
      success: true,
      data: treeData,
    });
  } catch (error) {
    console.error('트리 데이터 조회 에러:', error);
    return NextResponse.json(
      { error: '트리 데이터를 가져오는 중 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}

// 트리 구조 업데이트 (드래그 앤 드롭, 순서 변경 등)
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 },
      );
    }

    const { updates }: TreeUpdateRequest = await request.json();
    const { db } = await connectToDatabase();

    // 사용자 ID 조회
    const user = await db
      .collection('users')
      .findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 },
      );
    }

    const userId = user._id;

    // 배치 업데이트 실행
    const updatePromises = updates.map(async (update) => {
      const { id, type, changes } = update;

      // ObjectId 변환
      const objectId = new ObjectId(id);
      const updateData: any = { ...changes, updatedAt: new Date() };

      // ObjectId 필드 변환
      if (changes.folderId !== undefined) {
        updateData.folderId = changes.folderId
          ? new ObjectId(changes.folderId)
          : null;
      }
      if (changes.parentId !== undefined) {
        updateData.parentId = changes.parentId
          ? new ObjectId(changes.parentId)
          : null;
      }

      if (type === 'document') {
        return db
          .collection(COLLECTIONS.DOCUMENTS)
          .updateOne({ _id: objectId, author: userId }, { $set: updateData });
      } else if (type === 'folder') {
        return db
          .collection('folders')
          .updateOne({ _id: objectId, user: userId }, { $set: updateData });
      }
    });

    await Promise.all(updatePromises);

    return NextResponse.json({
      success: true,
      message: '트리 구조가 업데이트되었습니다.',
    });
  } catch (error) {
    console.error('트리 구조 업데이트 에러:', error);
    return NextResponse.json(
      { error: '트리 구조 업데이트 중 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}

// 새 노드 생성
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 },
      );
    }

    const { type, name, parentId, folderId }: CreateNodeRequest =
      await request.json();
    const { db } = await connectToDatabase();

    // 사용자 ID 조회
    const user = await db
      .collection('users')
      .findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 },
      );
    }

    const userId = user._id;

    if (type === 'document') {
      // 문서 생성
      const defaultContent = [
        {
          id: 'content-block',
          type: 'paragraph',
          props: {
            textColor: 'default',
            backgroundColor: 'default',
            textAlignment: 'left',
          },
          content: [
            {
              type: 'text',
              text: '',
              styles: {},
            },
          ],
          children: [],
        },
      ];

      // 현재 문서 개수를 확인하여 order 설정
      const documentCount = await db
        .collection(COLLECTIONS.DOCUMENTS)
        .countDocuments({
          author: userId,
          $or: [{ isDeleted: { $exists: false } }, { isDeleted: false }],
        });

      const newDocument = {
        title: name,
        content: defaultContent,
        author: userId,
        folderId: folderId ? new ObjectId(folderId) : null,

        order: documentCount,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await db
        .collection(COLLECTIONS.DOCUMENTS)
        .insertOne(newDocument);

      return NextResponse.json({
        success: true,
        data: {
          id: result.insertedId.toString(),
          name,
          type: 'document',

          order: documentCount,
          parentId: folderId,
          createdAt: newDocument.createdAt.toISOString(),
          updatedAt: newDocument.updatedAt.toISOString(),
        },
      });
    } else if (type === 'folder') {
      // 폴더 생성
      const maxOrderFolder = await db
        .collection('folders')
        .find({
          user: userId,
          deletedAt: { $exists: false },
        })
        .sort({ order: -1 })
        .limit(1)
        .toArray();

      const newOrder =
        maxOrderFolder.length > 0 ? maxOrderFolder[0].order + 1 : 0;

      const newFolder = {
        name,
        user: userId,
        parentId: parentId ? new ObjectId(parentId) : null,
        order: newOrder,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await db.collection('folders').insertOne(newFolder);

      return NextResponse.json({
        success: true,
        data: {
          id: result.insertedId.toString(),
          name,
          type: 'folder',
          order: newOrder,
          parentId,
          createdAt: newFolder.createdAt.toISOString(),
          updatedAt: newFolder.updatedAt.toISOString(),
        },
      });
    }

    return NextResponse.json(
      { error: '지원하지 않는 노드 타입입니다.' },
      { status: 400 },
    );
  } catch (error) {
    console.error('노드 생성 에러:', error);
    return NextResponse.json(
      { error: '노드를 생성하는 중 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}

// 노드 삭제
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const type = searchParams.get('type') as 'document' | 'folder';
    const permanent = searchParams.get('permanent') === 'true';

    if (!id || !type) {
      return NextResponse.json(
        { error: 'ID와 타입이 필요합니다.' },
        { status: 400 },
      );
    }

    const { db } = await connectToDatabase();

    // 사용자 ID 조회
    const user = await db
      .collection('users')
      .findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 },
      );
    }

    const userId = user._id;
    const objectId = new ObjectId(id);

    if (type === 'document') {
      if (permanent) {
        await db.collection(COLLECTIONS.DOCUMENTS).deleteOne({
          _id: objectId,
          author: userId,
        });
      } else {
        await db
          .collection(COLLECTIONS.DOCUMENTS)
          .updateOne(
            { _id: objectId, author: userId },
            { $set: { isDeleted: true, deletedAt: new Date() } },
          );
      }
    } else if (type === 'folder') {
      if (permanent) {
        await db.collection('folders').deleteOne({
          _id: objectId,
          user: userId,
        });
      } else {
        await db.collection('folders').updateOne(
          { _id: objectId, user: userId },
          {
            $set: {
              isDeleted: true,
              isHiddenFromTrash: false,
              deletedAt: new Date(),
              updatedAt: new Date(),
            },
          },
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: '노드가 삭제되었습니다.',
    });
  } catch (error) {
    console.error('노드 삭제 에러:', error);
    return NextResponse.json(
      { error: '노드를 삭제하는 중 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}
