import React, { useCallback, useRef, useMemo } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';
import moment from 'moment';
import { AutoSizer, List, type ListRowProps } from 'react-virtualized';

import Timeline from '../timeline';
import type { TimelineItem, TimelinePublicApi, TimelineRow, TypeId } from '../types';
import type { TimelineRowHoverEvent } from '../hooks/use-row-hover';
import { rowHeight, timeAxisHeight } from '../consts';

const meta: Meta = {
	title: 'Timeline/Synced Table'
};

export default meta;

const ROW_COUNT = 80;

const statuses = ['Active', 'Completed', 'Pending', 'In Transit', 'Delayed'] as const;
const statusColors: Record<string, string> = {
	Active: '#10b981',
	Completed: '#6b7280',
	Pending: '#f59e0b',
	'In Transit': '#3b82f6',
	Delayed: '#ef4444'
};
const drivers = [
	'John Smith',
	'Jane Doe',
	'Bob Wilson',
	'Alice Brown',
	'Mike Davis',
	'Sarah Lee',
	'Tom Clark',
	'Emma White'
];

interface TableRowData {
	id: number;
	route: string;
	driver: string;
	status: string;
	tasks: number;
}

function generateData() {
	const range = {
		start: moment().startOf('day').valueOf(),
		end: moment().startOf('day').add(1, 'day').valueOf()
	};

	const tableData: TableRowData[] = [];
	const timelineRows: TimelineRow[] = [];

	for (let i = 0; i < ROW_COUNT; i++) {
		const rowId = i + 1;
		const status = statuses[i % statuses.length];
		const driver = drivers[i % drivers.length];
		const taskCount = 2 + (i % 5);

		tableData.push({
			id: rowId,
			route: `R-${1000 + i}`,
			driver,
			status,
			tasks: taskCount
		});

		const items: TimelineItem[] = [];
		const baseHour = 6 + (i % 6);

		for (let j = 0; j < taskCount; j++) {
			const start = moment(range.start)
				.add(baseHour + j * 2.5, 'hours')
				.valueOf();
			const end = moment(start)
				.add(1 + Math.random() * 1.5, 'hours')
				.valueOf();

			if (end > range.end) {
				range.end = end;
			}

			items.push({
				id: `${rowId}-${j}`,
				rowId,
				start,
				end,
				className: `synced-item-${status.toLowerCase().replace(/\s/g, '-')}`,
				content: <span style={{ fontSize: 11, whiteSpace: 'nowrap' }}>Task {j + 1}</span>
			});
		}

		timelineRows.push({ rowId, order: i, items });
	}

	return { tableData, timelineRows, range };
}

const itemStyles = `
  .synced-item-active {
    --timeline-item-bg: #d1fae5;
    --timeline-item-border-color: #10b981;
    --timeline-item-hover-bg: #a7f3d0;
  }
  .synced-item-completed {
    --timeline-item-bg: #f3f4f6;
    --timeline-item-border-color: #9ca3af;
    --timeline-item-hover-bg: #e5e7eb;
  }
  .synced-item-pending {
    --timeline-item-bg: #fef3c7;
    --timeline-item-border-color: #f59e0b;
    --timeline-item-hover-bg: #fde68a;
  }
  .synced-item-in-transit {
    --timeline-item-bg: #dbeafe;
    --timeline-item-border-color: #3b82f6;
    --timeline-item-hover-bg: #bfdbfe;
  }
  .synced-item-delayed {
    --timeline-item-bg: #fee2e2;
    --timeline-item-border-color: #ef4444;
    --timeline-item-hover-bg: #fecaca;
  }
`;

const tableStyles: Record<string, React.CSSProperties> = {
	wrapper: {
		width: 380,
		minWidth: 380,
		borderRight: '1px solid var(--timeline-row-border-color, #e5e7eb)',
		display: 'flex',
		flexDirection: 'column',
		background: 'var(--timeline-container-bg, #fff)'
	},
	header: {
		height: timeAxisHeight,
		display: 'flex',
		alignItems: 'flex-end',
		borderBottom: '1px solid var(--timeline-row-border-color, #e5e7eb)',
		background: 'var(--timeline-axis-bg, #fff)',
		fontWeight: 600,
		fontSize: 12,
		color: 'var(--timeline-axis-color, #374151)',
		padding: 0,
		flexShrink: 0
	},
	headerCell: {
		padding: '0 8px',
		height: rowHeight,
		display: 'flex',
		alignItems: 'center'
	},
	row: {
		display: 'flex',
		alignItems: 'center',
		borderBottom: '1px solid var(--timeline-row-border-color, #e5e7eb)',
		fontSize: 13,
		color: 'var(--timeline-axis-color, #1f2937)',
		cursor: 'default'
	},
	cell: {
		padding: '0 8px',
		overflow: 'hidden',
		textOverflow: 'ellipsis',
		whiteSpace: 'nowrap' as const
	},
	statusBadge: {
		display: 'inline-block',
		padding: '1px 8px',
		borderRadius: 10,
		fontSize: 11,
		fontWeight: 500,
		color: '#fff'
	}
};

const columns = [
	{ key: 'route', label: '#', width: 70 },
	{ key: 'driver', label: 'Driver', width: 130 },
	{ key: 'status', label: 'Status', width: 100 },
	{ key: 'tasks', label: 'Tasks', width: 50 }
];

