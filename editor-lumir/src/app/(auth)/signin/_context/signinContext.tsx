'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';

// context 타입 정의
interface SignInContextType {
  // 상태
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;

  // 페칭 상태
  error: string;
  loading: boolean;

  // 액션 함수
  이메일_로그인_한다: (email: string, password: string) => Promise<void>;
  깃허브_로그인_한다: () => Promise<void>;
}

// Provider Props 타입
interface SigninProviderProps {
  children: React.ReactNode;
}

// context 생성
const SigninContext = createContext<SignInContextType | null>(null);

export const SigninProvider: React.FC<SigninProviderProps> = ({
  children,
}: SigninProviderProps) => {
  // 라우터
  const router = useRouter();
  const { data: session, status } = useSession();

  // 상태
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'authenticated' && session) {
      router.push('/edit');
    }
  }, [status, session, router]);

  const 이메일_로그인_한다 = useCallback(
    async (email: string, password: string) => {
      setLoading(true);
      setError(null);

      try {
        const result = await signIn('credentials', {
          email,
          password,
          redirect: false,
        });

        if (result?.error) {
          throw new Error(result.error);
        }

        if (result?.ok) {
          router.push('/edit');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '로그인에 실패했습니다.');
      } finally {
        setLoading(false);
      }
    },
    [router],
  );

  const 깃허브_로그인_한다 = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // NextAuth signIn 사용 - GitHub OAuth는 브라우저 리다이렉트 필요
      await signIn('github', {
        callbackUrl: '/edit', // 로그인 성공 후 /documents로 리다이렉트
        redirect: true, // 자동 리다이렉트 활성화 (GitHub OAuth 필수)
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'GitHub 로그인에 실패했습니다.',
      );
      setLoading(false);
    }
  }, []);

  const value: SignInContextType = {
    email,
    setEmail,
    password,
    setPassword,
    loading,
    error,
    이메일_로그인_한다,
    깃허브_로그인_한다,
  };

  return (
    <SigninContext.Provider value={value}>{children}</SigninContext.Provider>
  );
};

// 커스텀 훅
export const useSigninContext = () => {
  const context = useContext(SigninContext);
  if (!context) {
    throw new Error('useSigninContext must be used within a SigninProvider');
  }
  return context;
};
