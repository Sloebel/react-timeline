import React, { useCallback, useEffect, useRef, useState } from 'react';

import classNames from 'classnames';

import {
  notifyNeedToScrollHorizontal,
  scrollLeftEmitter,
  useHorizontalScrollByDrag,
} from '../../hooks/use-timeline-scroll';
import type { ScrollEvent } from '../../hooks/use-timeline-scroll';

import styles from './horizontal-scrollbar.module.scss';

interface Props {
  params: {
    viewWidth: number;
    rangeWidth: number;
  };
}

const MIN_THUMB_WIDTH = 20;

const preventDefault = (e: React.MouseEvent) => {
  e.preventDefault();
  e.stopPropagation();
};

const HorizontalScrollbar = ({ params }: Props) => {
  const { viewWidth, rangeWidth } = params;
  const thumbRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [thumbWidth, setThumbWidth] = useState(MIN_THUMB_WIDTH);
  const [hideScrollbar, setHideScrollbar] = useState(false);

  const handleResize = (trackSize: number) => {
    setThumbWidth(
      Math.max((viewWidth / rangeWidth) * trackSize, MIN_THUMB_WIDTH)
    );
  };

  const handleThumbPosition = useCallback(
    ({ scrollLeft }: ScrollEvent) => {
      if (thumbRef.current) {
        const trackSize = trackRef.current?.clientWidth || 0;
        const scrollTo = Math.max((scrollLeft / rangeWidth) * trackSize, 0);

        thumbRef.current.style.transform = `translate(${scrollTo}px, 0)`;
      }
    },
    [rangeWidth]
  );

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    if (viewWidth === rangeWidth) {
      timeoutId = setTimeout(() => {
        setHideScrollbar(true);
      }, 400);
    } else if (hideScrollbar) {
      setHideScrollbar(false);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [viewWidth, rangeWidth, hideScrollbar]);

  useEffect(() => {
    const trackSize = trackRef.current?.clientWidth || 0;

    if (viewWidth && rangeWidth && viewWidth !== rangeWidth) {
      handleResize(trackSize);
      scrollLeftEmitter.on(handleThumbPosition);
    }

    return () => {
      scrollLeftEmitter.off(handleThumbPosition);
    };
  }, [trackRef, viewWidth, rangeWidth, handleThumbPosition]);

  const handleTrackClick = (e: React.MouseEvent<HTMLElement>) => {
    preventDefault(e);

    const { clientX } = e;
    const target = e.target as HTMLDivElement;
    const rect = target.getBoundingClientRect();
    const trackLeft = rect.left;
    const thumbOffset = -(thumbWidth / 2);
    const trackSize = trackRef.current?.clientWidth || 1;

    const clickRatio = (clientX - trackLeft + thumbOffset) / trackSize;
    const maxScroll = rangeWidth - viewWidth;
    const scrollLeft = Math.min(
      Math.max(Math.floor(clickRatio * rangeWidth), 0),
      maxScroll
    );

    notifyNeedToScrollHorizontal({ scrollLeft, target });
  };

  const { handleThumbMousedown } = useHorizontalScrollByDrag({
    trackRef,
    viewWidth,
    rangeWidth,
  });

  return (
    <div
      className={classNames(styles.horizontalScroll, {
        [styles.fade]: viewWidth === rangeWidth,
        [styles.hide]: hideScrollbar,
      })}
    >
      <div
        ref={trackRef}
        className={styles.track}
        onClick={handleTrackClick}
      />
      <div
        ref={thumbRef}
        className={styles.thumb}
        style={{ width: thumbWidth }}
        onMouseDown={handleThumbMousedown}
        onClick={preventDefault}
      />
    </div>
  );
};

export default HorizontalScrollbar;
