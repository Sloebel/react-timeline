import { useMemo } from 'react';

import moment from 'moment';

import { minutesInHour, oneDay, zoomStep } from '../consts';
import type { TimeAxisOptions } from '../types';

const DEFAULT_DATE_FORMAT = 'D MMM YYYY';

// eslint-disable-next-line no-shadow -- enum declaration false positive
enum MinutesFactor {
  none = 0,
  thirty = 2,
  fifteen = 4,
  ten = 6,
  five = 12,
}

const showThirty = (zoom: number) => zoom / zoomStep > 2 && zoom / zoomStep < 5;
const showFifteen = (zoom: number) => zoom / zoomStep > 4 && zoom / zoomStep < 7;
const showTen = (zoom: number) => zoom / zoomStep > 6 && zoom / zoomStep < 11;
const showFive = (zoom: number) => zoom / zoomStep > 10;

const getMinutesFactor = (zoom: number) => {
  if (zoom / zoomStep <= 2) return MinutesFactor.none;
  if (showThirty(zoom)) return MinutesFactor.thirty;
  if (showFifteen(zoom)) return MinutesFactor.fifteen;
  if (showTen(zoom)) return MinutesFactor.ten;
  if (showFive(zoom)) return MinutesFactor.five;
};

const countDaysInRange = (rangeEnd: number, rangeStart: number) =>
  Math.ceil((rangeEnd - rangeStart) / oneDay);

const getInnerHourMarkers = (
  hourIndex: number,
  zoom: number,
  factor: number,
  time: string,
  hourFormat: string
) => {
  return Array.from({ length: factor - 1 }).map((_, factorIndex) => {
    const minutesFactor = (factorIndex + 1) / factor;
    const minutesDigits = `${minutesFactor * minutesInHour}`.padStart(2, '0');
    return {
      left: hourIndex * zoom + zoom * minutesFactor,
      time: moment(time, hourFormat)
        .add(minutesDigits, 'minutes')
        .format(hourFormat),
    };
  });
};

interface Props {
  rangeStart: number;
  rangeEnd: number;
  zoom: number;
  axisOptions?: TimeAxisOptions;
  hourFormat?: string;
}

const useTimeAxis = ({
  rangeStart,
  rangeEnd,
  zoom,
  axisOptions,
  hourFormat = 'H:mm',
}: Props) => {
  const daysInRange = useMemo(
    () =>
      Array.from({ length: countDaysInRange(rangeEnd, rangeStart) }, (_, index) =>
        moment(rangeStart)
          .startOf('day')
          .add(index, 'days')
          .format(axisOptions?.dayFormat || DEFAULT_DATE_FORMAT)
      ),
    [rangeEnd, rangeStart, axisOptions]
  );

  const hoursInRange = useMemo(
    () => Array.from({ length: 24 * daysInRange.length }),
    [daysInRange]
  );

  const hoursValues = useMemo(() => {
    const minutesFactor = getMinutesFactor(zoom);

    if (zoom < zoomStep / 4) return [];

    return hoursInRange.reduce(
      (markers: { left: number; time: string }[], _, index) => {
        if (zoom < zoomStep / 2 && index % 3 !== 0) return markers;
        if (zoom < (zoomStep * 3) / 4 && index % 4 !== 0) return markers;
        if (zoom < zoomStep && index % 2 !== 0) return markers;

        const formattedHour = moment(index % 24, 'H').format(hourFormat);

        const roundHourMarker = { left: index * zoom, time: formattedHour };

        if (index !== 0) {
          markers.push(roundHourMarker);
        }

        if (minutesFactor) {
          markers.push(
            ...getInnerHourMarkers(
              index,
              zoom,
              minutesFactor,
              roundHourMarker.time,
              hourFormat
            )
          );
        }

        return markers;
      },
      [] as { left: number; time: string }[]
    );
  }, [hoursInRange, zoom, hourFormat]);

  return { hoursValues, daysInRange };
};

export default useTimeAxis;
