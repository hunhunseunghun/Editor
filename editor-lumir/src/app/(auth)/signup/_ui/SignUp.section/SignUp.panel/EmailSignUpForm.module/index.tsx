import React from 'react';
import Link from 'next/link';

import { useSignupContext } from '@/app/(auth)/signup/_context/signupContext';

import NameInput from './NameInput.component';
import AccountInput from './AccountInput.component';
import PasswordInput from './PasswordInput.component';
import ConfirmPasswordInput from './ConfirmPasswordInput.component';
import EmailSubmit from './EmailSubmit.component';

export default function EmailSignUpForm() {
  const {
    name,
    email,
    password,

    error,
    이메일_회원가입_한다,
  } = useSignupContext();

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          이메일_회원가입_한다(name, email, password);
        }}
        className='flex w-full flex-col gap-y-3'>
        <NameInput />
        <AccountInput />
        <PasswordInput />
        <ConfirmPasswordInput />
        <EmailSubmit />

        {error && (
          <div className='bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded text-sm'>
            {error}
          </div>
        )}
      </form>

      {/* 로그인 링크 */}
      <div className='text-center mt-6'>
        <p className='text-gray-600'>
          이미 계정이 있으신가요?{' '}
          <Link href='/signin' className='text-blue-500 hover:text-blue-700'>
            로그인
          </Link>
        </p>
      </div>
    </>
  );
}
