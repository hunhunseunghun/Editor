'use client';

import { useState } from 'react';

import { useSigninContext } from '@/app/(auth)/signin/_context/signinContext';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function PasswordInput() {
  const { password, setPassword } = useSigninContext();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
      <label
        htmlFor='password'
        className='block text-sm font-medium text-foreground mb-1'>
        비밀번호
      </label>
      <div className='box-content flex h-11 overflow-clip rounded-md'>
        <Input
          type={showPassword ? 'text' : 'password'}
          id='password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder={showPassword ? '비밀번호를 입력하세요...' : '********'}
          className='w-full peer rounded-r-none border-r-0'
        />
        <Button
          type='button'
          variant='link'
          className='w-15 grid h-11 cursor-pointer items-center rounded-l-none border-y border-r border-accent bg-accent peer-focus-visible:border-input peer-focus-visible:bg-background'
          onClick={() => setShowPassword(!showPassword)}>
          {!showPassword ? <span>보기</span> : <span>숨기기</span>}
        </Button>
      </div>
    </div>
  );
}
