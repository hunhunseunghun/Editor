import React from 'react';

export default function EditingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='bg-background text-foreground w-full h-full'>
      {children}
    </div>
  );
}
