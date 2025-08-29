import { Input } from '@/components/ui/input';
import { useSigninContext } from '@/app/(auth)/signin/_context/signinContext';

export default function AccountInput() {
  const { email, setEmail } = useSigninContext();

  return (
    <div>
      <label
        htmlFor='email'
        className='block text-sm font-medium text-foreground mb-1'>
        이메일
      </label>
      <Input
        type='email'
        id='email'
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        placeholder='이메일 주소를 입력하세요...'
        className='w-full'
      />
    </div>
  );
}
