import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';

import {
	AutoSizer,
	Grid,
	type GridCellProps,
	type GridCellRangeProps,
	type ScrollParams,
	type Size,
	defaultCellRangeRenderer
} from 'react-virtualized';
import classNames from 'classnames';
import { useDebounce } from 'use-debounce';

import TimeAxis from './components/time-axis/time-axis';
import { type ScrollEvent, scrollLeftEmitter, useTimelineScroll } from './hooks/use-timeline-scroll';
import HorizontalScrollbar from './components/horizontal-scrollbar/horizontal-scrollbar';
import CurrentTimeBar from './components/current-time-bar/current-time-bar';
import type {
	ItemPosition,
	TimeLineClusterItem,
	TimelineItem,
	TimelineItemClick,
	TimelineOptions,
	TimelinePublicApi,
	TimelineRow,
	TooltipRenderFunction,
	TypeId
} from './types';
import { hourInMili, rowHeight, timeAxisHeight } from './consts';
import Controls from './components/controls/controls';
import GridRow, { EmptyRow } from './components/grid-row/grid-row';
import useZoom from './hooks/use-zoom';
import TimeLineItemTooltip from './components/timeline-item-tooltip/timeline-item-tooltip';
import useTimeAxis from './hooks/use-time-axis';
import GridLines from './components/grid-lines/grid-lines';
import { zoomProvider } from './utils/zoom-provider';

import styles from './react-timeline.module.scss';

const TIMELINE_GRID_CONTAINER = 'timeline-grid-container';
const GRID_INNER_SCROLL_CONTAINER = '.ReactVirtualized__Grid__innerScrollContainer';

interface Props {
	className?: string;
	rows: TimelineRow[];
	options: TimelineOptions;
	tooltipRenderer?: TooltipRenderFunction;
	tooltipCriteria?: (item: TimelineItemClick, event: React.MouseEvent<HTMLDivElement, MouseEvent>) => boolean;
	tooltipContainerSelector?: string;
	onClick?: (event: React.MouseEvent) => void;
	onItemClick?: (item: TimelineItemClick, event: React.MouseEvent<HTMLDivElement>) => void;
	selectedItemsIds?: Set<TypeId>;
	onZoomRangeChange?: (range: { start: number; end: number }) => void;
	hideDaysValue?: boolean;
}

const DEFAULT_EXTRA_ROWS = 3;
const extraScrollRows = (height: number, rowsLength = 0) => (rowsLength * rowHeight > height ? DEFAULT_EXTRA_ROWS : 0);
const calcRowsCount = (rows: TimelineRow[], height: number) =>
	rows?.length > 0 ? rows.length + extraScrollRows(height, rows?.length) : 0;

