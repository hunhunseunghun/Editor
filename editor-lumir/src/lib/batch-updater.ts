import { Document, Folder } from '@/types/common';

export interface BatchOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  collection: 'documents' | 'folders';
  data: any;
  timestamp: number;
}

export interface BatchUpdateConfig {
  maxBatchSize: number;
  maxWaitTime: number; // milliseconds
  retryAttempts: number;
  retryDelay: number; // milliseconds
}

export interface BatchUpdater {
  addOperation: (operation: Omit<BatchOperation, 'id' | 'timestamp'>) => void;
  flush: () => Promise<void>;
  getPendingOperations: () => BatchOperation[];
  clear: () => void;
}

class BatchUpdaterImpl implements BatchUpdater {
  private operations: BatchOperation[] = [];
  private flushTimeout: NodeJS.Timeout | null = null;
  private isProcessing = false;
  private config: BatchUpdateConfig;

  constructor(config: Partial<BatchUpdateConfig> = {}) {
    this.config = {
      maxBatchSize: 50,
      maxWaitTime: 1000, // 1초
      retryAttempts: 3,
      retryDelay: 1000,
      ...config,
    };
  }

  addOperation(operation: Omit<BatchOperation, 'id' | 'timestamp'>): void {
    const batchOperation: BatchOperation = {
      ...operation,
      id: `${operation.collection}-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`,
      timestamp: Date.now(),
    };

    this.operations.push(batchOperation);

    // 배치 크기나 시간 조건에 따라 자동 플러시
    if (this.operations.length >= this.config.maxBatchSize) {
      this.scheduleFlush(0);
    } else if (this.operations.length === 1) {
      this.scheduleFlush(this.config.maxWaitTime);
    }
  }

  async flush(): Promise<void> {
    if (this.isProcessing || this.operations.length === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      const operationsToProcess = [...this.operations];
      this.operations = [];

      // 컬렉션별로 그룹화
      const documentsOps = operationsToProcess.filter(
        (op) => op.collection === 'documents',
      );
      const foldersOps = operationsToProcess.filter(
        (op) => op.collection === 'folders',
      );

      // 병렬로 처리
      const promises: Promise<void>[] = [];

      if (documentsOps.length > 0) {
        promises.push(this.processDocumentBatch(documentsOps));
      }

      if (foldersOps.length > 0) {
        promises.push(this.processFolderBatch(foldersOps));
      }

      await Promise.all(promises);
    } catch {
      // 실패한 작업들을 다시 큐에 추가
      this.operations.unshift(...this.getPendingOperations());

      // 재시도 로직
      if (this.operations.length > 0) {
        setTimeout(() => {
          this.flush();
        }, this.config.retryDelay);
      }
    } finally {
      this.isProcessing = false;
    }
  }

  private async processDocumentBatch(
    operations: BatchOperation[],
  ): Promise<void> {
    const creates = operations.filter((op) => op.type === 'create');
    const updates = operations.filter((op) => op.type === 'update');
    const deletes = operations.filter((op) => op.type === 'delete');

    const promises: Promise<any>[] = [];

    // 배치 생성
    if (creates.length > 0) {
      promises.push(this.batchCreateDocuments(creates));
    }

    // 배치 업데이트
    if (updates.length > 0) {
      promises.push(this.batchUpdateDocuments(updates));
    }

    // 배치 삭제
    if (deletes.length > 0) {
      promises.push(this.batchDeleteDocuments(deletes));
    }

    await Promise.all(promises);
  }

  private async processFolderBatch(
    operations: BatchOperation[],
  ): Promise<void> {
    const creates = operations.filter((op) => op.type === 'create');
    const updates = operations.filter((op) => op.type === 'update');
    const deletes = operations.filter((op) => op.type === 'delete');

    const promises: Promise<any>[] = [];

    // 배치 생성
    if (creates.length > 0) {
      promises.push(this.batchCreateFolders(creates));
    }

    // 배치 업데이트
    if (updates.length > 0) {
      promises.push(this.batchUpdateFolders(updates));
    }

    // 배치 삭제
    if (deletes.length > 0) {
      promises.push(this.batchDeleteFolders(deletes));
    }

    await Promise.all(promises);
  }

