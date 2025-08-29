import { TreeNode } from '@/types/common';
import {
  CreateHandler,
  DeleteHandler,
  MoveHandler,
  RenameHandler,
  NodeApi,
  TreeApi,
} from 'react-arborist';
import { TreeStateNodes, TreeStateOpens } from '@/hooks/useTreeState';

// ===== ArboristTree 컴포넌트 Props 타입 =====

export interface ArboristTreeProps<T = TreeNode> {
  // === 데이터 관련 ===
  data?: T[];
  initialData?: T[];

  // === Controlled 모드 (React Arborist 고급 기능) ===
  nodes?: TreeStateNodes;
  opens?: TreeStateOpens;

  // === 이벤트 핸들러 (react-arborist 공식 API) ===
  onCreate?: CreateHandler<T>;
  onDelete?: DeleteHandler<T>;
  onMove?: MoveHandler<T>;
  onRename?: RenameHandler<T>;
  onToggle?: (id: string) => void;
  onSelect?: (nodes: NodeApi<T>[]) => void;
  onActivate?: (node: NodeApi<T>) => void;

  // === 검색 및 필터링 ===
  searchTerm?: string;
  searchMatch?: (node: NodeApi<T>, searchTerm: string) => boolean;

  // === 드래그 앤 드롭 ===
  canDrag?: boolean | string | ((node: NodeApi<T>) => boolean);
  canDrop?:
    | boolean
    | string
    | ((args: {
        parentNode: NodeApi<T>;
        dragNodes: NodeApi<T>[];
        index: number;
      }) => boolean);
  disableDrag?: boolean | string;
  disableDrop?: boolean | string;

  // === 레이아웃 ===
  width?: number | string;
  height?: number;
  rowHeight?: number;
  indent?: number;
  paddingTop?: number;
  paddingBottom?: number;
  padding?: number;
  overscanCount?: number;

  // === 설정 ===
  childrenAccessor?: string | ((node: T) => T[] | undefined);
  idAccessor?: string | ((node: T) => string);
  openByDefault?: boolean;
  selectionFollowsFocus?: boolean;
  disableMultiSelection?: boolean;
  disableEdit?: boolean | string;

  // === 선택 ===
  selection?: string;

  // === 접근성 ===
  'aria-label'?: string;
  'aria-describedby'?: string;

  // === 스타일링 ===
  className?: string;
  rowClassName?: string;

  // === 기타 ===
  dndRootElement?: Node | null;
  onClick?: React.MouseEventHandler;
  onContextMenu?: React.MouseEventHandler;
}

// ===== 노드 렌더러 Props 타입 =====

export interface TreeNodeProps<T = TreeNode> {
  node: NodeApi<T>;
  style: React.CSSProperties;
  dragHandle?: (el: HTMLDivElement | null) => void;
  tree?: TreeApi<T>;
  preview?: boolean;
}

// ===== 트리 액션 Props 타입 =====

export interface TreeActionsProps<T = TreeNode> {
  node: NodeApi<T>;
  onAction: (action: string, node: NodeApi<T>) => void;
  showActions?: boolean;
  showContextMenu?: boolean;
}

// ===== 컨텍스트 메뉴 Props 타입 =====

export interface TreeContextMenuProps<T = TreeNode> {
  node: NodeApi<T>;
  onAction: (action: string, node: NodeApi<T>) => void;
  x?: number;
  y?: number;
}

// ===== 커서 Props 타입 =====

export interface TreeCursorProps {
  top: number;
  left: number;
  indent: number;
}

// ===== 드래그 프리뷰 Props 타입 =====

export interface TreeDragPreviewProps {
  offset: { x: number; y: number } | null;
  mouse: { x: number; y: number } | null;
  id: string | null;
  dragIds: string[];
  isDragging: boolean;
}
