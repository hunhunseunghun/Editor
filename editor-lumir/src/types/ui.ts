// 상태 타입
export type Status = 'idle' | 'loading' | 'success' | 'error';

// 로딩 상태 타입
export interface LoadingState {
  status: Status;
  error?: string;
}

// 모달 타입
export interface ModalState {
  isOpen: boolean;
  data?: any;
}

// 토스트 메시지 타입
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

// 테마 타입
export type Theme = 'light' | 'dark' | 'system';

// 언어 타입
export type Language = 'ko' | 'en';

// 아이콘 타입
export type IconType =
  | 'file'
  | 'folder'
  | 'document'
  | 'image'
  | 'video'
  | 'audio'
  | 'archive'
  | 'code';

// 파일 타입
export interface FileInfo {
  name: string;
  size: number;
  type: string;
  lastModified: Date;
}

// 키보드 단축키 타입
export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  action: string;
  description: string;
}

// 메뉴 아이템 타입
export interface MenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  children?: MenuItem[];
}

// 탭 아이템 타입
export interface TabItem {
  id: string;
  label: string;
  content: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
}

// 드롭다운 옵션 타입
export interface DropdownOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

// 폼 필드 타입
export interface FormField {
  name: string;
  label: string;
  type:
    | 'text'
    | 'email'
    | 'password'
    | 'number'
    | 'textarea'
    | 'select'
    | 'checkbox'
    | 'radio';
  required?: boolean;
  placeholder?: string;
  options?: DropdownOption[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

// 폼 데이터 타입
export interface FormData {
  [key: string]: any;
}

// 폼 에러 타입
export interface FormErrors {
  [key: string]: string;
}
