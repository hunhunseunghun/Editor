import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// 🔥 API 미들웨어 타입 정의
export interface ApiContext {
  session: any;
  user: any;
  db: any;
  userId: ObjectId;
}

// 🔥 인증 및 DB 연결 공통 미들웨어
export function withAuthAndDB(
  handler: (req: NextRequest, context: ApiContext) => Promise<NextResponse>,
) {
  return async (req: NextRequest) => {
    try {
      // 1. 인증 체크
      let session;
      try {
        session = await auth();
      } catch {
        return NextResponse.json(
          { error: '인증 처리 중 오류가 발생했습니다.' },
          { status: 500 },
        );
      }

      if (!session?.user?.email) {
        return NextResponse.json(
          { error: '인증이 필요합니다.' },
          { status: 401 },
        );
      }

      // 2. DB 연결 - Promise 처리 방식 수정
      let db;
      try {
        // Promise를 직접 await로 처리
        const dbConnection = await connectToDatabase();

        db = dbConnection.db;
      } catch (dbError) {
        // DB 연결 실패 시 더 구체적인 오류 메시지 반환
        return NextResponse.json(
          {
            error: '데이터베이스 연결에 실패했습니다.',
            details:
              dbError instanceof Error
                ? dbError.message
                : 'Unknown database error',
          },
          { status: 500 },
        );
      }

      // 3. 사용자 조회 (GitHub OAuth 계정으로 조회)
      let user = await db
        .collection('users')
        .findOne({ email: session.user.email });

      if (!user) {
        // GitHub OAuth 사용자의 경우 자동 생성 (안전한 방식)
        const newUser = {
          email: session.user.email,
          name: session.user.name || session.user.email,
          hashedPassword: null, // OAuth 사용자는 비밀번호 없음
          avatarUrl: session.user.image || null,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        };

        try {
          const result = await db.collection('users').insertOne(newUser);
          user = {
            _id: result.insertedId,
            ...newUser,
          };
        } catch {
          return NextResponse.json(
            { error: '사용자 생성 중 오류가 발생했습니다.' },
            { status: 500 },
          );
        }
      }

      // 4. 컨텍스트 생성
      const context: ApiContext = {
        session,
        user,
        db,
        userId: user._id,
      };

      // 5. 핸들러 실행
      const result = await handler(req, context);
      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      return NextResponse.json(
        {
          error: '서버 오류가 발생했습니다.',
          details: errorMessage,
        },
        { status: 500 },
      );
    }
  };
}

export async function withAuth(
  req: NextRequest,
  handler: (context: ApiContext) => Promise<NextResponse>,
): Promise<NextResponse> {
  try {
    // 세션 확인
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // DB 연결
    const dbConnection = await connectToDatabase();
    if (!dbConnection) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 },
      );
    }

    // 사용자 조회 또는 생성
    const usersCollection = dbConnection.db.collection('users');
    let user = await usersCollection.findOne({ email: session.user.email });

    if (!user) {
      // 새 사용자 생성
      const newUser = {
        email: session.user.email,
        name: session.user.name || session.user.email,
        image: session.user.image,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await usersCollection.insertOne(newUser);
      user = { ...newUser, _id: result.insertedId };
    }

    // API 컨텍스트 생성
    const context: ApiContext = {
      session,
      db: dbConnection.db,
      user,
      userId: user._id,
    };

    // 핸들러 실행
    const result = await handler(context);
    return result;
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

// 🔥 에러 응답 유틸리티
export function createErrorResponse(
  message: string,
  status: number = 500,
  details?: string,
) {
  return NextResponse.json(
    {
      error: message,
      ...(details && { details }),
    },
    { status },
  );
}

// 🔥 성공 응답 유틸리티
export function createSuccessResponse<T>(data: T, status: number = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status },
  );
}

// 🔥 ObjectId 변환 유틸리티
export function toObjectId(id: string | null | undefined): ObjectId | null {
  if (!id) return null;
  try {
    return new ObjectId(id);
  } catch {
    return null;
  }
}

// 🔥 ObjectId를 문자열로 변환하는 유틸리티
export function toStringId(id: ObjectId | null | undefined): string | null {
  if (!id) return null;
  return id.toString();
}