const ReactTimeline = forwardRef<TimelinePublicApi, Props>(
	(
		{
			rows,
			options,
			className,
			tooltipRenderer,
			tooltipCriteria,
			tooltipContainerSelector,
			onClick,
			onItemClick,
			selectedItemsIds: selectedItemsIdsProp,
			onZoomRangeChange,
			hideDaysValue = false
		},
		ref
	) => {
		const {
			minAxisTime: rangeStart,
			maxAxisTime: rangeEnd,
			keepLayoutOnDom = false,
			onScroll,
			syncScrollOnWheel,
			rowClassName,
			cluster
		} = options;
		const gridRef = useRef<Grid>(null);
		const gridContainerRef = useRef<HTMLDivElement | undefined>(undefined);
		const [gridInnerScrollRef, setGridInnerScrollRef] = useState<HTMLDivElement | null>(null);

		const [selectItemForTooltip, setSelectItemForTooltip] = useState<
			TimelineItem | TimeLineClusterItem | undefined
		>();
		const [selectedItemElement, setSelectedItemElement] = useState<HTMLElement | null>(null);
		const [viewWidth, setViewWidth] = useState<number>(0);
		const [_scrollTop, setScrollTop] = useState(false);

		useEffect(() => {
			gridContainerRef.current = document.getElementById(TIMELINE_GRID_CONTAINER) as HTMLDivElement;
		}, []);

		useEffect(() => {
			let observer: MutationObserver | undefined;
			let innerScrollElement: Element | null | undefined;

			innerScrollElement = gridContainerRef.current?.querySelector(GRID_INNER_SCROLL_CONTAINER);

			if (!gridInnerScrollRef) {
				if (innerScrollElement) {
					setGridInnerScrollRef(innerScrollElement as HTMLDivElement);
				} else if (gridContainerRef.current) {
					observer = new MutationObserver(() => {
						innerScrollElement = gridContainerRef.current?.querySelector(GRID_INNER_SCROLL_CONTAINER);

						if (innerScrollElement) {
							observer?.disconnect();
							setGridInnerScrollRef(innerScrollElement as HTMLDivElement);
						}
					});

					observer.observe(gridContainerRef.current, {
						subtree: true,
						childList: true
					});
				}
			}

			return () => {
				observer?.disconnect();
			};
		}, [gridInnerScrollRef]);

		useEffect(() => {
			if (viewWidth === 0) {
				setGridInnerScrollRef(null);
			}
		}, [viewWidth]);

		const removeTooltip = useCallback(() => {
			setSelectItemForTooltip(undefined);
			setSelectedItemElement(null);
		}, []);

		const { syncVerticalScroll, getLastScrollLeft } = useTimelineScroll({
			scrollElement: gridInnerScrollRef,
			container: gridContainerRef.current,
			onWheelCallback: removeTooltip,
			gridRef: gridRef.current,
			syncScrollOnWheel,
			onScroll
		});

		const [rangeWidth, setRangeWidth] = useState<number>(0);
		const [zoomRange, setZoomRange] = useState<{ start: number; end: number } | undefined>();

		const { zoom, zoomIn, zoomOut, fitRange } = useZoom({
			rows,
			viewWidth,
			rangeStart,
			rangeEnd,
			rangeWidth,
			setRangeWidth,
			setZoomRange,
			getLastScrollLeft
		});

		const [debouncedZoomRange] = useDebounce(zoomRange, 500);

		useEffect(() => {
			if (debouncedZoomRange) {
				onZoomRangeChange?.(debouncedZoomRange);
			}
		}, [debouncedZoomRange, onZoomRangeChange]);

		useEffect(() => {
			const onHorizontalScroll = ({ scrollLeft, target }: ScrollEvent) => {
				if (target) {
					setZoomRange(zoomProvider.calcZoomRange(scrollLeft, zoom, viewWidth, rangeStart));
				}
			};

			scrollLeftEmitter.on(onHorizontalScroll);

			return () => {
				scrollLeftEmitter.off(onHorizontalScroll);
			};
		}, [zoom, viewWidth, rangeStart]);

		useImperativeHandle(
			ref,
			() => ({
				scrollTo: (scrollTop: number) => {
					syncVerticalScroll(scrollTop);
				},
				fitRange
			}),
			[syncVerticalScroll, fitRange]
		);

		const { daysInRange, hoursValues } = useTimeAxis({
			rangeStart,
			rangeEnd,
			zoom,
			axisOptions: options.timeAxisOptions,
			hourFormat: options.hourFormat
		});

		const timeAxisParams = useMemo(
			() => ({
				viewWidth,
				rangeStart,
				rangeWidth,
				zoom,
				days: daysInRange,
				hours: hoursValues
			}),
			[viewWidth, rangeStart, rangeWidth, zoom, daysInRange, hoursValues]
		);

		const calcItemPosition = useCallback(
			(start: number, end: number): ItemPosition => {
				const left = ((start - rangeStart) / hourInMili) * zoom;
				const width = ((end - start) / hourInMili) * zoom;

				return { left, width };
			},
			[rangeStart, zoom]
		);

		const itemClick = (
			item: TimelineItemClick,
			itemElement: HTMLDivElement | null,
			event: React.MouseEvent<HTMLDivElement>
		) => {
			onItemClick?.(item, event);
			const criteriaFn = typeof tooltipCriteria === 'function' ? tooltipCriteria : () => true;

			if (criteriaFn(item, event)) {
				if (item.id === selectItemForTooltip?.id) {
					setSelectItemForTooltip(undefined);
				} else {
					setSelectItemForTooltip(item);
				}

				setSelectedItemElement(itemElement);
			}
		};

		const rowRenderer = ({ rowIndex, style, key }: GridCellProps) => {
			if ((viewWidth === 0 && keepLayoutOnDom) || !rows[rowIndex]) {
				return <EmptyRow key={key} style={style} />;
			}

			return (
				<GridRow
					key={key}
					row={rows[rowIndex]}
					className={classNames(rowClassName, rows[rowIndex].className)}
					style={style}
					calcItemPosition={calcItemPosition}
					onRowHover={options.onRowHover}
					onItemClick={itemClick}
					selectedItems={selectedItemsIdsProp}
					selectItemForTooltip={selectItemForTooltip}
					cluster={cluster}
				/>
			);
		};

		const handleScroll = (params: ScrollParams) => {
			setScrollTop(params.scrollTop > 0);

			if (!syncScrollOnWheel) {
				removeTooltip();
				onScroll?.(params.scrollTop);
			}
		};

		function cellRangeRenderer(props: GridCellRangeProps) {
			const children = defaultCellRangeRenderer(props);

			children.unshift(<GridLines key="grid-lines" hoursValues={hoursValues} />);
			children.push(<CurrentTimeBar key="current-time-bar" rangeStart={rangeStart} zoom={zoom} />);

			return children;
		}

		return (
			<>
				<div
					className={classNames(styles.timelineContainer, className)}
					data-testid="react-timeline"
					onClick={(e: React.MouseEvent) => {
						onClick?.(e);
					}}
				>
					<TimeAxis params={timeAxisParams} onWheelCallback={removeTooltip} hideDaysValue={hideDaysValue} />
					<AutoSizer
						onResize={(size: Size) => {
							setViewWidth(size.width);
						}}
					>
						{({ width, height }: { width: number; height: number }) => (
							<Grid
								id={TIMELINE_GRID_CONTAINER}
								ref={gridRef}
								className={styles.grid}
								style={{ overflowX: 'hidden' }}
								width={keepLayoutOnDom && width === 0 ? 1 : width}
								height={height - timeAxisHeight}
								rowCount={calcRowsCount(rows, height - timeAxisHeight)}
								rowHeight={rowHeight}
								cellRenderer={rowRenderer}
								columnCount={1}
								columnWidth={rangeWidth}
								onScroll={handleScroll}
								cellRangeRenderer={cellRangeRenderer}
							/>
						)}
					</AutoSizer>
					<HorizontalScrollbar params={{ viewWidth, rangeWidth }} />
					<Controls onZoomIn={zoomIn} onZoomOut={zoomOut} />
					<div className={classNames(styles.shadow, { [styles.scroll]: _scrollTop })} />
				</div>
				{selectItemForTooltip && (
					<TimeLineItemTooltip
						tooltipRender={tooltipRenderer}
						targetElement={selectedItemElement}
						item={selectItemForTooltip}
						removeTooltip={removeTooltip}
						shouldShowTooltipArrow={true}
						tooltipContainerSelector={tooltipContainerSelector}
					/>
				)}
			</>
		);
	}
);

ReactTimeline.displayName = 'ReactTimeline';

export default ReactTimeline;
