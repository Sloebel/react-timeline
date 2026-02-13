import React, { memo } from 'react';

import { useTimelineScroll } from '../../hooks/use-timeline-scroll';
import CurrentTimeBar from '../current-time-bar/current-time-bar';
import type { HoursAxis } from '../../types';
import DayUnit from './day-unit';

import styles from './time-axis.module.scss';

interface Props {
  params: {
    hours: HoursAxis[];
    days: string[];
    viewWidth: number;
    rangeWidth: number;
    rangeStart: number;
    zoom: number;
  };
  onWheelCallback?: () => void;
  hideDaysValue?: boolean;
}

const TimeAxis = memo(({ params, onWheelCallback, hideDaysValue }: Props) => {
  const { viewWidth, rangeWidth, rangeStart, zoom, days, hours } = params;

  const containerRef = React.useRef<HTMLDivElement>(null);
  const rowRef = React.useRef<HTMLDivElement>(null);

  useTimelineScroll({
    scrollElement: rowRef.current,
    container: containerRef.current,
    onWheelCallback,
  });

  return (
    <div
      className={styles.timelineHeader}
      ref={containerRef}
      style={{ width: viewWidth }}
    >
      <div className="header-scroll" ref={rowRef} style={{ width: rangeWidth }}>
        <CurrentTimeBar
          key="current-time-bar"
          rangeStart={rangeStart}
          zoom={zoom}
          topBar
        />
        <div className={styles.daysRow}>
          {!hideDaysValue &&
            days.map((day, index) => (
              <DayUnit key={index} index={index} zoom={zoom} value={day} />
            ))}
        </div>
        <div className={styles.hoursRow}>
          {hours.map(({ left, time }, index) => (
            <span
              key={index}
              className={styles.hourMarker}
              style={{ left }}
            >
              <span className={styles.hourValue}>{time}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
});

export default TimeAxis;
