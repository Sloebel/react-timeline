import { hourInMili, zoomStep } from '../consts';

const calcZoomOutOffset = (zoom: number) => {
  if (zoom > zoomStep && (zoom - zoomStep) % zoomStep !== 0)
    return zoom - ((zoom - zoomStep) % zoomStep);

  if (zoom <= zoomStep) {
    if (zoom > (zoomStep * 3) / 4) return (zoomStep * 3) / 4;
    if (zoom > zoomStep / 2) return zoomStep / 2;
    if (zoom > zoomStep / 4) return zoomStep / 4;
    if (zoom > zoomStep / 12) return zoomStep / 12;
    return 1;
  }

  return zoom - zoomStep;
};

const calcZoomInOffset = (zoom: number) => {
  if (zoom > zoomStep && (zoom - zoomStep) % zoomStep !== 0)
    return zoom + zoomStep - ((zoom - zoomStep) % zoomStep);

  if (zoom < zoomStep) {
    if (zoom < zoomStep / 12) return zoomStep / 12;
    if (zoom < zoomStep / 4) return zoomStep / 4;
    if (zoom < zoomStep / 2) return zoomStep / 2;
    if (zoom < (zoomStep * 3) / 4) return (zoomStep * 3) / 4;
    return zoomStep;
  }

  return zoom + zoomStep;
};

const calcZoomRange = (
  scrollLeft: number,
  zoom: number,
  viewWidth: number,
  rangeStart: number
) => {
  const zoomRangeStart = Math.floor(
    (scrollLeft / zoom) * hourInMili + rangeStart
  );
  const zoomRangeEnd = Math.floor(
    ((scrollLeft + viewWidth) / zoom) * hourInMili + rangeStart
  );

  return { start: zoomRangeStart, end: zoomRangeEnd };
};

export const zoomProvider = {
  calcZoomRange,
  calcZoomOutOffset,
  calcZoomInOffset,
};
