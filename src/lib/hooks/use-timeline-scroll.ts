import { useCallback, useEffect, useState } from 'react';

import type { Grid } from 'react-virtualized';

import { EventEmitter } from '../utils/event-emitter';

let lastScrollTop = 0;
let lastScrollLeft = 0;

export interface ScrollEvent {
  scrollLeft: number;
  target?: HTMLElement | 'timeline';
}

export const scrollLeftEmitter = new EventEmitter<ScrollEvent>();

const wheelEventAdapter = ({
  deltaX,
  deltaY,
  shiftKey,
}: WheelEvent) =>
  shiftKey && deltaY !== 0
    ? { deltaX: deltaY, deltaY: deltaX }
    : { deltaX, deltaY };

const SCROLL_KEY_DELTA = 30;

const keydownEventAdapter = ({ code }: KeyboardEvent) => {
  const delta = { deltaY: 0, deltaX: 0 };

  switch (code) {
    case 'ArrowUp':
      delta.deltaY = -SCROLL_KEY_DELTA;
      break;
    case 'ArrowDown':
      delta.deltaY = SCROLL_KEY_DELTA;
      break;
    case 'ArrowLeft':
      delta.deltaX = -SCROLL_KEY_DELTA;
      break;
    case 'ArrowRight':
      delta.deltaX = SCROLL_KEY_DELTA;
      break;
  }

  return delta;
};

const shouldScroll = ({ code }: KeyboardEvent) =>
  ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(code);

export function notifyNeedToScrollHorizontal({
  target,
  scrollLeft,
  immediate,
}: ScrollEvent & { immediate?: boolean }) {
  lastScrollLeft = scrollLeft;

  if (immediate) {
    scrollLeftEmitter.emit({ scrollLeft: lastScrollLeft, target });
    return;
  }

  requestAnimationFrame(() => {
    scrollLeftEmitter.emit({ scrollLeft: lastScrollLeft, target });
  });
}

interface Props {
  scrollElement: HTMLElement | null;
  container: HTMLElement | null | undefined;
  onWheelCallback?: () => void;
  gridRef?: Grid | null;
  syncScrollOnWheel?: boolean;
  onScroll?: (scrollTop: number) => void;
}

export const useTimelineScroll = ({
  scrollElement,
  container,
  onWheelCallback,
  gridRef,
  syncScrollOnWheel,
  onScroll,
}: Props) => {
  const syncVerticalScroll = (newScrollTop: number) => {
    if (newScrollTop !== lastScrollTop) {
      lastScrollTop = newScrollTop;

      gridRef?.scrollToPosition({ scrollTop: lastScrollTop, scrollLeft: 0 });
      onScroll?.(lastScrollTop);
      onWheelCallback?.();
    }
  };

  useEffect(() => {
    let elementWidth = 0;
    let containerWidth = 0;
    let maxHorizontalScroll = 0;

    let elementHeight = 0;
    let containerHeight = 0;
    let maxVerticalScroll = 0;

    const calcProps = () => {
      if (!elementWidth) {
        elementWidth = scrollElement?.offsetWidth || 0;
        maxHorizontalScroll = Math.max(elementWidth - containerWidth, 0);
      }
      if (!containerWidth) {
        containerWidth = container?.offsetWidth || 0;
        maxHorizontalScroll = Math.max(elementWidth - containerWidth, 0);
      }

      if (!elementHeight) {
        elementHeight = scrollElement?.offsetHeight || 0;
        maxVerticalScroll = Math.max(elementHeight - containerHeight, 0);
      }
      if (!containerHeight) {
        containerHeight = container?.offsetHeight || 0;
        maxVerticalScroll = Math.max(elementHeight - containerHeight, 0);
      }
    };

    const dispatchScroll = (deltaX: number, deltaY: number, event: Event) => {
      if (
        maxHorizontalScroll !== 0 &&
        Math.abs(deltaX) >= Math.abs(deltaY)
      ) {
        event.preventDefault();

        const targetScrollLeft = Math.min(
          Math.max(lastScrollLeft + deltaX, 0),
          maxHorizontalScroll
        );

        if (targetScrollLeft !== lastScrollLeft) {
          notifyNeedToScrollHorizontal({
            scrollLeft: targetScrollLeft,
            target: event.target as HTMLElement,
          });
        }
      }

      if (maxVerticalScroll !== 0 && syncScrollOnWheel) {
        event.preventDefault();
        const newScrollTop = Math.min(
          Math.max(lastScrollTop + deltaY, 0),
          maxVerticalScroll
        );
        syncVerticalScroll(newScrollTop);
      }
    };

    const onWheel = (event: WheelEvent) => {
      calcProps();
      const { deltaX, deltaY } = wheelEventAdapter(event);
      dispatchScroll(deltaX, deltaY, event);
    };

    const onScrollBar = (e: Event) => {
      e.preventDefault();
      const newScrollTop = (e.target as Element).scrollTop;

      if (
        syncScrollOnWheel &&
        onScroll &&
        lastScrollTop !== newScrollTop
      ) {
        lastScrollTop = newScrollTop;
        onScroll(newScrollTop);
      }
    };

    container?.addEventListener('scroll', onScrollBar);

    container?.addEventListener('wheel', onWheel, {
      passive: false,
    });

    const onKeydown = (event: KeyboardEvent) => {
      if (!shouldScroll(event)) return;
      const { deltaX, deltaY } = keydownEventAdapter(event);
      calcProps();
      dispatchScroll(deltaX, deltaY, event);
    };

    container?.addEventListener('keydown', onKeydown);

    const horizontalScroll = ({ scrollLeft }: ScrollEvent) => {
      if (scrollElement)
        scrollElement.style.transform = `translate(${-scrollLeft}px, 0)`;
      onWheelCallback?.();
    };

    scrollLeftEmitter.on(horizontalScroll);

    let resizeObserver: ResizeObserver;

    if (scrollElement && container) {
      resizeObserver = new ResizeObserver((entries) => {
        const { width: _elementWidth, height: _elementHeight } =
          entries.find((item) => item.target === scrollElement)?.contentRect ||
          {};
        const { width: _containerWidth, height: _containerHeight } =
          entries.find((item) => item.target === container)?.contentRect || {};

        elementWidth = _elementWidth || scrollElement.offsetWidth;
        elementHeight = _elementHeight || scrollElement?.offsetHeight || 0;
        containerWidth = _containerWidth || container.offsetWidth;
        containerHeight = _containerHeight || container?.offsetHeight || 0;

        maxHorizontalScroll = Math.max(elementWidth - containerWidth, 0);
        maxVerticalScroll = Math.max(elementHeight - containerHeight, 0);

        const targetScroll = Math.min(
          Math.max(lastScrollLeft, 0),
          maxHorizontalScroll
        );

        if (targetScroll !== lastScrollLeft) {
          notifyNeedToScrollHorizontal({
            scrollLeft: targetScroll,
            immediate: true,
            target: scrollElement,
          });
        }
      });

      resizeObserver.observe(scrollElement);
      resizeObserver.observe(container);
    }

    return () => {
      container?.removeEventListener('wheel', onWheel);
      container?.removeEventListener('keydown', onKeydown);
      container?.removeEventListener('scroll', onScrollBar);
      scrollLeftEmitter.off(horizontalScroll);

      if (scrollElement && container) {
        resizeObserver.unobserve(scrollElement);
        resizeObserver.unobserve(container);
      }
      resizeObserver?.disconnect();
    };
  }, [container, scrollElement, gridRef, syncScrollOnWheel, onScroll]);

  const getLastScrollLeft = () => lastScrollLeft;

  return { syncVerticalScroll, getLastScrollLeft };
};