  private async batchCreateDocuments(
    operations: BatchOperation[],
  ): Promise<void> {
    const documents = operations.map((op) => op.data);

    try {
      const response = await fetch('/api/documents/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ operations: documents, type: 'create' }),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to batch create documents: ${response.statusText}`,
        );
      }
    } catch (error) {
      throw error;
    }
  }

  private async batchUpdateDocuments(
    operations: BatchOperation[],
  ): Promise<void> {
    const updates = operations.map((op) => ({
      id: op.data._id,
      updates: op.data,
    }));

    try {
      const response = await fetch('/api/documents/batch', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ operations: updates, type: 'update' }),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to batch update documents: ${response.statusText}`,
        );
      }
    } catch (error) {
      throw error;
    }
  }

  private async batchDeleteDocuments(
    operations: BatchOperation[],
  ): Promise<void> {
    const ids = operations.map((op) => op.data._id);

    try {
      const response = await fetch('/api/documents/batch', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids, type: 'delete' }),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to batch delete documents: ${response.statusText}`,
        );
      }
    } catch (error) {
      throw error;
    }
  }

  private async batchCreateFolders(
    operations: BatchOperation[],
  ): Promise<void> {
    const folders = operations.map((op) => op.data);

    try {
      const response = await fetch('/api/folders/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ operations: folders, type: 'create' }),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to batch create folders: ${response.statusText}`,
        );
      }
    } catch (error) {
      throw error;
    }
  }

  private async batchUpdateFolders(
    operations: BatchOperation[],
  ): Promise<void> {
    const updates = operations.map((op) => ({
      id: op.data._id,
      updates: op.data,
    }));

    try {
      const response = await fetch('/api/folders/batch', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ operations: updates, type: 'update' }),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to batch update folders: ${response.statusText}`,
        );
      }
    } catch (error) {
      throw error;
    }
  }

  private async batchDeleteFolders(
    operations: BatchOperation[],
  ): Promise<void> {
    const ids = operations.map((op) => op.data._id);

    try {
      const response = await fetch('/api/folders/batch', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids, type: 'delete' }),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to batch delete folders: ${response.statusText}`,
        );
      }
    } catch (error) {
      throw error;
    }
  }

  private scheduleFlush(delay: number): void {
    if (this.flushTimeout) {
      clearTimeout(this.flushTimeout);
    }

    this.flushTimeout = setTimeout(() => {
      this.flush();
    }, delay);
  }

  getPendingOperations(): BatchOperation[] {
    return [...this.operations];
  }

  clear(): void {
    this.operations = [];
    if (this.flushTimeout) {
      clearTimeout(this.flushTimeout);
      this.flushTimeout = null;
    }
  }
}

// 전역 배치 업데이터 인스턴스
export const batchUpdater = new BatchUpdaterImpl();

// 편의 함수들
export const batchCreateDocument = (document: Partial<Document>) => {
  batchUpdater.addOperation({
    type: 'create',
    collection: 'documents',
    data: document,
  });
};

export const batchUpdateDocument = (
  documentId: string,
  updates: Partial<Document>,
) => {
  batchUpdater.addOperation({
    type: 'update',
    collection: 'documents',
    data: { _id: documentId, ...updates },
  });
};

export const batchDeleteDocument = (documentId: string) => {
  batchUpdater.addOperation({
    type: 'delete',
    collection: 'documents',
    data: { _id: documentId },
  });
};

export const batchCreateFolder = (folder: Partial<Folder>) => {
  batchUpdater.addOperation({
    type: 'create',
    collection: 'folders',
    data: folder,
  });
};

export const batchUpdateFolder = (
  folderId: string,
  updates: Partial<Folder>,
) => {
  batchUpdater.addOperation({
    type: 'update',
    collection: 'folders',
    data: { _id: folderId, ...updates },
  });
};

export const batchDeleteFolder = (folderId: string) => {
  batchUpdater.addOperation({
    type: 'delete',
    collection: 'folders',
    data: { _id: folderId },
  });
};
