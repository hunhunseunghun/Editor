import { User } from './entities';

// 사용자 프로필 타입
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  image?: string | null;
}

// 사용자 생성 요청 타입
export interface CreateUserRequest {
  email: string;
  name: string;
  image?: string;
}

// 사용자 업데이트 요청 타입
export interface UpdateUserRequest {
  name?: string;
  image?: string;
}

// 사용자 조회 응답 타입
export interface UserResponse {
  success: boolean;
  data: User;
  message?: string;
}

// 사용자 목록 조회 응답 타입
export interface UsersResponse {
  success: boolean;
  data: User[];
  message?: string;
}

// 사용자 통계 타입
export interface UserStats {
  totalDocuments: number;
  totalFolders: number;
  lastActiveAt: Date;
}

// 사용자 설정 타입
export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  language: 'ko' | 'en';
  notifications: {
    email: boolean;
    push: boolean;
  };
  editor: {
    autoSave: boolean;
    spellCheck: boolean;
  };
}

// 사용자 활동 로그 타입
export interface UserActivity {
  _id: string;
  userId: string;
  action:
    | 'login'
    | 'logout'
    | 'create_document'
    | 'update_document'
    | 'delete_document';
  details?: Record<string, any>;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
}

// 사용자 권한 타입
export type UserRole = 'user' | 'admin' | 'moderator';

// 사용자 상태 타입
export type UserStatus = 'active' | 'inactive' | 'suspended' | 'deleted';

// 사용자 필터 타입
export interface UserFilter {
  role?: UserRole;
  status?: UserStatus;
  search?: string;
  createdAfter?: Date;
  createdBefore?: Date;
}

// 사용자 정렬 타입
export type UserSortType = 'name' | 'email' | 'createdAt' | 'lastActiveAt';

// 사용자 정렬 방향 타입
export type UserSortDirection = 'asc' | 'desc';

// 사용자 정렬 옵션 타입
export interface UserSortOptions {
  field: UserSortType;
  direction: UserSortDirection;
}

// 사용자 목록 조회 파라미터 타입
export interface GetUsersParams {
  filter?: UserFilter;
  sort?: UserSortOptions;
  limit?: number;
  offset?: number;
}
