import { useSigninContext } from '@/app/(auth)/signin/_context/signinContext';

import { Button } from '@/components/ui/button';
import { LoaderIcon } from 'lucide-react';

export default function EmailSubmit() {
  const { loading } = useSigninContext();
  return (
    <Button type='submit' disabled={loading} size='lg' className='w-full'>
      {loading && <LoaderIcon className='mr-2 h-4 w-4 animate-spin' />}
      계속하기
    </Button>
  );
}
