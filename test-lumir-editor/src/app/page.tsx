'use client';
import dynamic from 'next/dynamic';

const LumirEditor = dynamic(
  () => import('@kingdoo/editor').then((m) => m.LumirEditor),
  { ssr: false },
);

export default function Home() {
  return (
    <div className='min-h-screen p-6'>
      <h1 className='text-2xl font-semibold mb-4'>Lumir Editor (local)</h1>
      <div className='w-full max-w-4xl h-[600px]'>
        <LumirEditor
          className=''
          includeDefaultStyles={true}
          sideMenuAddButton={false}
        />
      </div>
    </div>
  );
}
