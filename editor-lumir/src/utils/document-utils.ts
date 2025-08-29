import { Document, SidebarDocument, SidebarFolder } from '@/types/common';

export const isValidDocument = (doc: unknown): doc is Document => {
  return (
    doc !== null &&
    typeof doc === 'object' &&
    '_id' in doc &&
    'title' in doc &&
    'content' in doc
  );
};

export const isValidSidebarDocument = (
  doc: unknown,
): doc is SidebarDocument => {
  return (
    doc !== null && typeof doc === 'object' && '_id' in doc && 'title' in doc
  );
};

export const isValidSidebarFolder = (
  folder: unknown,
): folder is SidebarFolder => {
  return (
    folder !== null &&
    typeof folder === 'object' &&
    '_id' in folder &&
    'name' in folder
  );
};

// 문서 필드 업데이트 유틸리티
export const updateDocumentField = <K extends keyof Document>(
  document: Document | null,
  field: K,
  value: Document[K],
): Document | null => {
  return document ? { ...document, [field]: value } : null;
};

// 배열 안전성 체크 및 필터링
export const safeArrayFilter = <T>(
  array: unknown,
  validator: (item: unknown) => item is T,
): T[] => {
  return Array.isArray(array) ? array.filter(validator) : [];
};

export const updateSidebarDocumentTitle = (
  documents: SidebarDocument[],
  documentId: string,
  title: string,
): SidebarDocument[] => {
  return documents.map((doc) =>
    doc._id === documentId ? { ...doc, title } : doc,
  );
};

export const addSidebarDocument = (
  documents: SidebarDocument[],
  newDocument: SidebarDocument,
): SidebarDocument[] => {
  const exists = documents.some((doc) => doc._id === newDocument._id);
  return exists ? documents : [...documents, newDocument];
};
