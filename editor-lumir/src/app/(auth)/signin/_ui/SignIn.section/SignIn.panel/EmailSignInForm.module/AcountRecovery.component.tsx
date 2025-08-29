import React from 'react';

import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AcountRecovery() {
  return (
    <div>
      <Button variant='link' className='mt-5 h-auto p-0 font-normal' asChild>
        <Link href='/forgot-password'>비밀번호를 잊으셨나요?</Link>
      </Button>

      <div className='flex justify-center gap-x-1 text-sm'>
        <p>계정이 없으신가요?</p>
        <Button variant='link' className='h-auto p-0 font-normal' asChild>
          <Link href='/signup'>회원가입</Link>
        </Button>
      </div>
    </div>
  );
}
