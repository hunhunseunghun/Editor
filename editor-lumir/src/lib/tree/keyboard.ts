import type { SensorContext } from '@/types/tree';

interface Coordinates {
  x: number;
  y: number;
}

type UniqueIdentifier = string | number;

// 키보드 네비게이션용 좌표 계산 함수
export function sortableTreeKeyboardCoordinates(
  context: React.MutableRefObject<SensorContext>,
  indicator: boolean,
  indentationWidth: number,
) {
  return (
    event: KeyboardEvent,
    args: {
      active: UniqueIdentifier;
      currentCoordinates: Coordinates;
      context: SensorContext;
    },
  ) => {
    const { active, currentCoordinates } = args;
    const { items } = context.current;

    switch (event.key) {
      case 'ArrowDown': {
        const currentIndex = items.findIndex(
          ({ id }) => id === active.toString(),
        );
        const nextItem = items[currentIndex + 1];

        if (nextItem) {
          return {
            ...currentCoordinates,
            y: currentCoordinates.y + 50,
          };
        }

        break;
      }

      case 'ArrowUp': {
        const currentIndex = items.findIndex(
          ({ id }) => id === active.toString(),
        );
        const previousItem = items[currentIndex - 1];

        if (previousItem) {
          return {
            ...currentCoordinates,
            y: currentCoordinates.y - 50,
          };
        }

        break;
      }

      case 'ArrowRight': {
        const currentIndex = items.findIndex(
          ({ id }) => id === active.toString(),
        );
        const currentItem = items[currentIndex];
        const nextItem = items[currentIndex + 1];

        if (nextItem && nextItem.depth > currentItem.depth) {
          return {
            ...currentCoordinates,
            x: currentCoordinates.x + indentationWidth,
          };
        }

        break;
      }

      case 'ArrowLeft': {
        const currentIndex = items.findIndex(
          ({ id }) => id === active.toString(),
        );
        const currentItem = items[currentIndex];

        if (currentItem.depth > 0) {
          return {
            ...currentCoordinates,
            x: currentCoordinates.x - indentationWidth,
          };
        }

        break;
      }

      case 'Enter':
      case ' ': {
        event.preventDefault();
        break;
      }
    }

    return currentCoordinates;
  };
}
