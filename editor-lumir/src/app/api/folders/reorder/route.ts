import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 },
      );
    }

    const { items, targetIndex, sourceIndex } = await request.json();

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: '유효하지 않은 순서 데이터입니다.' },
        { status: 400 },
      );
    }

    const { db } = await connectToDatabase();

    // Float 기반 정렬 시스템 (Notion 방식)
    const calculateNewOrder = (
      items: { id: string }[],
      sourceIndex: number,
      targetIndex: number,
    ) => {
      const newOrder = [...items];
      const [movedItem] = newOrder.splice(sourceIndex, 1);
      newOrder.splice(targetIndex, 0, movedItem);

      // Float 기반 order 계산
      const orders: { [key: string]: number } = {};

      for (let i = 0; i < newOrder.length; i++) {
        const item = newOrder[i];
        let order: number;

        if (i === 0) {
          // 첫 번째 아이템: 0
          order = 0;
        } else if (i === newOrder.length - 1) {
          // 마지막 아이템: 이전 아이템 + 1000
          const prevItem = newOrder[i - 1];
          const prevOrder = orders[prevItem.id] || 0;
          order = prevOrder + 1000;
        } else {
          // 중간 아이템: 이전과 다음 아이템의 중간값
          const prevItem = newOrder[i - 1];
          const nextItem = newOrder[i + 1];
          const prevOrder = orders[prevItem.id] || 0;
          const nextOrder = orders[nextItem.id] || prevOrder + 1000;
          order = prevOrder + (nextOrder - prevOrder) / 2;
        }

        orders[item.id] = order;
      }

      return orders;
    };

    // 현재 폴더들의 order를 가져와서 정렬
    const folderIds = items.map((item) => new ObjectId(item.id));
    const currentFolders = await db
      .collection('folders')
      .find({
        _id: { $in: folderIds },
        user: session.user.email,
        deletedAt: { $exists: false },
      })
      .sort({ order: 1 })
      .toArray();

    // 현재 순서대로 정렬된 폴더 배열 생성
    const currentOrderedFolders = currentFolders.map((folder) => ({
      id: folder._id.toString(),
      ...folder,
    }));

    // 새로운 order 계산
    const newOrders = calculateNewOrder(
      currentOrderedFolders,
      sourceIndex,
      targetIndex,
    );

    // 각 폴더의 order를 업데이트
    const updateOperations = Object.entries(newOrders).map(
      ([folderId, order]) => ({
        updateOne: {
          filter: {
            _id: new ObjectId(folderId),
            user: session.user.email,
            deletedAt: { $exists: false },
          },
          update: {
            $set: {
              order: order,
              updatedAt: new Date(),
            },
          },
        },
      }),
    );

    // 폴더 순서 일괄 업데이트
    const result = await db.collection('folders').bulkWrite(updateOperations);

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: '업데이트할 폴더를 찾을 수 없습니다.' },
        { status: 404 },
      );
    }

    return NextResponse.json({
      message: '폴더 순서가 업데이트되었습니다.',
      updatedCount: result.modifiedCount,
      newOrders,
    });
  } catch (error) {
    console.error('폴더 순서 변경 에러:', error);
    return NextResponse.json(
      { error: '폴더 순서를 변경하는 중 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}
