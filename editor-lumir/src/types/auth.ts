import { Session } from 'next-auth';

// NextAuth 세션 확장
export interface ExtendedSession extends Session {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

// 인증 상태 타입
export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

// 로그인 폼 데이터
export interface LoginFormData {
  email: string;
  password: string;
}

// 회원가입 폼 데이터
export interface SignupFormData {
  email: string;
  password: string;
  name: string;
}

// 인증 에러 타입
export interface AuthError {
  message: string;
  field?: string;
}

// OAuth 제공자 타입
export type OAuthProvider = 'github' | 'google' | 'discord';

// 인증 콜백 타입
export interface AuthCallback {
  success: boolean;
  message: string;
  redirectUrl?: string;
} 