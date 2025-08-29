import { Document, Folder } from '@/types/common';

// 🔥 변경 작업 타입
export interface ChangeOperation {
  id: string;
  type: 'create' | 'update' | 'delete' | 'expansion';
  entity: 'document' | 'folder';
  data: any;
  timestamp: number;
  optimisticId?: string; // 생성 시 임시 ID
}

// 🔥 롤백 정보
export interface RollbackInfo {
  operationId: string;
  previousState: any;
  timestamp: number;
}

// 🔥 Optimistic Updater 설정
export interface OptimisticConfig {
  retryAttempts: number;
  retryDelay: number;
  maxQueueSize: number;
  autoRetry: boolean;
}

// 🔥 Optimistic Updater 상태
export interface OptimisticState {
  isOnline: boolean;
  pendingOperations: number;
  lastError: string | null;
  isProcessing: boolean;
}

// 🔥 DnD 이동 정보
export interface DnDMoveInfo {
  id: string;
  type: 'document' | 'folder';
  previousParentId: string | null;
  previousOrder: number;
  newParentId: string | null;
  newOrder: number;
}

// 🔥 DnD 롤백 정보
export interface DnDRollbackInfo {
  moveOperations: DnDMoveInfo[];
  timestamp: number;
  batchId: string;
}

// 🔥 Optimistic Updater 인터페이스
export interface OptimisticUpdater {
  // 문서 관련
  createDocument(document: Partial<Document>): Promise<string>;
  updateDocument(documentId: string, updates: Partial<Document>): Promise<void>;
  deleteDocument(documentId: string): Promise<void>;

  // 폴더 관련
  createFolder(folder: Partial<Folder>): Promise<string>;
  updateFolder(folderId: string, updates: Partial<Folder>): Promise<void>;
  deleteFolder(folderId: string): Promise<void>;

  // DnD 전용
  moveDocumentOptimistic(moveInfo: DnDMoveInfo): Promise<void>;
  moveFolderOptimistic(moveInfo: DnDMoveInfo): Promise<void>;
  performDnDBatch(
    moveOperations: DnDMoveInfo[],
    batchId?: string,
  ): Promise<string>;
  rollbackDnDOperation(batchId: string): Promise<void>;

  // 상태 관리
  getState(): OptimisticState;
  forceSync(): Promise<void>;
  clearQueue(): void;
}

class OptimisticUpdaterImpl implements OptimisticUpdater {
  private config: OptimisticConfig = {
    retryAttempts: 3,
    retryDelay: 1000,
    maxQueueSize: 100,
    autoRetry: true,
  };

  private state: OptimisticState = {
    isOnline: navigator.onLine,
    pendingOperations: 0,
    lastError: null,
    isProcessing: false,
  };

  private operationQueue: ChangeOperation[] = [];
  private rollbackHistory: Map<string, RollbackInfo> = new Map();
  private dndRollbackHistory: Map<string, DnDRollbackInfo> = new Map();
  private processingQueue = false;
  private listeners: Set<(state: OptimisticState) => void> = new Set();

  constructor() {
    this.setupNetworkListener();
  }

  // 🔥 네트워크 상태 감지
  private setupNetworkListener(): void {
    // SSR 환경에서는 window 객체가 없으므로 체크
    if (typeof window === 'undefined') {
      return;
    }

    window.addEventListener('online', () => {
      this.state.isOnline = true;
      this.notifyListeners();
      if (this.config.autoRetry) {
        this.processQueue();
      }
    });

    window.addEventListener('offline', () => {
      this.state.isOnline = false;
      this.notifyListeners();
    });
  }

