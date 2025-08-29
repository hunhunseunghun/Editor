'use client';

import { useSignupContext } from '@/app/(auth)/signup/_context/signupContext';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function ConfirmPasswordInput() {
  const {
    confirmPassword,
    setConfirmPassword,
    showConfirmPassword,
    setShowConfirmPassword,
  } = useSignupContext();

  return (
    <div>
      <label
        htmlFor='confirmPassword'
        className='block text-sm font-medium text-foreground mb-1'>
        비밀번호 확인
      </label>
      <div className='box-content flex h-11 overflow-clip rounded-md'>
        <Input
          type={showConfirmPassword ? 'text' : 'password'}
          id='confirmPassword'
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          placeholder={
            showConfirmPassword ? '비밀번호를 다시 입력하세요...' : '********'
          }
          className='w-full peer rounded-r-none border-r-0'
        />
        <Button
          type='button'
          variant='link'
          className='w-15 grid h-11 cursor-pointer items-center rounded-l-none border-y border-r border-accent bg-accent peer-focus-visible:border-input peer-focus-visible:bg-background'
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
          {!showConfirmPassword ? <span>보기</span> : <span>숨기기</span>}
        </Button>
      </div>
    </div>
  );
}
