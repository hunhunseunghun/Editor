import Link from 'next/link';

export default function NotFound() {
  return (
    <div className='flex min-h-screen items-center justify-center bg-stone-50 dark:bg-stone-900'>
      <div className='text-center'>
        <h1 className='text-4xl font-bold text-stone-900 dark:text-stone-100 mb-4'>
          404
        </h1>
        <p className='text-stone-600 dark:text-stone-400 mb-8'>
          페이지를 찾을 수 없습니다.
        </p>
        <Link
          href='/'
          className='inline-flex items-center px-4 py-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-md hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors'>
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