  // 🔥 문서 생성 (Optimistic)
  async createDocument(document: Partial<Document>): Promise<string> {
    const optimisticId = `temp_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // 1. 즉시 UI 업데이트 (Optimistic) - 완전한 Document 객체 생성
    const optimisticDoc: Document = {
      _id: optimisticId,
      title: document.title || '새 문서',
      content: document.content || [],
      author: document.author || '',
      folderId: document.folderId || null,
      order: document.order || 0,
      isLocked: false,
      isDeleted: false,
      isHiddenFromTrash: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      ...document, // 추가 필드 덮어쓰기
    };

    // 2. 변경 이벤트 발생
    this.dispatchChangeEvent('document', 'create', optimisticDoc);

    // 3. 백그라운드에서 API 호출
    const operation: ChangeOperation = {
      id: optimisticId,
      type: 'create',
      entity: 'document',
      data: document,
      timestamp: Date.now(),
      optimisticId,
    };

    this.queueOperation(operation);
    return optimisticId;
  }

  // 🔥 문서 업데이트 (Optimistic)
  async updateDocument(
    documentId: string,
    updates: Partial<Document>,
  ): Promise<void> {
    // 1. 현재 상태 저장 (롤백용)
    const currentState = this.getCurrentDocumentState(documentId);
    if (currentState) {
      this.saveRollbackInfo(documentId, currentState);
    }

    // 2. 즉시 UI 업데이트 (Optimistic)
    const optimisticDoc = currentState
      ? ({
          ...currentState,
          ...updates,
          updatedAt: new Date(),
        } as Document)
      : ({
          _id: documentId,
          ...updates,
          updatedAt: new Date(),
        } as Document);

    this.dispatchChangeEvent('document', 'update', optimisticDoc);

    // 3. 백그라운드에서 API 호출
    const operation: ChangeOperation = {
      id: documentId,
      type: 'update',
      entity: 'document',
      data: { _id: documentId, ...updates },
      timestamp: Date.now(),
    };

    this.queueOperation(operation);
  }

  // 🔥 문서 삭제 (Optimistic)
  async deleteDocument(documentId: string): Promise<void> {
    // 1. 현재 상태 저장 (롤백용)
    const currentState = this.getCurrentDocumentState(documentId);
    if (currentState) {
      this.saveRollbackInfo(documentId, currentState);
    }

    // 2. 즉시 UI 업데이트 (Optimistic)
    this.dispatchChangeEvent('document', 'delete', { _id: documentId });

    // 3. 백그라운드에서 API 호출
    const operation: ChangeOperation = {
      id: documentId,
      type: 'delete',
      entity: 'document',
      data: { _id: documentId },
      timestamp: Date.now(),
    };

    this.queueOperation(operation);
  }

  // 🔥 폴더 생성 (Optimistic)
  async createFolder(folder: Partial<Folder>): Promise<string> {
    const optimisticId = `temp_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // 1. 즉시 UI 업데이트 (Optimistic) - 완전한 Folder 객체 생성
    const optimisticFolder: Folder = {
      _id: optimisticId,
      name: folder.name || '새 폴더',
      user: folder.user || '',
      parentId: folder.parentId || null,
      children: [],
      order: folder.order || 0,
      isExpanded: false,
      isLocked: false,
      isDeleted: false,
      isHiddenFromTrash: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      ...folder, // 추가 필드 덮어쓰기
    };

    this.dispatchChangeEvent('folder', 'create', optimisticFolder);

    // 2. 백그라운드에서 API 호출
    const operation: ChangeOperation = {
      id: optimisticId,
      type: 'create',
      entity: 'folder',
      data: folder,
      timestamp: Date.now(),
      optimisticId,
    };

    this.queueOperation(operation);
    return optimisticId;
  }

  // 🔥 폴더 업데이트 (Optimistic)
  async updateFolder(
    folderId: string,
    updates: Partial<Folder>,
  ): Promise<void> {
    // 1. 현재 상태 저장 (롤백용)
    const currentState = this.getCurrentFolderState(folderId);
    if (currentState) {
      this.saveRollbackInfo(folderId, currentState);
    }

    // 2. 즉시 UI 업데이트 (Optimistic)
    const optimisticFolder = currentState
      ? ({
          ...currentState,
          ...updates,
          updatedAt: new Date(),
        } as Folder)
      : ({
          _id: folderId,
          ...updates,
          updatedAt: new Date(),
        } as Folder);

    this.dispatchChangeEvent('folder', 'update', optimisticFolder);

    // 3. 백그라운드에서 API 호출
    const operation: ChangeOperation = {
      id: folderId,
      type: 'update',
      entity: 'folder',
      data: { _id: folderId, ...updates },
      timestamp: Date.now(),
    };

    this.queueOperation(operation);
  }

  // 🔥 폴더 확장 상태 업데이트 (Optimistic)
  async updateFolderExpansion(
    folderId: string,
    isExpanded: boolean,
  ): Promise<void> {
    // 1. 현재 상태 저장 (롤백용)
    const currentState = this.getCurrentFolderState(folderId);
    if (currentState) {
      this.saveRollbackInfo(folderId, currentState);
    }

    // 2. 즉시 UI 업데이트 (Optimistic)
    const optimisticFolder = currentState
      ? ({
          ...currentState,
          isExpanded,
          updatedAt: new Date(),
        } as Folder)
      : ({
          _id: folderId,
          isExpanded,
          updatedAt: new Date(),
        } as Folder);

    this.dispatchChangeEvent('folder', 'update', optimisticFolder);

    // 3. 백그라운드에서 API 호출 (전용 엔드포인트 사용)
    const operation: ChangeOperation = {
      id: folderId,
      type: 'expansion',
      entity: 'folder',
      data: { isExpanded },
      timestamp: Date.now(),
    };

    this.queueOperation(operation);
  }

