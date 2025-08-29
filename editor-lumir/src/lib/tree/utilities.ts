import { TreeItem, Projection } from '@/types/tree';

// 평면화된 아이템 타입
export interface FlattenedItem {
  id: string;
  parentId: string | null;
  depth: number;
  children: string[];
  type: 'folder' | 'document';
}

// 트리를 평면화하는 함수
export function flattenTree(items: TreeItem[]): FlattenedItem[] {
  const flattened: FlattenedItem[] = [];

  function flatten(
    items: TreeItem[],
    parentId: string | null = null,
    depth = 0,
  ): void {
    for (const item of items) {
      const flattenedItem: FlattenedItem = {
        id: item.id,
        parentId,
        depth,
        children: item.children.map(({ id }) => id),
        type: item.type,
      };

      flattened.push(flattenedItem);

      if (item.children.length > 0) {
        flatten(item.children, item.id, depth + 1);
      }
    }
  }

  flatten(items);
  return flattened;
}

// 평면화된 아이템을 트리로 변환
export function buildTree(flattenedItems: FlattenedItem[]): TreeItem[] {
  const itemMap: Record<string, TreeItem> = {};
  const root: TreeItem[] = [];

  for (const item of flattenedItems) {
    itemMap[item.id] = {
      id: item.id,
      type: item.type,
      children: [],
    };
  }

  for (const item of flattenedItems) {
    if (item.parentId == null) {
      root.push(itemMap[item.id]);
    } else {
      const parent = itemMap[item.parentId];
      if (parent) {
        parent.children.push(itemMap[item.id]);
      }
    }
  }

  return root;
}

// 아이템 제거
export function removeItem(items: TreeItem[], id: string): TreeItem[] {
  return items
    .filter((item) => item.id !== id)
    .map((item) => ({
      ...item,
      children: removeItem(item.children, id),
    }));
}

// 하위 아이템들 제거
export function removeChildrenOf(
  items: FlattenedItem[],
  ids: string[],
): FlattenedItem[] {
  const excludeParentIds = new Set<string>();

  for (const id of ids) {
    excludeParentIds.add(id);
  }

  return items.filter((item) => {
    if (item.parentId === null) {
      return true;
    }
    return !excludeParentIds.has(item.parentId);
  });
}

// 아이템 속성 설정
export function setProperty<T extends keyof TreeItem>(
  items: TreeItem[],
  id: string,
  property: T,
  setter: (value: TreeItem[T]) => TreeItem[T],
): TreeItem[] {
  return items.map((item) => {
    if (item.id === id) {
      return {
        ...item,
        [property]: setter(item[property]),
      };
    }

    return {
      ...item,
      children: setProperty(item.children, id, property, setter),
    };
  });
}

// 하위 아이템 개수 계산
export function getChildCount(items: TreeItem[], id: string): number {
  const item = findItem(items, id);
  return item ? item.children.length : 0;
}

// 아이템 찾기
export function findItem(items: TreeItem[], id: string): TreeItem | null {
  for (const item of items) {
    if (item.id === id) {
      return item;
    }

    const found = findItem(item.children, id);
    if (found) {
      return found;
    }
  }

  return null;
}

// 드래그 앤 드롭용 프로젝션 계산
export function getProjection(
  items: FlattenedItem[],
  activeId: string,
  overId: string,
  dragOffset: number,
  indentationWidth: number,
): Projection {
  const overItemIndex = items.findIndex(({ id }) => id === overId);
  const activeItemIndex = items.findIndex(({ id }) => id === activeId);
  const activeItem = items[activeItemIndex];
  const overItem = items[overItemIndex];

  const newItems = [...items];
  const [removed] = newItems.splice(activeItemIndex, 1);
  newItems.splice(overItemIndex, 0, removed);

  const previousItem = newItems[overItemIndex - 1];
  const nextItem = newItems[overItemIndex + 1];
  const dragDepth = getDragDepth(dragOffset, indentationWidth);
  const projectedDepth = activeItem.depth + dragDepth;
  const maxDepth = getMaxDepth({ previousItem });
  const minDepth = getMinDepth({ nextItem });
  let depth = projectedDepth;

  if (projectedDepth >= maxDepth) {
    depth = maxDepth;
  } else if (projectedDepth < minDepth) {
    depth = minDepth;
  }

  const getParentId = (): string | null => {
    if (depth === 0 || !previousItem) {
      return null;
    }

    if (depth === previousItem.depth) {
      return previousItem.parentId;
    }

    if (depth > previousItem.depth) {
      return previousItem.id;
    }

    const newParent = newItems
      .slice(0, overItemIndex)
      .reverse()
      .find((item) => item.depth === depth)?.parentId;

    return newParent ?? null;
  };

  // React Arborist의 opens 상태를 사용하므로 collapsed 체크 제거
  // 폴더가 닫혀있으면 자식으로 추가
  if (overItem.type === 'folder') {
    return {
      depth: overItem.depth + 1,
      parentId: overItem.id,
    };
  }

  return {
    depth,
    parentId: getParentId(),
  };
}

// 드래그 깊이 계산
export function getDragDepth(offset: number, indentationWidth: number): number {
  return Math.round(offset / indentationWidth);
}

// 최대 깊이 계산
export function getMaxDepth({
  previousItem,
}: {
  previousItem: FlattenedItem;
}): number {
  if (previousItem) {
    return previousItem.depth + 1;
  }
  return 0;
}

// 최소 깊이 계산
export function getMinDepth({ nextItem }: { nextItem: FlattenedItem }): number {
  if (nextItem) {
    return nextItem.depth;
  }
  return 0;
}