export const useHorizontalScrollByDrag = ({
  trackRef,
  viewWidth,
  rangeWidth,
}: {
  trackRef: React.RefObject<HTMLDivElement>;
  viewWidth: number;
  rangeWidth: number;
}) => {
  const [scrollStartPosition, setScrollStartPosition] = useState<number>(0);
  const [initialScrollLeft, setInitialScrollLeft] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);

  const handleThumbMousemove = useCallback(
    (e: MouseEvent) => {
      if (isDragging) {
        e.preventDefault();
        e.stopPropagation();

        const deltaX = e.clientX - scrollStartPosition;
        const trackSize = trackRef.current?.clientWidth || 1;
        const newScrollLeft =
          ((initialScrollLeft + deltaX) / trackSize) * rangeWidth;
        const scrollLeft = Math.min(
          Math.max(newScrollLeft, 0),
          rangeWidth - viewWidth
        );

        notifyNeedToScrollHorizontal({
          scrollLeft,
          target: e.target as HTMLElement,
        });
      }
    },
    [
      trackRef,
      isDragging,
      scrollStartPosition,
      viewWidth,
      rangeWidth,
      initialScrollLeft,
    ]
  );

  const handleThumbMouseup = useCallback((e: MouseEvent) => {
    if (isDragging) {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
    }
  }, [isDragging]);

  useEffect(() => {
    document.addEventListener('mousemove', handleThumbMousemove);
    document.addEventListener('mouseup', handleThumbMouseup);
    document.addEventListener('mouseleave', handleThumbMouseup);
    return () => {
      document.removeEventListener('mousemove', handleThumbMousemove);
      document.removeEventListener('mouseup', handleThumbMouseup);
      document.removeEventListener('mouseleave', handleThumbMouseup);
    };
  }, [handleThumbMousemove, handleThumbMouseup]);

  const handleThumbMousedown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setScrollStartPosition(e.clientX);
    const trackSize = trackRef.current?.clientWidth || 0;
    setInitialScrollLeft((lastScrollLeft / rangeWidth) * trackSize);
    setIsDragging(true);
  };

  return {
    handleThumbMousedown,
  };
};

export const scrollOnZoom = ({
  rangeWidth,
  newRangeWidth,
  viewWidth,
}: {
  rangeWidth: number;
  newRangeWidth: number;
  viewWidth: number;
}) => {
  const ratio = newRangeWidth / rangeWidth;
  const middle = lastScrollLeft + viewWidth / 2;
  const newMiddle = ratio * middle;
  const newLeft = newMiddle - viewWidth / 2;

  if (newLeft !== lastScrollLeft) {
    notifyNeedToScrollHorizontal({ scrollLeft: newLeft });
  }

  return newLeft;
};
