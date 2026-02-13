import { useEffect, useState } from 'react';

import { hourInMili, zoomStep } from '../consts';
import type { TimelineRow } from '../types';
import {
  notifyNeedToScrollHorizontal,
  scrollOnZoom,
} from './use-timeline-scroll';
import { zoomProvider } from '../utils/zoom-provider';

interface Props {
  rows: TimelineRow[];
  viewWidth: number;
  rangeStart: number;
  rangeEnd: number;
  rangeWidth: number;
  setRangeWidth: (value: React.SetStateAction<number>) => void;
  setZoomRange: React.Dispatch<
    React.SetStateAction<
      | {
          start: number;
          end: number;
        }
      | undefined
    >
  >;
  getLastScrollLeft: () => number;
}

const isLessThenHour = (start: number, end: number) =>
  end - start < hourInMili;

const useZoom = ({
  rows,
  viewWidth,
  rangeStart,
  rangeEnd,
  rangeWidth,
  setRangeWidth,
  setZoomRange,
  getLastScrollLeft,
}: Props) => {
  const [zoom, setZoom] = useState<number>(zoomStep);

  const calcRangeWidth = (_zoom: number) => {
    let zoomToSet = _zoom;
    let rangeWidthToSet =
      rangeStart && rangeEnd
        ? ((rangeEnd - rangeStart) / hourInMili) * _zoom
        : 0;

    if (rangeWidthToSet < viewWidth) {
      zoomToSet = Math.floor(
        viewWidth / ((rangeEnd - rangeStart) / hourInMili)
      );
      rangeWidthToSet = viewWidth;
    }

    setRangeWidth(rangeWidthToSet);
    setZoom(zoomToSet);

    return { newRangeWidth: rangeWidthToSet, newZoom: zoomToSet };
  };

  useEffect(() => {
    const { newZoom } = calcRangeWidth(zoom);
    const scrollLeft = getLastScrollLeft();

    rows.length &&
      setZoomRange(
        zoomProvider.calcZoomRange(scrollLeft, newZoom, viewWidth, rangeStart)
      );
  }, [rows.length, viewWidth]);

  const zoomIn = () => {
    const zoomOffset = zoomProvider.calcZoomInOffset(zoom);
    const { newRangeWidth, newZoom } = calcRangeWidth(zoomOffset);

    const scrollLeft = scrollOnZoom({
      rangeWidth,
      newRangeWidth,
      viewWidth,
    });

    setZoomRange(
      zoomProvider.calcZoomRange(scrollLeft, newZoom, viewWidth, rangeStart)
    );
  };

  const zoomOut = () => {
    const zoomOffset = zoomProvider.calcZoomOutOffset(zoom);
    const { newRangeWidth, newZoom } = calcRangeWidth(zoomOffset);

    const scrollLeft = scrollOnZoom({
      rangeWidth,
      newRangeWidth,
      viewWidth,
    });

    setZoomRange(
      zoomProvider.calcZoomRange(scrollLeft, newZoom, viewWidth, rangeStart)
    );
  };

  const fitRange = (start: number, end: number) => {
    if (end - start <= 0) return;

    let startRange = start;
    let endRange = end;

    if (isLessThenHour(start, end)) {
      const center = (endRange - startRange) / 2;
      startRange = startRange + center - hourInMili / 2;
      endRange = endRange - center + hourInMili / 2;
    }

    const zoomToSet = Math.ceil(
      viewWidth / ((endRange - startRange) / hourInMili)
    );

    const { newZoom } = calcRangeWidth(zoomToSet);

    const scrollLeft =
      (Math.max(startRange - rangeStart, 0) / hourInMili) * zoomToSet;

    notifyNeedToScrollHorizontal({ scrollLeft });

    newZoom &&
      setZoomRange(
        zoomProvider.calcZoomRange(scrollLeft, newZoom, viewWidth, rangeStart)
      );
  };

  return { zoom, zoomIn, zoomOut, fitRange };
};

export default useZoom;
