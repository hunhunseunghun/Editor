import { BaseEntity } from './base';
import { Block } from '@blocknote/core';

/**
 * 사용자 엔티티 타입
 * 고정 필드 + null 값 사용 방식 적용
 */
export interface User extends BaseEntity {
  /** 로그인 및 통신용 이메일 주소 - 인증 및 알림 발송에 사용 */
  email: string;

  /** 사용자 표시명 - UI에서 사용자 이름으로 표시 */
  name: string;

  /** 암호화된 비밀번호 - OAuth 사용자의 경우 null */
  hashedPassword: string | null;

  /** 프로필 이미지 URL - 사용자 아바타 표시용, 없으면 null */
  avatarUrl: string | null;
}

/**
 * 폴더 엔티티 타입
 * 고정 필드 + null 값 사용 방식 적용
 */
export interface Folder extends BaseEntity {
  /** 폴더 표시명 - UI에서 폴더 이름으로 표시 */
  name: string;

  /** 폴더 소유자 ID - 권한 관리 및 소유권 확인용 */
  user: string;

  /** 상위 폴더 ID - 계층 구조 구현, 루트 폴더는 null */
  parentId: string | null;

  /** 하위 폴더/문서 목록 - UI 렌더링용, 빈 배열로 초기화 */
  children: Folder[];

  /** 폴더 정렬 순서 - 사용자 정의 순서 유지 */
  order: number;

  /** UI에서 폴더 확장 상태 - 사용자 경험 개선용, false로 초기화 */
  isExpanded: boolean;

  /** 편집 권한 제한 - 관리자가 설정한 읽기 전용 상태 */
  isLocked: boolean;

  /** 소프트 삭제 상태 - 휴지통 기능 구현용 */
  isDeleted: boolean;

  /** 휴지통에서 숨김 상태 - 휴지통에서 삭제 시 true로 설정 */
  isHiddenFromTrash: boolean;
}

/**
 * 문서 엔티티 타입
 * 고정 필드 + null 값 사용 방식 적용
 */
export interface Document extends BaseEntity {
  /** 문서 제목 - 문서 목록 및 검색에서 표시 */
  title: string;

  /** BlockNote 에디터 콘텐츠 - 리치 텍스트 에디터의 실제 내용 */
  content: Block[];

  /** 문서 작성자 ID - 권한 관리 및 작성자 표시용 */
  author: string;

  /** 문서가 속한 폴더 ID - 폴더별 문서 그룹화, 루트 문서는 null */
  folderId: string | null;

  /** 문서 정렬 순서 - 사용자 정의 순서 유지 */
  order: number;

  /** 편집 권한 제한 - 관리자가 설정한 읽기 전용 상태 */
  isLocked: boolean;

  /** 소프트 삭제 상태 - 휴지통 기능 구현용 */
  isDeleted: boolean;

  /** 휴지통에서 숨김 상태 - 휴지통에서 삭제 시 true로 설정 */
  isHiddenFromTrash: boolean;
}

// ===== 기존 타입들과의 호환성을 위한 타입 매핑 =====

/** 기존 SidebarFolder 타입과의 호환성 */
export type SidebarFolder = Folder;

/** 기존 SidebarDocument 타입과의 호환성 */
export type SidebarDocument = Document;
