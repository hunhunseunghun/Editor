import { Input } from '@/components/ui/input';
import { useSignupContext } from '@/app/(auth)/signup/_context/signupContext';

export default function AccountInput() {
  const { email, setEmail } = useSignupContext();

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
        placeholder='your@email.com'
        className='w-full'
      />
    </div>
  );
}
