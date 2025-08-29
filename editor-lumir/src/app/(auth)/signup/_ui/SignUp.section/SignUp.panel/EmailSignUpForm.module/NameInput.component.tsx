import { Input } from '@/components/ui/input';
import { useSignupContext } from '@/app/(auth)/signup/_context/signupContext';

export default function NameInput() {
  const { name, setName } = useSignupContext();

  return (
    <div>
      <label
        htmlFor='name'
        className='block text-sm font-medium text-foreground mb-1'>
        이름
      </label>
      <Input
        type='text'
        id='name'
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        placeholder='이름'
        className='w-full'
      />
    </div>
  );
}