const storyCSS = `
  .synced-table-list::-webkit-scrollbar {
    display: none;
  }
  .synced-table-list {
    scrollbar-width: none;
    outline: none;
  }
  .hovered {
    background: var(--timeline-row-hover-bg);
  }
  .synced-table-shadow {
    position: absolute;
    top: 0;
    height: 8px;
    width: 100%;
    overflow: hidden;
    pointer-events: none;
    z-index: 1;
  }
  .synced-table-shadow::after {
    content: '';
    position: absolute;
    top: -1px;
    height: 1px;
    width: 100%;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.8);
    opacity: 0;
    transition: opacity 0.2s ease-in-out;
  }
  .synced-table-shadow.scrolled::after {
    opacity: 1;
  }
`;

const onRowEnter = (rowId: TypeId) => {
	document.querySelectorAll(`[class*=row-${rowId}]`).forEach(el => {
		el.classList.add('hovered');
	});
};

const onRowLeave = (rowId: TypeId) => {
	document.querySelectorAll(`[class*=row-${rowId}]`).forEach(el => {
		el.classList.remove('hovered');
	});
};

class RowHoverEmitter {
	private currentRow: TypeId | null = null;

	emitOver = (rowId: TypeId | null) => {
		if (rowId === null) {
			if (this.currentRow !== null) onRowLeave(this.currentRow);
			this.currentRow = null;
		} else if (rowId !== this.currentRow) {
			if (this.currentRow !== null) onRowLeave(this.currentRow);
			onRowEnter(rowId);
			this.currentRow = rowId;
		}
	};
}

const DEFAULT_EXTRA_ROWS = 3;
const extraScrollRows = (height: number, rowsLength: number) =>
	rowsLength * rowHeight > height ? DEFAULT_EXTRA_ROWS : 0;

function SyncedTableTimeline() {
	const timelineRef = useRef<TimelinePublicApi>(null);
	const listRef = useRef<List>(null);
	const lastScrollTopRef = useRef(0);
	const [isScrolled, setIsScrolled] = React.useState(false);
	const rowEmitterRef = useRef(new RowHoverEmitter());

	const { tableData, timelineRows, range } = useMemo(() => generateData(), []);

	const handleTimelineScroll = useCallback((scrollTop: number) => {
		if (Math.abs(scrollTop - lastScrollTopRef.current) < 1) return;
		lastScrollTopRef.current = scrollTop;
		setIsScrolled(scrollTop > 0);
		listRef.current?.scrollToPosition(scrollTop);
	}, []);

	const handleListScroll = useCallback(({ scrollTop }: { scrollTop: number }) => {
		if (Math.abs(scrollTop - lastScrollTopRef.current) < 1) return;
		lastScrollTopRef.current = scrollTop;
		setIsScrolled(scrollTop > 0);
		timelineRef.current?.scrollTo(scrollTop);
	}, []);

	const handleTimelineRowHover = useCallback((e: TimelineRowHoverEvent) => {
		rowEmitterRef.current.emitOver(e.rowId ?? null);
	}, []);

	const tableRowRenderer = useCallback(
		({ index, key, style }: ListRowProps) => {
			const row = tableData[index];
			if (!row) {
				return <div key={key} style={style} />;
			}

			return (
				<div
					key={key}
					className={`synced-row-${row.id}`}
					style={{ ...style, ...tableStyles.row }}
					onMouseEnter={() => onRowEnter(row.id)}
					onMouseLeave={() => onRowLeave(row.id)}
				>
					<div style={{ ...tableStyles.cell, width: columns[0].width, fontWeight: 500 }}>{row.route}</div>
					<div style={{ ...tableStyles.cell, width: columns[1].width }}>{row.driver}</div>
					<div style={{ ...tableStyles.cell, width: columns[2].width }}>
						<span style={{ ...tableStyles.statusBadge, background: statusColors[row.status] }}>
							{row.status}
						</span>
					</div>
					<div style={{ ...tableStyles.cell, width: columns[3].width, textAlign: 'center' }}>{row.tasks}</div>
				</div>
			);
		},
		[tableData]
	);

	return (
		<div
			style={{
				display: 'flex',
				height: '100%',
				border: '1px solid var(--timeline-row-border-color, #e5e7eb)',
				borderRadius: 8,
				overflow: 'hidden'
			}}
		>
			<style>{itemStyles}</style>
			<style>{storyCSS}</style>

			<div style={tableStyles.wrapper} onMouseLeave={() => rowEmitterRef.current.emitOver(null)}>
				<div style={tableStyles.header}>
					{columns.map(col => (
						<div key={col.key} style={{ ...tableStyles.headerCell, width: col.width }}>
							{col.label}
						</div>
					))}
				</div>

				<div style={{ flex: 1, position: 'relative' }}>
					<AutoSizer>
						{({ width, height }) => (
							<List
								ref={listRef}
								className="synced-table-list"
								width={width}
								height={height}
								rowCount={tableData.length + extraScrollRows(height, tableData.length)}
								rowHeight={rowHeight}
								rowRenderer={tableRowRenderer}
								onScroll={handleListScroll}
							/>
						)}
					</AutoSizer>
					<div className={`synced-table-shadow${isScrolled ? ' scrolled' : ''}`} />
				</div>
			</div>

			<div style={{ flex: 1, minWidth: 0 }} onMouseLeave={() => rowEmitterRef.current.emitOver(null)}>
				<Timeline
					ref={timelineRef}
					rows={timelineRows}
					options={{
						minAxisTime: range.start,
						maxAxisTime: range.end,
						syncScrollOnWheel: true,
						onScroll: handleTimelineScroll,
						onRowHover: handleTimelineRowHover
					}}
				/>
			</div>
		</div>
	);
}

export const SyncedWithTable: StoryObj = {
	render: () => <SyncedTableTimeline />
};
