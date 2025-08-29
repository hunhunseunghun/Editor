'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Folder } from 'lucide-react';

interface CreateFolderDialogProps {
  onCreateFolder: (name: string) => Promise<void>;
  trigger?: React.ReactNode;
}

export default function CreateFolderDialog({
  onCreateFolder,
  trigger,
}: CreateFolderDialogProps) {
  const [open, setOpen] = useState(false);
  const [folderName, setFolderName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderName.trim()) return;

    setIsLoading(true);
    try {
      await onCreateFolder(folderName.trim());
      setFolderName('');
      setOpen(false);
    } catch (error) {
      console.error('폴더 생성 에러:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setFolderName('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            variant='ghost'
            className='h-8 w-full justify-start px-3 font-normal text-primary/70 hover:bg-primary/5 hover:cursor-pointer'>
            <Folder className='mr-3 h-4 w-4' />새 폴더
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Folder className='h-5 w-5' />새 폴더 생성
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='folder-name'>폴더 이름</Label>
            <Input
              id='folder-name'
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder='폴더 이름을 입력하세요'
              autoFocus
              disabled={isLoading}
            />
          </div>
          <div className='flex justify-end gap-2'>
            <Button
              type='button'
              variant='outline'
              onClick={() => setOpen(false)}
              disabled={isLoading}>
              취소
            </Button>
            <Button type='submit' disabled={!folderName.trim() || isLoading}>
              {isLoading ? '생성 중...' : '생성'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
