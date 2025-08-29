import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { COLLECTIONS } from '@/lib/database/schema';
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

    const { documentIds, targetIndex, sourceIndex } = await request.json();

    if (!Array.isArray(documentIds) || documentIds.length === 0) {
      return NextResponse.json(
        { error: '문서 ID 배열이 필요합니다.' },
        { status: 400 },
      );
    }

    const { db } = await connectToDatabase();

    // Float 기반 정렬 시스템 (Notion 방식)
    const calculateNewOrder = (
      items: string[],
      sourceIndex: number,
      targetIndex: number,
    ) => {
      const newOrder = [...items];
      const [movedItem] = newOrder.splice(sourceIndex, 1);
      newOrder.splice(targetIndex, 0, movedItem);

      // Float 기반 order 계산
      const orders: { [key: string]: number } = {};

      for (let i = 0; i < newOrder.length; i++) {
        const itemId = newOrder[i];
        let order: number;

        if (i === 0) {
          // 첫 번째 아이템: 0
          order = 0;
        } else if (i === newOrder.length - 1) {
          // 마지막 아이템: 이전 아이템 + 1000
          const prevItemId = newOrder[i - 1];
          const prevOrder = orders[prevItemId] || 0;
          order = prevOrder + 1000;
        } else {
          // 중간 아이템: 이전과 다음 아이템의 중간값
          const prevItemId = newOrder[i - 1];
          const nextItemId = newOrder[i + 1];
          const prevOrder = orders[prevItemId] || 0;
          const nextOrder = orders[nextItemId] || prevOrder + 1000;
          order = prevOrder + (nextOrder - prevOrder) / 2;
        }

        orders[itemId] = order;
      }

      return orders;
    };

    // 현재 문서들의 order를 가져와서 정렬
    const currentDocs = await db
      .collection(COLLECTIONS.DOCUMENTS)
      .find({
        _id: { $in: documentIds.map((id: string) => new ObjectId(id)) },
        author: session.user.email,
      })
      .sort({ order: 1 })
      .toArray();

    // 현재 순서대로 정렬된 ID 배열 생성
    const currentOrderedIds = currentDocs.map((doc) => doc._id.toString());

    // 새로운 order 계산
    const newOrders = calculateNewOrder(
      currentOrderedIds,
      sourceIndex,
      targetIndex,
    );

    // 각 문서의 order를 업데이트
    const updatePromises = Object.entries(newOrders).map(([docId, order]) => {
      return db.collection(COLLECTIONS.DOCUMENTS).updateOne(
        {
          _id: new ObjectId(docId),
          author: session.user.email,
        },
        {
          $set: {
            order: order,
            updatedAt: new Date(),
          },
        },
      );
    });

    await Promise.all(updatePromises);

    return NextResponse.json({
      success: true,
      message: '문서 순서가 업데이트되었습니다.',
      newOrders,
    });
  } catch (error) {
    console.error('문서 순서 업데이트 에러:', error);
    return NextResponse.json(
      { error: '문서 순서 업데이트에 실패했습니다.' },
      { status: 500 },
    );
  }
}
