import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';

export async function GET() {
  try {
    const session = await auth();

    const providers = {
      github: {
        id: 'github',
        name: 'GitHub',
        type: 'oauth',
        signinUrl: '/api/auth/github',
        callbackUrl: '/api/auth/callback/github',
      },
      credentials: {
        id: 'credentials',
        name: 'Email',
        type: 'credentials',
        signinUrl: '/api/auth/email',
        callbackUrl: '/api/auth/callback/credentials',
      },
    };

    return NextResponse.json({
      providers,
      isAuthenticated: !!session,
    });
  } catch (_error) {
    return NextResponse.json(
      {
        providers: {},
        isAuthenticated: false,
      },
      { status: 500 },
    );
  }
}
