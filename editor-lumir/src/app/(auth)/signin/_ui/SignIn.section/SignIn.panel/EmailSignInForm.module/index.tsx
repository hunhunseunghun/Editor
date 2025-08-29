import React from 'react';

import { useSigninContext } from '@/app/(auth)/signin/_context/signinContext';

import AccountInput from './AccountInput.component';
import PasswordInput from './PasswordInput.component';
import EmailSubmit from './EmailSubmit.component';
import AcountRecovery from './AcountRecovery.component';

export default function EmailSigninForm() {
  const { email, password, error, 이메일_로그인_한다 } = useSigninContext();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        이메일_로그인_한다(email, password);
      }}
      className='flex w-full flex-col gap-y-3'>
      <AccountInput />

      <PasswordInput />

      <EmailSubmit />

      <AcountRecovery />

      {error && (
        <div className='bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded text-sm'>
          {error}
        </div>
      )}
    </form>
  );
}
