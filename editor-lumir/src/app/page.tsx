'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Spinner } from '@/components/ui';

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    if (session) {
      router.push('/edit');
    } else {
      // 인증되지 않은 사용자를 /signin으로 리다이렉트
      router.push('/signin');
    }
  }, [session, status, router]);

  // 로딩 중일 때 로딩 표시
  if (status === 'loading') {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <Spinner size='lg' />
        </div>
      </div>
    );
  }

  return null;
}
