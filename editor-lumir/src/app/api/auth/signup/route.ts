import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '@/lib/mongodb';
import { signIn } from '@/lib/auth/auth';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    // 입력 검증
    if (!name || !email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: '모든 필드를 입력해주세요.',
        },
        { status: 400 },
      );
    }

    // 데이터베이스 연결
    const { db } = await connectToDatabase();

    // 이메일 중복 확인
    const existingUser = await db.collection('users').findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: '이미 사용 중인 이메일 주소입니다.',
        },
        { status: 409 },
      );
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 12);

    // 새 사용자 생성
    const newUser = {
      name: name.trim(),
      email: email.toLowerCase(),
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('users').insertOne(newUser);

    // 회원가입 후 자동 로그인
    const signInResult = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (signInResult?.error) {
      return NextResponse.json(
        {
          success: true,
          message: '회원가입은 완료되었지만 자동 로그인에 실패했습니다.',
          user: {
            id: result.insertedId.toString(),
            name: newUser.name,
            email: newUser.email,
          },
        },
        { status: 201 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: '회원가입이 완료되었습니다.',
        user: {
          id: result.insertedId.toString(),
          name: newUser.name,
          email: newUser.email,
        },
      },
      { status: 201 },
    );
  } catch (_error) {
    return NextResponse.json(
      {
        success: false,
        message: '회원가입 중 오류가 발생했습니다.',
      },
      { status: 500 },
    );
  }
}
