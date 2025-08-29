import { NextRequest, NextResponse } from 'next/server';
import { signIn } from '@/lib/auth/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // 입력 검증
    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: '이메일과 비밀번호를 입력해주세요.',
        },
        { status: 400 },
      );
    }

    // NextAuth.js signIn 함수 사용
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      return NextResponse.json(
        {
          success: false,
          message: result.error,
        },
        { status: 401 },
      );
    }

    return NextResponse.json({
      success: true,
      message: '로그인에 성공했습니다.',
    });
  } catch (_error) {
    return NextResponse.json(
      {
        success: false,
        message: '로그인 중 오류가 발생했습니다.',
      },
      { status: 500 },
    );
  }
}
