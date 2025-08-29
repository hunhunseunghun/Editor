'use client';

import { useState } from 'react';
import { useOptimisticState } from '@/hooks/useOptimisticSync';
import {
  Wifi,
  WifiOff,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock,
  X,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { optimisticUpdater } from '@/lib/optimistic-updater';

interface SyncStatusProps {
  className?: string;
  showDetails?: boolean;
}

export const SyncStatus = ({
  className,
  showDetails = false,
}: SyncStatusProps) => {
  const state = useOptimisticState();
  const [isExpanded, setIsExpanded] = useState(false);

  // 🔥 상태에 따른 아이콘과 색상 결정
  const getStatusIcon = () => {
    if (!state.isOnline) {
      return { icon: WifiOff, color: 'text-red-500', bgColor: 'bg-red-100' };
    }
    if (state.lastError) {
      return {
        icon: AlertCircle,
        color: 'text-orange-500',
        bgColor: 'bg-orange-100',
      };
    }
    if (state.isProcessing) {
      return {
        icon: RefreshCw,
        color: 'text-blue-500',
        bgColor: 'bg-blue-100',
      };
    }
    if (state.pendingOperations > 0) {
      return {
        icon: Clock,
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-100',
      };
    }
    return {
      icon: CheckCircle,
      color: 'text-green-500',
      bgColor: 'bg-green-100',
    };
  };

  const { icon: StatusIcon, color, bgColor } = getStatusIcon();

  // 🔥 상태 메시지 생성
  const getStatusMessage = () => {
    if (!state.isOnline) {
      return '오프라인';
    }
    if (state.lastError) {
      return '동기화 오류';
    }
    if (state.isProcessing) {
      return '동기화 중...';
    }
    if (state.pendingOperations > 0) {
      return `${state.pendingOperations}개 작업 대기 중`;
    }
    return '동기화됨';
  };

  // 🔥 강제 동기화
  const handleForceSync = async () => {
    try {
      await optimisticUpdater.forceSync();
    } catch (error) {
      console.error('강제 동기화 실패:', error);
    }
  };

  // 🔥 큐 비우기
  const handleClearQueue = () => {
    optimisticUpdater.clearQueue();
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* 🔥 상태 표시 */}
      <div className='flex items-center gap-2'>
        <div className={cn('p-1 rounded-full', bgColor)}>
          <StatusIcon className={cn('w-4 h-4', color)} />
        </div>

        {showDetails && (
          <span className='text-sm text-muted-foreground'>
            {getStatusMessage()}
          </span>
        )}
      </div>

      {/* 🔥 상세 정보 토글 */}
      {showDetails && (
        <Button
          variant='ghost'
          size='sm'
          onClick={() => setIsExpanded(!isExpanded)}
          className='h-6 w-6 p-0'>
          <ChevronDown
            className={cn(
              'w-3 h-3 transition-transform',
              isExpanded && 'rotate-180',
            )}
          />
        </Button>
      )}

      {/* 🔥 확장된 상세 정보 */}
      {isExpanded && showDetails && (
        <div className='absolute top-full right-0 mt-2 p-3 bg-background border rounded-lg shadow-lg min-w-64 z-50'>
          <div className='space-y-3'>
            {/* 🔥 네트워크 상태 */}
            <div className='flex items-center justify-between'>
              <span className='text-sm font-medium'>네트워크</span>
              <div className='flex items-center gap-2'>
                {state.isOnline ? (
                  <Wifi className='w-4 h-4 text-green-500' />
                ) : (
                  <WifiOff className='w-4 h-4 text-red-500' />
                )}
                <span className='text-sm'>
                  {state.isOnline ? '온라인' : '오프라인'}
                </span>
              </div>
            </div>

            {/* 🔥 대기 중인 작업 */}
            <div className='flex items-center justify-between'>
              <span className='text-sm font-medium'>대기 작업</span>
              <div className='flex items-center gap-2'>
                <Clock className='w-4 h-4 text-yellow-500' />
                <span className='text-sm'>{state.pendingOperations}개</span>
              </div>
            </div>

            {/* 🔥 처리 상태 */}
            <div className='flex items-center justify-between'>
              <span className='text-sm font-medium'>처리 상태</span>
              <div className='flex items-center gap-2'>
                {state.isProcessing ? (
                  <RefreshCw className='w-4 h-4 text-blue-500 animate-spin' />
                ) : (
                  <CheckCircle className='w-4 h-4 text-green-500' />
                )}
                <span className='text-sm'>
                  {state.isProcessing ? '처리 중' : '대기 중'}
                </span>
              </div>
            </div>

            {/* 🔥 에러 상태 */}
            {state.lastError && (
              <div className='flex items-start justify-between'>
                <span className='text-sm font-medium'>오류</span>
                <div className='flex items-start gap-2 max-w-32'>
                  <AlertCircle className='w-4 h-4 text-red-500 mt-0.5 flex-shrink-0' />
                  <span className='text-sm text-red-600 text-right'>
                    {state.lastError}
                  </span>
                </div>
              </div>
            )}

            {/* 🔥 액션 버튼들 */}
            <div className='flex gap-2 pt-2 border-t'>
              <Button
                size='sm'
                variant='outline'
                onClick={handleForceSync}
                disabled={state.isProcessing || !state.isOnline}
                className='flex-1'>
                <RefreshCw className='w-3 h-3 mr-1' />
                동기화
              </Button>

              {state.pendingOperations > 0 && (
                <Button
                  size='sm'
                  variant='outline'
                  onClick={handleClearQueue}
                  className='flex-1'>
                  <X className='w-3 h-3 mr-1' />큐 비우기
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 🔥 간단한 상태 점만 표시하는 컴포넌트
export const SyncStatusDot = ({ className }: { className?: string }) => {
  const state = useOptimisticState();

  const getStatusColor = () => {
    if (!state.isOnline) return 'bg-red-500';
    if (state.lastError) return 'bg-orange-500';
    if (state.isProcessing) return 'bg-blue-500';
    if (state.pendingOperations > 0) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div
      className={cn(
        'w-2 h-2 rounded-full transition-colors duration-200',
        getStatusColor(),
        className,
      )}
      title={state.isOnline ? '온라인' : '오프라인'}
    />
  );
};

// 🔥 툴팁이 있는 상태 표시
export const SyncStatusWithTooltip = ({
  className,
}: {
  className?: string;
}) => {
  const state = useOptimisticState();

  const getTooltipText = () => {
    if (!state.isOnline) return '오프라인 상태';
    if (state.lastError) return `오류: ${state.lastError}`;
    if (state.isProcessing) return '동기화 처리 중...';
    if (state.pendingOperations > 0)
      return `${state.pendingOperations}개 작업 대기 중`;
    return '모든 작업이 동기화됨';
  };

  return (
    <div className={cn('group relative', className)}>
      <SyncStatusDot />
      <div className='absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50'>
        {getTooltipText()}
      </div>
    </div>
  );
};
