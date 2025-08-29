import { ObjectId } from 'mongodb';
import { DATABASE_CONFIG } from '@/constants/config';
import { User, Folder, Document } from '@/types/entities';
import {
  TreeNode,
  TreeUpdateRequest,
  CreateNodeRequest,
  DeleteNodeRequest,
} from '@/types/tree';

// 데이터베이스 컬렉션 및 상수
export const COLLECTIONS = DATABASE_CONFIG.COLLECTIONS;
export const INDEXES = DATABASE_CONFIG.INDEXES;

// 스키마 검증 규칙
export const SCHEMA_VALIDATION = {
  [COLLECTIONS.DOCUMENTS]: {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['title', 'author', 'createdAt', 'updatedAt', 'order'],
        properties: {
          title: { bsonType: 'string' },
          content: { bsonType: 'array' },
          author: { bsonType: 'objectId' }, // ObjectId로 변경
          folderId: { bsonType: ['objectId', 'null'] }, // ObjectId로 변경
          isLocked: { bsonType: 'bool' },
          isDeleted: { bsonType: 'bool' },
          order: { bsonType: 'number' },
          createdAt: { bsonType: 'date' },
          updatedAt: { bsonType: 'date' },
          deletedAt: { bsonType: ['date', 'null'] },
        },
      },
    },
  },
  [COLLECTIONS.FOLDERS]: {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['name', 'user', 'createdAt', 'updatedAt', 'order'],
        properties: {
          name: { bsonType: 'string' },
          user: { bsonType: 'objectId' }, // ObjectId로 변경
          parentId: { bsonType: ['objectId', 'null'] }, // ObjectId로 변경
          isLocked: { bsonType: 'bool' },
          isDeleted: { bsonType: 'bool' },
          order: { bsonType: 'number' },
          isExpanded: { bsonType: 'bool' },
          createdAt: { bsonType: 'date' },
          updatedAt: { bsonType: 'date' },
          deletedAt: { bsonType: ['date', 'null'] },
        },
      },
    },
  },
} as const;

// ============================================================================
// 데이터베이스 스키마 인터페이스 (통합된 타입 재사용)

/**
 * MongoDB ObjectId를 사용하는 사용자 데이터베이스 타입
 * 고정 필드 + null 값 사용 방식 적용
 */
export interface DbUser extends Omit<User, '_id'> {
  _id: ObjectId;
  hashedPassword: string | null; // null 허용
}

/**
 * MongoDB ObjectId를 사용하는 폴더 데이터베이스 타입
 * 고정 필드 + null 값 사용 방식 적용
 */
export interface DbFolder extends Omit<Folder, '_id' | 'user' | 'parentId'> {
  _id: ObjectId;
  user: ObjectId;
  parentId: ObjectId | null; // null 허용
}

/**
 * MongoDB ObjectId를 사용하는 문서 데이터베이스 타입
 * 고정 필드 + null 값 사용 방식 적용
 */
export interface DbDocument
  extends Omit<Document, '_id' | 'author' | 'folderId'> {
  _id: ObjectId;
  author: ObjectId;
  folderId: ObjectId | null; // null 허용
}

// ============================================================================
// 유틸리티 함수

