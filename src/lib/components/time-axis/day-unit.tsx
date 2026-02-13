import React, { useEffect, useRef } from 'react';

import { ScrollEvent, scrollLeftEmitter } from '../../hooks/use-timeline-scroll';

import styles from './time-axis.module.scss';

const useTimeValueSticky = (
  dayRef: React.RefObject<HTMLSpanElement>,
  left: number,
  maxLeft: number
) => {
  const _scrollLeft = useRef<number>(0);

  useEffect(() => {
    const setTranslateX = (scrollLeft: number) => {
      if (dayRef.current) {
        const translateX = scrollLeft - left;

        if (
          translateX > 0 &&
          translateX < maxLeft - left - dayRef.current.offsetWidth
        ) {
          dayRef.current.style.transform = `translate(${translateX}px, 0)`;
        } else if (translateX <= 0) {
          dayRef.current.style.transform = `translate(0, 0)`;
        }
      }
    };

    setTranslateX(_scrollLeft.current);

    const onLeftScroll = ({ scrollLeft }: ScrollEvent) => {
      _scrollLeft.current = scrollLeft;
      setTranslateX(scrollLeft);
    };

    scrollLeftEmitter.on(onLeftScroll);

    return () => {
      scrollLeftEmitter.off(onLeftScroll);
    };
  }, [dayRef, maxLeft, left]);
};

interface DayProps {
  index: number;
  zoom: number;
  value: string;
}

const DayUnit = ({ index, zoom, value }: DayProps) => {
  const dayRef = useRef<HTMLSpanElement>(null);

  const left = index * 24 * zoom;
  const maxLeft = (index + 1) * 24 * zoom;

  useTimeValueSticky(dayRef, left, maxLeft);

  return (
    <>
      {index > 0 && <span className={styles.dayMarker} style={{ left }} />}
      <span ref={dayRef} className={styles.dayValue} style={{ left }}>
        {value}
      </span>
    </>
  );
};

export default DayUnit;