  // 🔥 폴더 삭제 (Optimistic)
  async deleteFolder(folderId: string): Promise<void> {
    // 1. 현재 상태 저장 (롤백용)
    const currentState = this.getCurrentFolderState(folderId);
    if (currentState) {
      this.saveRollbackInfo(folderId, currentState);
    }

    // 2. 즉시 UI 업데이트 (Optimistic)
    this.dispatchChangeEvent('folder', 'delete', { _id: folderId });

    // 3. 백그라운드에서 API 호출
    const operation: ChangeOperation = {
      id: folderId,
      type: 'delete',
      entity: 'folder',
      data: { _id: folderId },
      timestamp: Date.now(),
    };

    this.queueOperation(operation);
  }

  // 🔥 작업 큐에 추가
  private queueOperation(operation: ChangeOperation): void {
    this.operationQueue.push(operation);
    this.state.pendingOperations = this.operationQueue.length;
    this.notifyListeners();

    // 큐 크기 제한
    if (this.operationQueue.length > this.config.maxQueueSize) {
      const removedOp = this.operationQueue.shift();
      console.warn(
        `⚠️ QUEUE_OVERFLOW: Removed oldest operation`,
        removedOp?.id,
      );
    }

    // 온라인 상태면 즉시 처리
    if (this.state.isOnline && !this.processingQueue) {
      this.processQueue();
    }
  }

  // 🔥 큐 처리
  private async processQueue(): Promise<void> {
    if (this.processingQueue || !this.state.isOnline) return;

    this.processingQueue = true;
    this.state.isProcessing = true;
    this.notifyListeners();

    while (this.operationQueue.length > 0 && this.state.isOnline) {
      const operation = this.operationQueue.shift()!;

      try {
        await this.executeOperation(operation);
        this.state.lastError = null;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : '작업 실패';

        this.state.lastError = errorMessage;

        // 실패한 작업 롤백
        await this.rollbackOperation(operation);

        // 재시도 로직
        if (this.shouldRetry(operation)) {
          this.operationQueue.push(operation); // 큐 앞에 다시 추가
        }
      }

      this.state.pendingOperations = this.operationQueue.length;
      this.notifyListeners();
    }

    this.processingQueue = false;
    this.state.isProcessing = false;
    this.notifyListeners();
  }

  // 🔥 작업 실행
  private async executeOperation(operation: ChangeOperation): Promise<void> {
    const { type, entity, data, id } = operation;

    // 임시 ID로 생성된 항목의 업데이트/삭제는 건너뛰기
    if (id.startsWith('temp_') && (type === 'update' || type === 'delete')) {
      return;
    }

    switch (entity) {
      case 'document':
        await this.executeDocumentOperation(type, data, operation);
        break;
      case 'folder':
        await this.executeFolderOperation(type, data, operation);
        break;
    }
  }

