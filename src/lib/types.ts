import type { State } from '@popperjs/core';

import type { TimelineRowHoverEvent } from './hooks/use-row-hover';

export type TypeId = number | string;

export type TimelineItem = {
  id: TypeId;
  rowId: number;
  className?: string;
  selectedClassName?: string;
  start: number;
  end: number;
  content?: React.ReactNode;
  clickable?: boolean;
  shouldCluster?: boolean;
  backgroundItem?: boolean;
  title?: string;
  data?: {
    [key: string]: unknown;
  };
};

export type TimeLineClusterItem = {
  id: TypeId;
  rowId: number;
  start: number;
  end: number;
  items: TimelineItem[];
};

export type TimelineItemClick = (TimelineItem | TimeLineClusterItem) & {
  tooltipActive?: boolean;
};

export type TimelineRow = {
  rowId: string | number;
  order: number;
  items: TimelineItem[];
  className?: string;
};

export interface TimeAxisOptions {
  hideDaysValue?: boolean;
  dayFormat?: string;
  hourFormat?: string;
}

export interface ClusterOptions {
  getClusterClassName?: (items: TimelineItem[]) => string;
}

export type TimelineOptions = {
  minAxisTime: number;
  maxAxisTime: number;
  onRowHover?: (e: TimelineRowHoverEvent) => void;
  onScroll?: (scrollTop: number) => void;
  timeAxisOptions?: TimeAxisOptions;
  keepLayoutOnDom?: boolean;
  syncScrollOnWheel?: boolean;
  rowClassName?: string;
  cluster?: ClusterOptions | boolean;
  hourFormat?: string;
};

export interface TooltipRenderOptions {
  removeTooltip?: () => void;
  redrew: (() => Promise<Partial<State>>) | null;
}

export type TooltipRenderFunction = (
  items: TimelineItem[],
  options?: TooltipRenderOptions
) => JSX.Element;

export interface TimelinePublicApi {
  scrollTo: (scrollTop: number) => void;
  fitRange: (start: number, end: number) => void;
}

export interface HoursAxis {
  left: number;
  time: string;
}

export interface ClusterItem {
  start: number;
  end: number;
  items: TimelineItem[];
}

export interface ItemPosition {
  left: number;
  width: number;
}
