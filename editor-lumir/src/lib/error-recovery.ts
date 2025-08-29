import { Document, Folder } from '@/types/common';

import { useState, useEffect } from 'react';

export interface OfflineOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  collection: 'documents' | 'folders';
  data: any;
  timestamp: number;
  retryCount: number;
}

export interface ErrorRecoveryConfig {
  maxRetryAttempts: number;
  retryDelay: number; // milliseconds
  offlineStorageKey: string;
  syncInterval: number; // milliseconds
}

export interface ErrorRecoveryManager {
  addOfflineOperation: (
    operation: Omit<OfflineOperation, 'id' | 'timestamp' | 'retryCount'>,
  ) => void;
  syncOfflineOperations: () => Promise<void>;
  getOfflineOperations: () => OfflineOperation[];
  clearOfflineOperations: () => void;
  isOnline: () => boolean;
  onOnline: (callback: () => void) => void;
  onOffline: (callback: () => void) => void;
}

class ErrorRecoveryManagerImpl implements ErrorRecoveryManager {
  private offlineOperations: OfflineOperation[] = [];
  private onlineCallbacks: (() => void)[] = [];
  private offlineCallbacks: (() => void)[] = [];
  private syncInterval: NodeJS.Timeout | null = null;
  private config: ErrorRecoveryConfig;

  constructor(config: Partial<ErrorRecoveryConfig> = {}) {
    this.config = {
      maxRetryAttempts: 5,
      retryDelay: 5000, // 5초
      offlineStorageKey: 'offline_operations',
      syncInterval: 30000, // 30초
      ...config,
    };

    this.initialize();
  }

  private initialize(): void {
    // 오프라인 작업 로드
    this.loadOfflineOperations();

    // 온라인/오프라인 이벤트 리스너
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));

    // 주기적 동기화 시작
    this.startPeriodicSync();

    // 페이지 언로드 시 오프라인 작업 저장
    window.addEventListener('beforeunload', () => {
      this.saveOfflineOperations();
    });
  }

  addOfflineOperation(
    operation: Omit<OfflineOperation, 'id' | 'timestamp' | 'retryCount'>,
  ): void {
    const offlineOperation: OfflineOperation = {
      ...operation,
      id: `${operation.collection}-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`,
      timestamp: Date.now(),
      retryCount: 0,
    };

    this.offlineOperations.push(offlineOperation);
    this.saveOfflineOperations();
  }

  async syncOfflineOperations(): Promise<void> {
    if (!this.isOnline() || this.offlineOperations.length === 0) {
      return;
    }

    const operationsToSync = [...this.offlineOperations];
    const successfulOperations: string[] = [];
    const failedOperations: OfflineOperation[] = [];

    for (const operation of operationsToSync) {
      try {
        await this.executeOperation(operation);
        successfulOperations.push(operation.id);
      } catch {
        if (operation.retryCount < this.config.maxRetryAttempts) {
          operation.retryCount++;
          failedOperations.push(operation);
        }
      }
    }

    // 성공한 작업들 제거
    this.offlineOperations = failedOperations;
    this.saveOfflineOperations();

    if (successfulOperations.length > 0) {
      // Synced operations
    }

    if (failedOperations.length > 0) {
      // Failed operations will be retried
    }
  }

  private async executeOperation(operation: OfflineOperation): Promise<void> {
    switch (operation.type) {
      case 'create':
        await this.executeCreateOperation(operation);
        break;
      case 'update':
        await this.executeUpdateOperation(operation);
        break;
      case 'delete':
        await this.executeDeleteOperation(operation);
        break;
      default:
        throw new Error(`Unknown operation type: ${operation.type}`);
    }
  }

  private async executeCreateOperation(
    operation: OfflineOperation,
  ): Promise<void> {
    const endpoint =
      operation.collection === 'documents' ? '/api/documents' : '/api/folders';

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(operation.data),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to create ${operation.collection}: ${response.statusText}`,
      );
    }
  }

  private async executeUpdateOperation(
    operation: OfflineOperation,
  ): Promise<void> {
    const endpoint =
      operation.collection === 'documents'
        ? `/api/documents/${operation.data._id}`
        : `/api/folders/${operation.data._id}`;

    const response = await fetch(endpoint, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(operation.data),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to update ${operation.collection}: ${response.statusText}`,
      );
    }
  }

  private async executeDeleteOperation(
    operation: OfflineOperation,
  ): Promise<void> {
    const endpoint =
      operation.collection === 'documents'
        ? `/api/documents/${operation.data._id}`
        : `/api/folders/${operation.data._id}`;

    const response = await fetch(endpoint, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(
        `Failed to delete ${operation.collection}: ${response.statusText}`,
      );
    }
  }

  getOfflineOperations(): OfflineOperation[] {
    return [...this.offlineOperations];
  }

  clearOfflineOperations(): void {
    this.offlineOperations = [];
    this.saveOfflineOperations();
  }

  isOnline(): boolean {
    return navigator.onLine;
  }

  onOnline(callback: () => void): void {
    this.onlineCallbacks.push(callback);
  }

  onOffline(callback: () => void): void {
    this.offlineCallbacks.push(callback);
  }

  private handleOnline(): void {
    this.onlineCallbacks.forEach((callback) => callback());

    // 오프라인 작업 동기화 시도
    setTimeout(() => {
      this.syncOfflineOperations();
    }, 1000);
  }

  private handleOffline(): void {
    this.offlineCallbacks.forEach((callback) => callback());
  }

  private startPeriodicSync(): void {
    this.syncInterval = setInterval(() => {
      if (this.isOnline() && this.offlineOperations.length > 0) {
        this.syncOfflineOperations();
      }
    }, this.config.syncInterval);
  }

  private saveOfflineOperations(): void {
    try {
      localStorage.setItem(
        this.config.offlineStorageKey,
        JSON.stringify(this.offlineOperations),
      );
    } catch {
      // 오프라인 작업 저장 실패
    }
  }

  private loadOfflineOperations(): void {
    try {
      const stored = localStorage.getItem(this.config.offlineStorageKey);
      if (stored) {
        this.offlineOperations = JSON.parse(stored);
        // Loaded offline operations
      }
    } catch {
      // 오프라인 작업 로드 실패
    }
  }

  // 정리
  destroy(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    window.removeEventListener('online', this.handleOnline.bind(this));
    window.removeEventListener('offline', this.handleOffline.bind(this));
  }
}