export const DATABASE_UTILS = {
  /**
   * ObjectId 생성 헬퍼
   */
  createObjectId: (id?: string | ObjectId): ObjectId => {
    if (id instanceof ObjectId) return id;
    if (typeof id === 'string') return new ObjectId(id);
    return new ObjectId();
  },

  /**
   * 날짜 필드 설정
   */
  setTimestamps: (data: Record<string, unknown>, isUpdate = false) => {
    const now = new Date();
    if (isUpdate) {
      data.updatedAt = now;
    } else {
      data.createdAt = now;
      data.updatedAt = now;
    }
    return data;
  },

  /**
   * 스키마 검증
   */
  validateDocument: (doc: Record<string, unknown>): boolean => {
    const required = ['title', 'author', 'createdAt', 'updatedAt'];
    return required.every((field) => doc.hasOwnProperty(field));
  },

  validateFolder: (folder: Record<string, unknown>): boolean => {
    const required = ['name', 'user', 'createdAt', 'updatedAt'];
    return required.every((field) => folder.hasOwnProperty(field));
  },

  // ===== 데이터베이스 타입을 API 타입으로 변환 =====

  /**
   * DbUser를 User로 변환
   */
  dbUserToUser: (dbUser: DbUser): User => ({
    _id: dbUser._id.toString(),
    email: dbUser.email,
    hashedPassword: dbUser.hashedPassword,
    name: dbUser.name,
    avatarUrl: dbUser.avatarUrl,
    createdAt: dbUser.createdAt,
    updatedAt: dbUser.updatedAt,
    deletedAt: dbUser.deletedAt,
  }),

  /**
   * DbFolder를 Folder로 변환
   */
  dbFolderToFolder: (dbFolder: DbFolder): Folder => ({
    _id: dbFolder._id.toString(),
    name: dbFolder.name,
    user: dbFolder.user.toString(),
    parentId: dbFolder.parentId?.toString() ?? null,
    children: dbFolder.children ?? [],
    order: dbFolder.order,
    isExpanded: dbFolder.isExpanded ?? false,
    isLocked: dbFolder.isLocked,
    isDeleted: dbFolder.isDeleted,
    isHiddenFromTrash: dbFolder.isHiddenFromTrash ?? false,
    createdAt: dbFolder.createdAt,
    updatedAt: dbFolder.updatedAt,
    deletedAt: dbFolder.deletedAt,
  }),

  /**
   * DbDocument를 Document로 변환
   */
  dbDocumentToDocument: (dbDocument: DbDocument): Document => ({
    _id: dbDocument._id.toString(),
    title: dbDocument.title,
    content: dbDocument.content,
    author: dbDocument.author.toString(),
    folderId: dbDocument.folderId?.toString() ?? null,
    order: dbDocument.order,
    isLocked: dbDocument.isLocked,
    isDeleted: dbDocument.isDeleted,
    isHiddenFromTrash: dbDocument.isHiddenFromTrash ?? false,
    createdAt: dbDocument.createdAt,
    updatedAt: dbDocument.updatedAt,
    deletedAt: dbDocument.deletedAt,
  }),

  // ===== API 타입을 데이터베이스 타입으로 변환 =====

  /**
   * User를 DbUser로 변환
   */
  userToDbUser: (user: User): DbUser => ({
    _id: new ObjectId(user._id),
    email: user.email,
    hashedPassword: user.hashedPassword,
    name: user.name,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    deletedAt: user.deletedAt,
  }),

  /**
   * Folder를 DbFolder로 변환
   */
  folderToDbFolder: (folder: Folder): DbFolder => ({
    _id: new ObjectId(folder._id),
    name: folder.name,
    user: new ObjectId(folder.user),
    parentId: folder.parentId ? new ObjectId(folder.parentId) : null,
    children: folder.children,
    order: folder.order,
    isExpanded: folder.isExpanded,
    isLocked: folder.isLocked,
    isDeleted: folder.isDeleted,
    isHiddenFromTrash: folder.isHiddenFromTrash,
    createdAt: folder.createdAt,
    updatedAt: folder.updatedAt,
    deletedAt: folder.deletedAt,
  }),

  /**
   * Document를 DbDocument로 변환
   */
  documentToDbDocument: (document: Document): DbDocument => ({
    _id: new ObjectId(document._id),
    title: document.title,
    content: document.content,
    author: new ObjectId(document.author),
    folderId: document.folderId ? new ObjectId(document.folderId) : null,
    order: document.order,
    isLocked: document.isLocked,
    isDeleted: document.isDeleted,
    isHiddenFromTrash: document.isHiddenFromTrash,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
    deletedAt: document.deletedAt,
  }),
};

// 타입 재내보내기 (하위 호환성을 위해)
export type {
  User,
  Folder,
  Document,
  TreeNode,
  TreeUpdateRequest,
  CreateNodeRequest,
  DeleteNodeRequest,
};