  // 🔥 문서 작업 실행
  private async executeDocumentOperation(
    type: string,
    data: any,
    operation: ChangeOperation,
  ): Promise<void> {
    switch (type) {
      case 'create': {
        const response = await fetch('/api/documents', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error(`Failed to create document: ${response.statusText}`);
        }

        const responseData = await response.json();

        // API 응답에서 실제 문서 데이터 추출
        const realDocument = responseData.data || responseData;

        // 임시 ID를 실제 ID로 교체
        this.dispatchChangeEvent('document', 'replace', {
          optimisticId: operation.optimisticId,
          realDocument,
        });

        break;
      }

      case 'update': {
        const { _id, ...updates } = data;
        const response = await fetch(`/api/documents/${_id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updates),
        });

        if (!response.ok) {
          throw new Error(`Failed to update document: ${response.statusText}`);
        }

        const responseData = await response.json();
        const updatedDocument = responseData.data || responseData;
        this.dispatchChangeEvent('document', 'update', updatedDocument);
        break;
      }

      case 'delete': {
        const response = await fetch(`/api/documents/${data._id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error(`Failed to delete document: ${response.statusText}`);
        }

        this.dispatchChangeEvent('document', 'delete', { _id: data._id });
        break;
      }

      default:
        throw new Error(`Unknown document operation type: ${type}`);
    }
  }

  // 🔥 폴더 작업 실행
  private async executeFolderOperation(
    type: string,
    data: any,
    operation: ChangeOperation,
  ): Promise<void> {
    switch (type) {
      case 'create': {
        const response = await fetch('/api/folders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error(`Failed to create folder: ${response.statusText}`);
        }

        const responseData = await response.json();

        // API 응답에서 실제 폴더 데이터 추출
        const realFolder = responseData.data || responseData;

        // 임시 ID를 실제 ID로 교체
        this.dispatchChangeEvent('folder', 'replace', {
          optimisticId: operation.optimisticId,
          realFolder,
        });

        break;
      }

      case 'update': {
        const { _id, ...updates } = data;
        const response = await fetch(`/api/folders/${_id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updates),
        });

        if (!response.ok) {
          throw new Error(`Failed to update folder: ${response.statusText}`);
        }

        const responseData = await response.json();
        const updatedFolder = responseData.data || responseData;
        this.dispatchChangeEvent('folder', 'update', updatedFolder);
        break;
      }

      case 'expansion': {
        const { isExpanded } = data;
        const response = await fetch(`/api/folders/${operation.id}/expand`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ isExpanded }),
        });

        if (!response.ok) {
          throw new Error(
            `Failed to update folder expansion: ${response.statusText}`,
          );
        }

        const responseData = await response.json();
        const updatedFolder = responseData.data || responseData;
        this.dispatchChangeEvent('folder', 'update', updatedFolder);
        break;
      }

      case 'delete': {
        const response = await fetch(`/api/folders/${data._id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error(`Failed to delete folder: ${response.statusText}`);
        }

        this.dispatchChangeEvent('folder', 'delete', { _id: data._id });
        break;
      }

      default:
        throw new Error(`Unknown folder operation type: ${type}`);
    }
  }

  // 🔥 롤백 실행
  private async rollbackOperation(operation: ChangeOperation): Promise<void> {
    const rollbackInfo = this.rollbackHistory.get(operation.id);
    if (!rollbackInfo) return;

    // UI 상태를 이전 상태로 롤백
    this.dispatchChangeEvent(
      operation.entity,
      'rollback',
      rollbackInfo.previousState,
    );

    // 롤백 히스토리에서 제거
    this.rollbackHistory.delete(operation.id);
  }

  // 🔥 재시도 여부 결정
  private shouldRetry(operation: ChangeOperation): boolean {
    // 생성 작업은 재시도하지 않음 (중복 생성 방지)
    if (operation.type === 'create') return false;

    // 최대 재시도 횟수 확인
    const retryCount = this.getRetryCount(operation.id);
    return retryCount < this.config.retryAttempts;
  }

  // 🔥 재시도 횟수 확인
  private getRetryCount(_operationId: string): number {
    // 간단한 구현 - 실제로는 더 정교한 추적 필요
    return 0;
  }

  // 🔥 현재 문서 상태 가져오기
  private getCurrentDocumentState(_documentId: string): Document | null {
    // 현재 상태를 가져오는 로직 (실제 구현은 상태 관리 시스템에 따라 다름)
    return null;
  }

  // 🔥 현재 폴더 상태 가져오기
  private getCurrentFolderState(_folderId: string): Folder | null {
    // 현재 상태를 가져오는 로직 (실제 구현은 상태 관리 시스템에 따라 다름)
    return null;
  }

  // 🔥 롤백 정보 저장
  private saveRollbackInfo(id: string, previousState: any): void {
    const rollbackInfo: RollbackInfo = {
      operationId: id,
      previousState,
      timestamp: Date.now(),
    };
    this.rollbackHistory.set(id, rollbackInfo);
  }

  // 🔥 변경 이벤트 발생
  private dispatchChangeEvent(entity: string, action: string, data: any): void {
    const event = new CustomEvent('optimistic-change', {
      detail: {
        entity,
        action,
        data,
      },
    });

    window.dispatchEvent(event);
  }

  // 🔥 리스너 알림
  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener({ ...this.state }));
  }

  // 🔥 상태 가져오기
  getState(): OptimisticState {
    return { ...this.state };
  }

  // 🔥 강제 동기화
  async forceSync(): Promise<void> {
    await this.processQueue();
  }

  // 🔥 큐 비우기
  clearQueue(): void {
    this.operationQueue = [];
    this.state.pendingOperations = 0;
    this.notifyListeners();
  }

  // 🔥 리스너 추가
  addListener(listener: (state: OptimisticState) => void): void {
    this.listeners.add(listener);
  }

