import { useEffect } from 'react';

export interface TimelineRowHoverEvent {
  rowId?: number | string;
}

const useRowHover = (
  ref: React.RefObject<HTMLDivElement>,
  rowId: number | string,
  callback?: (e: TimelineRowHoverEvent) => void
) => {
  useEffect(() => {
    if (!ref.current || !callback) return;

    const el = ref.current;

    const onMouseEnter = () => callback({ rowId });
    const onMouseLeave = () => callback({ rowId: undefined });

    if (el) {
      ref.current.addEventListener('mouseenter', onMouseEnter);
      ref.current.addEventListener('mouseleave', onMouseLeave);
    }

    return () => {
      el?.removeEventListener('mouseenter', onMouseEnter);
      el?.removeEventListener('mouseleave', onMouseLeave);
    };
  }, [ref, rowId, callback]);
};

export default useRowHover;
