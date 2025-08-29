import { NextRequest, NextResponse } from 'next/server';
import { createTrashIndexes } from '@/lib/database/utils';

/**
 * 휴지통 인덱스 생성 API
 * POST /api/admin/indexes
 */
export async function POST(request: NextRequest) {
  try {
    // 관리자 권한 확인 (실제 환경에서는 더 강력한 인증 필요)
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 },
      );
    }

    // 인덱스 생성 실행
    const result = await createTrashIndexes();

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
        timestamp: new Date().toISOString(),
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error('❌ 인덱스 생성 API 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류',
      },
      { status: 500 },
    );
  }
}

/**
 * 현재 인덱스 상태 확인 API
 * GET /api/admin/indexes
 */
export async function GET(request: NextRequest) {
  try {
    // 관리자 권한 확인
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 },
      );
    }

    const { connectToDatabase } = await import('@/lib/mongodb');
    const { db } = await connectToDatabase();
    const { DATABASE_CONFIG } = await import('@/constants/config');

    // 현재 인덱스 목록 조회
    const [documentIndexes, folderIndexes] = await Promise.all([
      db.collection(DATABASE_CONFIG.COLLECTIONS.DOCUMENTS).getIndexes(),
      db.collection(DATABASE_CONFIG.COLLECTIONS.FOLDERS).getIndexes(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        documents: documentIndexes,
        folders: folderIndexes,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('❌ 인덱스 조회 API 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류',
      },
      { status: 500 },
    );
  }
}
