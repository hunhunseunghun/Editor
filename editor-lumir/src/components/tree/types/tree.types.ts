import { TreeNode } from '@/types/tree';

// ===== react-arborist 공식 API 기반 타입 정의 =====

// 기본 노드 상태 타입
export interface NodeState {
  isEditing: boolean;
  isDragging: boolean;
  isSelected: boolean;
  isSelectedStart: boolean;
  isSelectedEnd: boolean;
  isFocused: boolean;
  isOpen: boolean;
  isClosed: boolean;
  isLeaf: boolean;
  isInternal: boolean;
  willReceiveDrop: boolean;
}

// 노드 API 타입 (react-arborist의 NodeApi와 구분하기 위해 TreeNodeApi로 명명)
export interface TreeNodeApi<T = TreeNode> {
  id: string;
  data: T;
  state: NodeState;
  level: number;
  index: number;
  parent: TreeNodeApi<T> | null;
  children: TreeNodeApi<T>[];
  isOpen: boolean;
  isClosed: boolean;
  isLeaf: boolean;
  isInternal: boolean;
  isSelected: boolean;
  isFocused: boolean;
  isEditing: boolean;
  isDragging: boolean;
  willReceiveDrop: boolean;
  toggle: () => void;
  select: () => void;
  focus: () => void;
  edit: () => void;
  submit: (value: string) => void;
  cancel: () => void;
  delete: () => void;
  move: (parentId: string | null, index: number) => void;
  createChild: (type: 'internal' | 'leaf') => void;
}

// 트리 API 타입 (react-arborist의 TreeApi와 구분하기 위해 TreeComponentApi로 명명)
export interface TreeComponentApi<T = TreeNode> {
  nodes: TreeNodeApi<T>[];
  selectedNodes: TreeNodeApi<T>[];
  focusedNode: TreeNodeApi<T> | null;
  editingNode: TreeNodeApi<T> | null;
  expandedNodes: TreeNodeApi<T>[];
  collapsedNodes: TreeNodeApi<T>[];
  rootNodes: TreeNodeApi<T>[];
  select: (nodeIds: string[]) => void;
  focus: (nodeId: string) => void;
  expand: (nodeIds: string[]) => void;
  collapse: (nodeIds: string[]) => void;
  expandAll: () => void;
  collapseAll: () => void;
  createNode: (parentId: string | null, type: 'internal' | 'leaf') => void;
  deleteNodes: (nodeIds: string[]) => void;
  moveNodes: (
    nodeIds: string[],
    parentId: string | null,
    index: number,
  ) => void;
  renameNode: (nodeId: string, name: string) => void;
}

// 이벤트 핸들러 타입들
export interface CreateArgs<T = TreeNode> {
  parentId: string | null;
  parentNode: TreeNodeApi<T> | null;
  index: number;
  type: 'internal' | 'leaf';
}

export interface MoveArgs<T = TreeNode> {
  dragIds: string[];
  dragNodes: TreeNodeApi<T>[];
  parentId: string | null;
  parentNode: TreeNodeApi<T> | null;
  index: number;
}

export interface DeleteArgs<T = TreeNode> {
  ids: string[];
  nodes: TreeNodeApi<T>[];
}

export interface RenameArgs<T = TreeNode> {
  id: string;
  node: TreeNodeApi<T>;
  name: string;
}

export interface ToggleArgs<T = TreeNode> {
  id: string;
  node: TreeNodeApi<T>;
  isOpen: boolean;
}

export interface SelectArgs<T = TreeNode> {
  ids: string[];
  nodes: TreeNodeApi<T>[];
}

export interface ActivateArgs<T = TreeNode> {
  id: string;
  node: TreeNodeApi<T>;
}

// 핸들러 함수 타입들
export type CreateHandler<T = TreeNode> = (
  args: CreateArgs<T>,
) => { id: string } | void;
export type MoveHandler<T = TreeNode> = (args: MoveArgs<T>) => void;
export type DeleteHandler<T = TreeNode> = (args: DeleteArgs<T>) => void;
export type RenameHandler<T = TreeNode> = (args: RenameArgs<T>) => void;
export type ToggleHandler<T = TreeNode> = (args: ToggleArgs<T>) => void;
export type SelectHandler<T = TreeNode> = (args: SelectArgs<T>) => void;
export type ActivateHandler<T = TreeNode> = (args: ActivateArgs<T>) => void;

// 조건 함수 타입들
export type CanDragHandler<T = TreeNode> = (node: T) => boolean;
export type CanDropHandler<T = TreeNode> = (
  dragNode: T,
  dropNode: T,
) => boolean;
export type SearchFilterHandler<T = TreeNode> = (
  node: T,
  searchTerm: string,
) => boolean;
export type SortChildrenHandler<T = TreeNode> = (a: T, b: T) => number;

// 렌더링 함수 타입들
export type RenderRowHandler<T = TreeNode> = (props: {
  node: TreeNodeApi<T>;
  style: React.CSSProperties;
  dragHandle?: (el: HTMLDivElement | null) => void;
}) => React.ReactElement;

export type RenderDragPreviewHandler<T = TreeNode> = (props: {
  node: TreeNodeApi<T>;
  style: React.CSSProperties;
}) => React.ReactElement;

export type RenderCursorHandler<T = TreeNode> = (props: {
  node: TreeNodeApi<T>;
  style: React.CSSProperties;
}) => React.ReactElement;

export type RenderDropIndicatorHandler<T = TreeNode> = (props: {
  node: TreeNodeApi<T>;
  style: React.CSSProperties;
}) => React.ReactElement;

export type RenderLoadingHandler = () => React.ReactElement;
export type RenderEmptyHandler = () => React.ReactElement;
export type RenderContextMenuHandler<T = TreeNode> = (props: {
  node: TreeNodeApi<T>;
  x: number;
  y: number;
}) => React.ReactElement;
export type RenderTooltipHandler<T = TreeNode> = (props: {
  node: TreeNodeApi<T>;
}) => React.ReactElement;

// 접근자 함수 타입들
export type ChildrenAccessor<T = TreeNode> = (node: T) => T[] | undefined;
export type IdAccessor<T = TreeNode> = (node: T) => string;
export type GetItemKeyHandler<T = TreeNode> = (
  node: T,
  index: number,
) => string | number;
