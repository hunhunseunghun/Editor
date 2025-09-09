/**
 * 새로운 항목의 순서를 계산하는 유틸리티 함수
 * @param position - 삽입할 위치 ('first', 'last', 'before', 'after')
 * @param targetOrder - 기준이 되는 항목의 순서 (before/after 시 필요)
 * @param existingOrders - 기존 항목들의 순서 목록
 * @returns 새로운 순서 값
 */
export function calculateNewOrder(
  position: 'first' | 'last' | 'before' | 'after',
  targetOrder?: number,
  existingOrders: number[] = [],
): number {
  // 기존 순서들을 정렬
  const sortedOrders = [...existingOrders].sort((a, b) => a - b);

  switch (position) {
    case 'first':
      // 가장 앞에 삽입
      if (sortedOrders.length === 0) {
        return 1000; // 기본 시작 값
      }
      return Math.max(0, sortedOrders[0] - 1000);

    case 'last':
      // 가장 뒤에 삽입
      if (sortedOrders.length === 0) {
        return 1000; // 기본 시작 값
      }
      return sortedOrders[sortedOrders.length - 1] + 1000;

    case 'before':
      if (targetOrder === undefined) {
        throw new Error('targetOrder is required for "before" position');
      }

      // 타겟 이전에 삽입
      const beforeIndex = sortedOrders.findIndex(
        (order) => order >= targetOrder,
      );
      if (beforeIndex === 0) {
        // 첫 번째 항목 앞에 삽입
        return Math.max(0, targetOrder - 1000);
      } else if (beforeIndex === -1) {
        // 모든 항목보다 뒤에 삽입 (실제로는 after와 같음)
        return targetOrder + 1000;
      } else {
        // 두 항목 사이에 삽입
        const prevOrder = sortedOrders[beforeIndex - 1];
        return Math.floor((prevOrder + targetOrder) / 2);
      }

    case 'after':
      if (targetOrder === undefined) {
        throw new Error('targetOrder is required for "after" position');
      }

      // 타겟 이후에 삽입
      const afterIndex = sortedOrders.findIndex((order) => order > targetOrder);
      if (afterIndex === -1) {
        // 마지막 항목 뒤에 삽입
        return targetOrder + 1000;
      } else {
        // 두 항목 사이에 삽입
        const nextOrder = sortedOrders[afterIndex];
        return Math.floor((targetOrder + nextOrder) / 2);
      }

    default:
      throw new Error(`Invalid position: ${position}`);
  }
}

/**
 * 드래그 앤 드롭으로 항목을 이동할 때 새로운 순서를 계산하는 함수
 * @param draggedItemOrder - 드래그된 항목의 현재 순서
 * @param dropTargetOrder - 드롭 대상의 순서
 * @param dropPosition - 드롭 위치 ('before', 'after')
 * @param allOrders - 모든 항목들의 순서 목록
 * @returns 새로운 순서 값
 */
export function calculateDragDropOrder(
  draggedItemOrder: number,
  dropTargetOrder: number,
  dropPosition: 'before' | 'after',
  allOrders: number[],
): number {
  // 드래그된 항목을 제외한 순서 목록
  const ordersWithoutDragged = allOrders.filter(
    (order) => order !== draggedItemOrder,
  );

  return calculateNewOrder(dropPosition, dropTargetOrder, ordersWithoutDragged);
}

/**
 * 연속된 순서 값들을 재정렬하는 함수
 * 순서 값들이 너무 가까워졌을 때 사용
 * @param items - 순서와 ID를 가진 항목들
 * @param startOrder - 시작 순서 값 (기본값: 1000)
 * @param step - 순서 간격 (기본값: 1000)
 * @returns 재정렬된 항목들
 */
export function reorderSequentially<T extends { id: string; order: number }>(
  items: T[],
  startOrder: number = 1000,
  step: number = 1000,
): T[] {
  // 현재 순서대로 정렬
  const sortedItems = [...items].sort((a, b) => a.order - b.order);

  // 새로운 순서 값 할당
  return sortedItems.map((item, index) => ({
    ...item,
    order: startOrder + index * step,
  }));
}

/**
 * 두 항목의 순서를 바꾸는 함수
 * @param item1Order - 첫 번째 항목의 순서
 * @param item2Order - 두 번째 항목의 순서
 * @returns 바뀐 순서 값들 [새로운 item1 순서, 새로운 item2 순서]
 */
export function swapOrders(
  item1Order: number,
  item2Order: number,
): [number, number] {
  return [item2Order, item1Order];
}

/**
 * 특정 범위의 항목들을 일괄적으로 이동시키는 함수
 * @param itemsToMove - 이동할 항목들의 순서 목록
 * @param targetOrder - 목표 위치의 순서
 * @param position - 삽입 위치 ('before', 'after')
 * @param allOrders - 모든 항목들의 순서 목록
 * @returns 이동할 항목들의 새로운 순서 값들
 */
export function calculateBulkMoveOrders(
  itemsToMove: number[],
  targetOrder: number,
  position: 'before' | 'after',
  allOrders: number[],
): number[] {
  // 이동할 항목들을 제외한 순서 목록
  const remainingOrders = allOrders.filter(
    (order) => !itemsToMove.includes(order),
  );

  // 첫 번째 항목의 위치 계산
  const firstNewOrder = calculateNewOrder(
    position,
    targetOrder,
    remainingOrders,
  );

  // 나머지 항목들은 순차적으로 배치
  return itemsToMove.map((_, index) => firstNewOrder + index * 100);
}

/**
 * 순서 값이 너무 가까워서 재정렬이 필요한지 확인하는 함수
 * @param orders - 순서 값들
 * @param minGap - 최소 간격 (기본값: 10)
 * @returns 재정렬 필요 여부
 */
export function needsReordering(
  orders: number[],
  minGap: number = 10,
): boolean {
  const sortedOrders = [...orders].sort((a, b) => a - b);

  for (let i = 1; i < sortedOrders.length; i++) {
    if (sortedOrders[i] - sortedOrders[i - 1] < minGap) {
      return true;
    }
  }

  return false;
}