  // 🔥 리스너 제거
  removeListener(listener: (state: OptimisticState) => void): void {
    this.listeners.delete(listener);
  }

  // ========================================
  // 🔥 DnD 전용 메서드들
  // ========================================

  // 🔥 문서 이동 (DnD 전용 - 롤백 지원)
  async moveDocumentOptimistic(moveInfo: DnDMoveInfo): Promise<void> {
    // 즉시 UI 업데이트
    this.dispatchChangeEvent('document', 'move', moveInfo);

    // 백그라운드에서 API 호출
    const operation: ChangeOperation = {
      id: moveInfo.id,
      type: 'update',
      entity: 'document',
      data: {
        _id: moveInfo.id,
        folderId: moveInfo.newParentId,
        order: moveInfo.newOrder,
      },
      timestamp: Date.now(),
    };

    this.queueOperation(operation);
  }

  // 🔥 폴더 이동 (DnD 전용 - 롤백 지원)
  async moveFolderOptimistic(moveInfo: DnDMoveInfo): Promise<void> {
    // 즉시 UI 업데이트
    this.dispatchChangeEvent('folder', 'move', moveInfo);

    // 백그라운드에서 API 호출
    const operation: ChangeOperation = {
      id: moveInfo.id,
      type: 'update',
      entity: 'folder',
      data: {
        _id: moveInfo.id,
        parentId: moveInfo.newParentId,
        order: moveInfo.newOrder,
      },
      timestamp: Date.now(),
    };

    this.queueOperation(operation);
  }

  // 🔥 DnD 배치 작업 수행 (여러 아이템 동시 이동)
  async performDnDBatch(
    moveOperations: DnDMoveInfo[],
    batchId?: string,
  ): Promise<string> {
    const actualBatchId =
      batchId ||
      `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // 롤백 정보 저장
    const rollbackInfo: DnDRollbackInfo = {
      moveOperations: moveOperations.map((op) => ({
        ...op,
        previousParentId: op.previousParentId,
        previousOrder: op.previousOrder,
      })),
      timestamp: Date.now(),
      batchId: actualBatchId,
    };

    this.dndRollbackHistory.set(actualBatchId, rollbackInfo);

    // 각 작업을 즉시 UI에 반영
    for (const moveInfo of moveOperations) {
      if (moveInfo.type === 'document') {
        this.dispatchChangeEvent('document', 'move', moveInfo);
      } else {
        this.dispatchChangeEvent('folder', 'move', moveInfo);
      }
    }

    // 백그라운드에서 배치 API 호출
    const promises = moveOperations.map((moveInfo) => {
      const operation: ChangeOperation = {
        id: moveInfo.id,
        type: 'update',
        entity: moveInfo.type,
        data: {
          _id: moveInfo.id,
          ...(moveInfo.type === 'document'
            ? { folderId: moveInfo.newParentId, order: moveInfo.newOrder }
            : { parentId: moveInfo.newParentId, order: moveInfo.newOrder }),
        },
        timestamp: Date.now(),
      };

      return this.executeOperation(operation);
    });

    try {
      await Promise.all(promises);
      this.dndRollbackHistory.delete(actualBatchId);
    } catch (error) {
      // 실패 시 롤백
      await this.rollbackDnDOperation(actualBatchId);
      throw error;
    }

    return actualBatchId;
  }

  // 🔥 DnD 작업 롤백
  async rollbackDnDOperation(batchId: string): Promise<void> {
    const rollbackInfo = this.dndRollbackHistory.get(batchId);
    if (!rollbackInfo) {
      throw new Error(`Rollback info not found for batch: ${batchId}`);
    }

    // 각 작업을 원래 상태로 되돌리기
    for (const moveInfo of rollbackInfo.moveOperations) {
      const reverseMoveInfo: DnDMoveInfo = {
        id: moveInfo.id,
        type: moveInfo.type,
        previousParentId: moveInfo.newParentId,
        previousOrder: moveInfo.newOrder,
        newParentId: moveInfo.previousParentId,
        newOrder: moveInfo.previousOrder,
      };

      if (moveInfo.type === 'document') {
        this.dispatchChangeEvent('document', 'move', reverseMoveInfo);
      } else {
        this.dispatchChangeEvent('folder', 'move', reverseMoveInfo);
      }
    }

    this.dndRollbackHistory.delete(batchId);
  }
}

export const optimisticUpdater = new OptimisticUpdaterImpl();

// 전역 객체로 노출 (개발 환경에서만)
if (process.env.NODE_ENV === 'development') {
  (global as any).optimisticUpdater = optimisticUpdater;
}
