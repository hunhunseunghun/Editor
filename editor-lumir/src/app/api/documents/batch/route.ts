import { NextRequest } from 'next/server';

import {
  withAuthAndDB,
  createSuccessResponse,
  createErrorResponse,
  toObjectId,
} from '@/lib/api-middleware';
import { COLLECTIONS } from '@/lib/database/schema';

export const POST = withAuthAndDB(async (req: NextRequest, context) => {
  try {
    const { operations, type } = await req.json();

    if (!operations || !Array.isArray(operations)) {
      return createErrorResponse('Invalid operations array', 400);
    }

    if (type !== 'create') {
      return createErrorResponse('Invalid operation type', 400);
    }

    const documents = operations.map((doc: any) => ({
      ...doc,
      author: context.user.email,
      createdAt: new Date(),
      updatedAt: new Date(),
      order: doc.order || 0,
      isDeleted: false,
    }));

    const result = await context.db
      .collection(COLLECTIONS.DOCUMENTS)
      .insertMany(documents);

    return createSuccessResponse({
      insertedCount: result.insertedCount,
      insertedIds: Object.values(result.insertedIds),
    });
  } catch (error) {
    console.error('Batch create documents error:', error);
    return createErrorResponse('Failed to batch create documents', 500);
  }
});

export const PUT = withAuthAndDB(async (req: NextRequest, context) => {
  try {
    const { operations, type } = await req.json();

    if (!operations || !Array.isArray(operations)) {
      return createErrorResponse('Invalid operations array', 400);
    }

    if (type !== 'update') {
      return createErrorResponse('Invalid operation type', 400);
    }

    const bulkOps = operations.map((op: any) => ({
      updateOne: {
        filter: { _id: toObjectId(op.id), author: context.user.email },
        update: {
          $set: {
            ...op.updates,
            updatedAt: new Date(),
          },
        },
      },
    }));

    const result = await context.db
      .collection(COLLECTIONS.DOCUMENTS)
      .bulkWrite(bulkOps);

    return createSuccessResponse({
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error('Batch update documents error:', error);
    return createErrorResponse('Failed to batch update documents', 500);
  }
});

export const DELETE = withAuthAndDB(async (req: NextRequest, context) => {
  try {
    const { ids, type } = await req.json();

    if (!ids || !Array.isArray(ids)) {
      return createErrorResponse('Invalid ids array', 400);
    }

    if (type !== 'delete') {
      return createErrorResponse('Invalid operation type', 400);
    }

    const objectIds = ids.map((id) => toObjectId(id)).filter(Boolean);

    if (objectIds.length === 0) {
      return createErrorResponse('No valid IDs provided', 400);
    }

    const result = await context.db
      .collection(COLLECTIONS.DOCUMENTS)
      .deleteMany({
        _id: { $in: objectIds },
        author: context.user.email,
      });

    return createSuccessResponse({
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error('Batch delete documents error:', error);
    return createErrorResponse('Failed to batch delete documents', 500);
  }
});
