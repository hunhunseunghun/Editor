import { useSignupContext } from '@/app/(auth)/signup/_context/signupContext';

import { Button } from '@/components/ui/button';

export default function EmailSubmit() {
  const { loading } = useSignupContext();

  return (
    <Button type='submit' disabled={loading} className='w-full' size='lg'>
      {loading ? '회원가입 중...' : '회원가입'}
    </Button>
  );
}
