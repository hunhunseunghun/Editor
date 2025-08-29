'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signIn } from 'next-auth/react';

// context 타입 정의
interface SignupContextType {
  // 데이터 상태
  name: string;
  setName: (name: string) => void;
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  confirmPassword: string;
  setConfirmPassword: (confirmPassword: string) => void;
  showPassword: boolean;
  setShowPassword: (showPassword: boolean) => void;
  showConfirmPassword: boolean;
  setShowConfirmPassword: (showConfirmPassword: boolean) => void;
  loading: boolean;
  error: string;

  // 액션 함수
  이메일_회원가입_한다: (
    name: string,
    email: string,
    password: string,
  ) => Promise<void>;
  깃허브_로그인_한다: () => Promise<void>;
}

// Provider Props 타입
interface SignupProviderProps {
  children: React.ReactNode;
}

// context 생성
const SignupContext = createContext<SignupContextType | null>(null);

export const SignupProvider: React.FC<SignupProviderProps> = ({
  children,
}: SignupProviderProps) => {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // 이미 로그인된 사용자 처리
  useEffect(() => {
    if (status === 'authenticated' && session) {
      router.push('/');
    }
  }, [status, session, router]);

  const 이메일_회원가입_한다 = useCallback(
    async (name: string, email: string, password: string) => {
      setLoading(true);
      setError('');

      // 비밀번호 확인
      if (password !== confirmPassword) {
        setError('비밀번호가 일치하지 않습니다.');
        setLoading(false);
        return;
      }

      // 비밀번호 길이 확인
      if (password.length < 6) {
        setError('비밀번호는 최소 6자 이상이어야 합니다.');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name,
            email,
            password,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          // 회원가입 성공 시 로그인 페이지로 이동
          alert('회원가입이 완료되었습니다. 로그인해주세요.');
          router.push('/signin');
        } else {
          // API에서 반환하는 message 필드 사용
          setError(data.message || '회원가입 중 오류가 발생했습니다.');
        }
      } catch (_err) {
        setError('회원가입 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    },
    [confirmPassword, router],
  );

  const 깃허브_로그인_한다 = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      // GitHub OAuth는 회원가입과 로그인을 동시에 처리
      const result = await signIn('github', {
        callbackUrl: '/',
        redirect: false,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      if (result?.ok) {
        router.push('/');
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'GitHub 로그인에 실패했습니다.',
      );
    } finally {
      setLoading(false);
    }
  }, [router]);

  const value: SignupContextType = {
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    loading,
    error,
    이메일_회원가입_한다,
    깃허브_로그인_한다,
  };

  return (
    <SignupContext.Provider value={value}>{children}</SignupContext.Provider>
  );
};

export const useSignupContext = () => {
  const context = useContext(SignupContext);
  if (!context) {
    throw new Error('useSignupContext must be used within a SignupProvider');
  }
  return context;
};
