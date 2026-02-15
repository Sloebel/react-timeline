import React, { useRef, useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';
import moment from 'moment';

import Timeline from './timeline';
import { getData } from './mocks/data';
import type { TimelineItem, TimelinePublicApi } from './types';

const meta: Meta<typeof Timeline> = {
	component: Timeline,
	title: 'Timeline'
};

export default meta;

type Story = StoryObj<typeof Timeline>;

const { rows, range } = getData();

const Tooltip = ({ items }: { items: TimelineItem[] }) => {
	const [index, setIndex] = useState(0);

	return (
		<div style={{ background: 'white', padding: 4 }}>
			<div>
				<div>Hi, I am item #{items[index].id}</div>
				<div>start: {new Date(items[index].start).toLocaleString()}</div>
				<div>end: {new Date(items[index].end).toLocaleString()}</div>
			</div>
			{items.length > 1 && (
				<div>
					<button
						type="button"
						onClick={() => setIndex(i => Math.max(0, i - 1))}
						disabled={index === 0}
						aria-label="Previous"
					>
						‹
					</button>
					<button
						type="button"
						onClick={() => setIndex(i => Math.min(items.length - 1, i + 1))}
						disabled={index === items.length - 1}
						aria-label="Next"
					>
						›
					</button>
				</div>
			)}
		</div>
	);
};

export const Primary: Story = {
	args: {
		rows,
		options: {
			minAxisTime: range.start,
			maxAxisTime: range.end
		},
		tooltipRenderer: (items: TimelineItem[]) => {
			return <Tooltip items={items} />;
		}
	}
};

const fitRangeTo = {
	oneDay: {
		start: moment(range.start).add(1, 'day').valueOf(),
		end: moment(range.start).add(2, 'day').valueOf()
	},
	halfAnHour: {
		start: moment(range.start).add(1, 'day').add(23.5, 'hour').valueOf(),
		end: moment(range.start).add(2, 'day').valueOf()
	}
};

const FitRangeExample = (args: React.ComponentProps<typeof Timeline>) => {
	const timelineApiRef = useRef<TimelinePublicApi>(null);

	const fitRange = (start: number, end: number) => {
		timelineApiRef.current?.fitRange?.(start, end);
	};

	return (
		<>
			<style>{`
        #storybook-root {
          display: flex;
          flex-direction: column;
        }
        .range-select-row {
          height: 32px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .fit-range-story {
          border: 1px solid lightgrey;
          border-radius: 4px;
        }
      `}</style>
			<div className="range-select-row">
				<label htmlFor="range-select">Range To Fit: </label>
				<select
					id="range-select"
					style={{ height: 24 }}
					onChange={e => {
						if (!e.target.value) return;
						const [start, end] = e.target.value.split(',');
						fitRange(Number(start), Number(end));
					}}
				>
					<option value="">--</option>
					<option value={`${range.start}, ${range.end}`}>full range</option>
					<option
						value={`${fitRangeTo.oneDay.start}, ${fitRangeTo.oneDay.end}`}
					>{`${moment(fitRangeTo.oneDay.start).format('D MMM, HH:mm')} -> ${moment(fitRangeTo.oneDay.end).format('D MMM, HH:mm')}`}</option>
					<option
						value={`${fitRangeTo.halfAnHour.start}, ${fitRangeTo.halfAnHour.end}`}
					>{`${moment(fitRangeTo.halfAnHour.start).format('D MMM, HH:mm')} -> ${moment(fitRangeTo.halfAnHour.end).format('D MMM, HH:mm')}`}</option>
				</select>
			</div>
			<Timeline {...args} ref={timelineApiRef} className="fit-range-story" />
		</>
	);
};

export const FitRange: Story = {
	args: {
		rows,
		options: {
			minAxisTime: range.start,
			maxAxisTime: range.end
		}
	},
	render: args => <FitRangeExample {...args} />
};

const { rows: rowsWithEmptyRows, range: rangeWithEmptyRows } = getData({ withEmptyRows: true });

export const WithEmptyRows: Story = {
	args: {
		rows: rowsWithEmptyRows,
		options: {
			minAxisTime: rangeWithEmptyRows.start,
			maxAxisTime: rangeWithEmptyRows.end
		},
		tooltipRenderer: (items: TimelineItem[]) => {
			return <Tooltip items={items} />;
		}
	},
	render: args => (
		<>
			<style>{`
        .empty-row {
          background: #f0f0f0;
        }
      `}</style>
			<Timeline {...args} />
		</>
	)
};

const { rows: rowsWithClusters, range: rangeWithClusters } = getData({ withCluster: true });

export const WithCluster: Story = {
	args: {
		rows: rowsWithClusters,
		options: {
			minAxisTime: rangeWithClusters.start,
			maxAxisTime: rangeWithClusters.end
		},
		tooltipRenderer: (items: TimelineItem[]) => {
			return <Tooltip items={items} />;
		}
	}
};
