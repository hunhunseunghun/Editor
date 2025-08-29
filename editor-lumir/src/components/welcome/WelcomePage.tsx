'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Plus } from 'lucide-react';

export default function WelcomePage() {
  const router = useRouter();

  const handleCreateNewPage = () => {
    router.push('/documents/new');
  };

  return (
    <div className='flex flex-col items-center justify-center h-[calc(100vh-300px)] bg-white px-6'>
      <div className='mb-8'>
        <Image
          src='/img/clumsy.png'
          alt='Clumsy illustration'
          width={150}
          height={150}
          className='w-auto h-auto'
          priority
        />
      </div>

      <button
        onClick={handleCreateNewPage}
        className='flex items-center bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 shadow-sm text-sm hover:cursor-pointer'>
        <Plus className='mr-3 h-4 w-4' />
        <div>새 문서</div>
      </button>
    </div>
  );
}
