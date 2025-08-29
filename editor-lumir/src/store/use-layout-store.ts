import { create } from 'zustand';
import { Document, SidebarDocument, SidebarFolder } from '@/types/common';
import {
  INITIAL_LAYOUT_STATE,
  type UpdateType,
} from '@/constants/store-constants';
import {
  updateDocumentField,
  safeArrayFilter,
  isValidSidebarDocument,
  isValidSidebarFolder,
  updateSidebarDocumentTitle,
  addSidebarDocument,
} from '@/utils/document-utils';

interface LayoutState {
  isMinimized: boolean;
  sidebarUpdateTrigger: number;
  lastUpdateType: UpdateType | null;
  lastUpdateId: string | null;
  currentDocument: Document | null;
  previousDocument: Document | null;
  sidebarDocuments: SidebarDocument[];
  sidebarFolders: SidebarFolder[];
  sidebarDeletedDocuments: SidebarDocument[];
}

interface LayoutActions {
  // 레이아웃 액션
  toggleMinimize: () => void;
  triggerSidebarUpdate: (type?: UpdateType, id?: string) => void;
  clearSidebarUpdate: () => void;

  // 문서 액션
  setCurrentDocument: (document: Document | null) => void;
  updateCurrentDocumentTitle: (title: string) => void;
  updateCurrentDocumentLock: (isLocked: boolean) => void;

  // 사이드바 액션
  setSidebarDocuments: (documents: unknown) => void;
  setSidebarFolders: (folders: unknown) => void;
  setSidebarDeletedDocuments: (documents: unknown) => void;
  updateSidebarDocumentTitle: (documentId: string, title: string) => void;
  updateSidebarDocument: (
    documentId: string,
    updates: Partial<SidebarDocument>,
  ) => void;
  addSidebarDocument: (document: SidebarDocument) => void;
  removeSidebarDocument: (documentId: string) => void;
  addSidebarFolder: (folder: SidebarFolder) => void;
  removeSidebarFolder: (folderId: string) => void;
  updateSidebarFolder: (
    folderId: string,
    folder: Partial<SidebarFolder>,
  ) => void;

  resetState: () => void;
}

export const useLayoutStore = create<LayoutState & LayoutActions>((set) => ({
  // 초기 상태
  ...INITIAL_LAYOUT_STATE,
  currentDocument: null,
  previousDocument: null,
  sidebarDocuments: [],
  sidebarFolders: [],
  sidebarDeletedDocuments: [],

  // 레이아웃 액션
  toggleMinimize: () => set((state) => ({ isMinimized: !state.isMinimized })),

  triggerSidebarUpdate: (type, id) =>
    set((state) => ({
      sidebarUpdateTrigger: state.sidebarUpdateTrigger + 1,
      lastUpdateType: type || null,
      lastUpdateId: id || null,
    })),

  clearSidebarUpdate: () =>
    set(() => ({
      lastUpdateType: null,
      lastUpdateId: null,
    })),

  // 문서 액션
  setCurrentDocument: (document) =>
    set((state) => ({
      previousDocument: state.currentDocument,
      currentDocument: document,
    })),

  updateCurrentDocumentTitle: (title) =>
    set((state) => ({
      currentDocument: updateDocumentField(
        state.currentDocument,
        'title',
        title,
      ),
    })),

  updateCurrentDocumentLock: (isLocked) =>
    set((state) => ({
      currentDocument: updateDocumentField(
        state.currentDocument,
        'isLocked',
        isLocked,
      ),
    })),

  // 사이드바 액션
  setSidebarDocuments: (documents) =>
    set(() => ({
      sidebarDocuments: safeArrayFilter(documents, isValidSidebarDocument),
    })),

  setSidebarFolders: (folders) =>
    set(() => ({
      sidebarFolders: safeArrayFilter(folders, isValidSidebarFolder),
    })),

  setSidebarDeletedDocuments: (documents) =>
    set(() => ({
      sidebarDeletedDocuments: safeArrayFilter(
        documents,
        isValidSidebarDocument,
      ),
    })),

  updateSidebarDocumentTitle: (documentId, title) =>
    set((state) => ({
      sidebarDocuments: updateSidebarDocumentTitle(
        state.sidebarDocuments,
        documentId,
        title,
      ),
    })),

  updateSidebarDocument: (documentId, updates) =>
    set((state) => ({
      sidebarDocuments: state.sidebarDocuments.map((doc) =>
        doc._id === documentId ? { ...doc, ...updates } : doc,
      ),
    })),

  addSidebarDocument: (document) =>
    set((state) => ({
      sidebarDocuments: addSidebarDocument(state.sidebarDocuments, document),
    })),

  removeSidebarDocument: (documentId) =>
    set((state) => ({
      sidebarDocuments: state.sidebarDocuments.filter(
        (doc) => doc._id !== documentId,
      ),
    })),

  addSidebarFolder: (folder) =>
    set((state) => ({
      sidebarFolders: [...state.sidebarFolders, folder],
    })),

  removeSidebarFolder: (folderId) =>
    set((state) => ({
      sidebarFolders: state.sidebarFolders.filter(
        (folder) => folder._id !== folderId,
      ),
    })),

  updateSidebarFolder: (folderId, updates) =>
    set((state) => ({
      sidebarFolders: state.sidebarFolders.map((folder) =>
        folder._id === folderId ? { ...folder, ...updates } : folder,
      ),
    })),

  resetState: () =>
    set(() => ({
      ...INITIAL_LAYOUT_STATE,
      currentDocument: null,
      previousDocument: null,
      sidebarDocuments: [],
      sidebarFolders: [],
      sidebarDeletedDocuments: [],
    })),
}));
