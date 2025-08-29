import { auth } from '@/lib/auth/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  // 인증이 필요하지 않은 경로들 (공개 경로)
  const publicPaths = [
    '/',
    '/signin',
    '/signup',
    '/api/auth',
    '/api/signup',
    '/api/signin',
    '/api/email',
    '/api/github',
    '/api/verify',
  ];

  // 정적 파일 및 시스템 경로들
  const staticPaths = ['/_next', '/favicon.ico', '/public', '/uploads'];

  // 현재 경로가 공개 경로인지 확인
  const isPublicPath = publicPaths.some(
    (path) => pathname === path || pathname.startsWith(path + '/'),
  );

  // 정적 파일 경로인지 확인
  const isStaticPath = staticPaths.some((path) => pathname.startsWith(path));

  // 공개 경로나 정적 파일이면 인증 검사 건너뛰기
  if (isPublicPath || isStaticPath) {
    return NextResponse.next();
  }

  // API 요청인 경우 401 응답
  if (pathname.startsWith('/api/')) {
    if (!isLoggedIn) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 },
      );
    }
  }

  // 페이지 요청인 경우 로그인 페이지로 리다이렉트
  if (!isLoggedIn) {
    const signInUrl = new URL('/signin', req.url);
    signInUrl.searchParams.set('callbackUrl', req.url);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