// 전역 에러 복구 매니저 인스턴스
export const errorRecoveryManager = new ErrorRecoveryManagerImpl();

// 편의 함수들
export const addOfflineCreateDocument = (document: Partial<Document>) => {
  errorRecoveryManager.addOfflineOperation({
    type: 'create',
    collection: 'documents',
    data: document,
  });
};

export const addOfflineUpdateDocument = (
  documentId: string,
  updates: Partial<Document>,
) => {
  errorRecoveryManager.addOfflineOperation({
    type: 'update',
    collection: 'documents',
    data: { _id: documentId, ...updates },
  });
};

export const addOfflineDeleteDocument = (documentId: string) => {
  errorRecoveryManager.addOfflineOperation({
    type: 'delete',
    collection: 'documents',
    data: { _id: documentId },
  });
};

export const addOfflineCreateFolder = (folder: Partial<Folder>) => {
  errorRecoveryManager.addOfflineOperation({
    type: 'create',
    collection: 'folders',
    data: folder,
  });
};

export const addOfflineUpdateFolder = (
  folderId: string,
  updates: Partial<Folder>,
) => {
  errorRecoveryManager.addOfflineOperation({
    type: 'update',
    collection: 'folders',
    data: { _id: folderId, ...updates },
  });
};

export const addOfflineDeleteFolder = (folderId: string) => {
  errorRecoveryManager.addOfflineOperation({
    type: 'delete',
    collection: 'folders',
    data: { _id: folderId },
  });
};

// 네트워크 상태 모니터링 훅
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineOperationsCount, setOfflineOperationsCount] = useState(0);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // 오프라인 작업 수 주기적 업데이트
    const interval = setInterval(() => {
      setOfflineOperationsCount(
        errorRecoveryManager.getOfflineOperations().length,
      );
    }, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  return {
    isOnline,
    offlineOperationsCount,
    syncOfflineOperations: () => errorRecoveryManager.syncOfflineOperations(),
  };
};
