'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface UserInfoModuleProps {
  user: {
    name: string;
    email: string;
    image?: string | null;
  };
  isMinimized: boolean;
}

export default function UserInfoModule({
  user,
  isMinimized,
}: UserInfoModuleProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          size='lg'
          className='flex h-[50px] w-full items-center justify-start px-3 pt-1 font-normal hover:bg-primary/5 md:h-11 mb-4'>
          <Avatar className='mr-2 h-[25px] w-[25px]'>
            <AvatarImage
              src={user?.image || undefined}
              alt={user?.name || 'User'}
            />
            <AvatarFallback className='text-xs font-medium uppercase text-secondary bg-secondary-foreground'>
              {user?.name?.[0] || 'S'}
            </AvatarFallback>
          </Avatar>
          {!isMinimized && (
            <p className='mr-1 max-w-[250px] truncate capitalize md:max-w-[120px]'>
              {user?.name || 'User'}
            </p>
          )}
        </Button>
      </DropdownMenuTrigger>
    </DropdownMenu>
  );
}
