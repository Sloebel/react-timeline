import React from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';
import moment from 'moment';

import Timeline from '../timeline';
import { getData } from '../mocks/data';
import type { TimelineItem, TimelineRow } from '../types';

const meta: Meta<typeof Timeline> = {
	component: Timeline,
	title: 'Timeline/Custom Theme'
};

export default meta;

type Story = StoryObj<typeof Timeline>;

const { range } = getData();

const darkThemeVars = `
  .dark-theme-wrapper {
    --timeline-container-bg: #111827;
    --timeline-grid-line-color: #374151;
    --timeline-day-line-color: #6b7280;
    --timeline-row-border-color: #374151;
    --timeline-item-bg: #1f2937;
    --timeline-item-border-color: #6b7280;
    --timeline-item-hover-bg: #4b5563;
    --timeline-item-selected-bg: #6b7280;
    --timeline-axis-bg: #111827;
    --timeline-axis-color: #e5e7eb;
    --timeline-now-bar-color: #f59e0b;
    --timeline-controls-bg: #1f2937;
    --timeline-controls-border-color: #374151;
    --timeline-controls-button-color: #e5e7eb;
    --timeline-controls-button-hover-bg: #374151;
    --timeline-controls-button-focus-outline: #6b7280;
  }
`;

const compactLayoutVars = `
  .compact-layout-wrapper {
    --timeline-row-height: 24px;
    --timeline-item-height: 20px;
    --timeline-item-radius: 1px;
  }
`;

const coloredItemsStyles = `
  .item-completed {
    --timeline-item-bg: #10b981;
    --timeline-item-border-color: #059669;
    --timeline-item-hover-bg: #059669;
  }
  .item-overdue {
    --timeline-item-bg: #ef4444;
    --timeline-item-border-color: #dc2626;
    --timeline-item-hover-bg: #dc2626;
  }
  .item-pending {
    --timeline-item-bg: #f59e0b;
    --timeline-item-border-color: #d97706;
    --timeline-item-hover-bg: #d97706;
  }
`;

function buildColoredRows(): TimelineRow[] {
	const base = moment(range.start);
	const rows: TimelineRow[] = [];
	const statuses = ['completed', 'overdue', 'pending'] as const;

	for (let r = 0; r < 8; r++) {
		const rowStart = base.clone().add(r * 4, 'hours');
		const items: TimelineItem[] = [];

		for (let i = 0; i < 5; i++) {
			const status = statuses[i % 3];
			const start = rowStart.clone().add(i * 2, 'hours');
			const end = start.clone().add(1, 'hour');
			items.push({
				id: `row-${r}-${i}`,
				rowId: r + 1,
				start: start.valueOf(),
				end: end.valueOf(),
				content: <span>{status}</span>,
				className: `item-${status}`
			});
		}

		rows.push({ rowId: r + 1, order: r, items });
	}

	return rows;
}

const coloredRows = buildColoredRows();
const coloredRange = {
	start: moment(range.start).valueOf(),
	end: moment(range.start).add(2, 'days').valueOf()
};

const variablesListStyle: React.CSSProperties = {
	marginBottom: 12,
	padding: '10px 12px',
	fontSize: 12,
	fontFamily: 'monospace',
	background: 'var(--timeline-container-bg, #f9fafb)',
	border: '1px solid var(--timeline-row-border-color, #e5e7eb)',
	borderRadius: 4,
	color: 'var(--timeline-axis-color, #1f2937)'
};

const DarkThemeVariables = [
	'--timeline-container-bg',
	'--timeline-grid-line-color',
	'--timeline-day-line-color',
	'--timeline-row-border-color',
	'--timeline-item-bg',
	'--timeline-item-border-color',
	'--timeline-item-hover-bg',
	'--timeline-item-selected-bg',
	'--timeline-axis-bg',
	'--timeline-axis-color',
	'--timeline-now-bar-color',
	'--timeline-controls-bg',
	'--timeline-controls-border-color',
	'--timeline-controls-button-color',
	'--timeline-controls-button-hover-bg',
	'--timeline-controls-button-focus-outline'
];

const ColoredItemsVariables = [
	'--timeline-item-bg (per .item-completed / .item-overdue / .item-pending)',
	'--timeline-item-border-color (per class)',
	'--timeline-item-hover-bg (per class)'
];

const CompactLayoutVariables = ['--timeline-row-height', '--timeline-item-height', '--timeline-item-radius'];

export const DarkTheme: Story = {
	args: {
		rows: getData().rows,
		options: {
			minAxisTime: range.start,
			maxAxisTime: range.end
		}
	},
	render: args => (
		<>
			<style>{darkThemeVars}</style>
			<div className="dark-theme-wrapper" style={{ padding: 16, background: '#111827', borderRadius: 8 }}>
				<div style={variablesListStyle}>
					<strong>Theme variables used:</strong>
					<ul style={{ margin: '6px 0 0', paddingLeft: 20 }}>
						{DarkThemeVariables.map(v => (
							<li key={v}>{v}</li>
						))}
					</ul>
				</div>
				<div style={{ height: 400 }}>
					<Timeline {...args} />
				</div>
			</div>
		</>
	)
};

export const ColoredItems: Story = {
	args: {
		rows: coloredRows,
		options: {
			minAxisTime: coloredRange.start,
			maxAxisTime: coloredRange.end
		}
	},
	render: args => (
		<>
			<style>{coloredItemsStyles}</style>
			<div style={{ padding: 16 }}>
				<div style={variablesListStyle}>
					<strong>Theme variables used:</strong>
					<ul style={{ margin: '6px 0 0', paddingLeft: 20 }}>
						{ColoredItemsVariables.map(v => (
							<li key={v}>{v}</li>
						))}
					</ul>
				</div>
				<p style={{ marginBottom: 8, fontSize: 14, color: '#6b7280' }}>
					Items colored by status: green = completed, red = overdue, amber = pending
				</p>
				<div style={{ height: 320 }}>
					<Timeline {...args} />
				</div>
			</div>
		</>
	)
};

export const CompactLayout: Story = {
	args: {
		rows: getData().rows,
		options: {
			minAxisTime: range.start,
			maxAxisTime: range.end
		}
	},
	render: args => (
		<>
			<style>{compactLayoutVars}</style>
			<div className="compact-layout-wrapper" style={{ padding: 16 }}>
				<div style={variablesListStyle}>
					<strong>Theme variables used:</strong>
					<ul style={{ margin: '6px 0 0', paddingLeft: 20 }}>
						{CompactLayoutVariables.map(v => (
							<li key={v}>{v}</li>
						))}
					</ul>
				</div>
				<p style={{ marginBottom: 8, fontSize: 14, color: '#6b7280' }}>
					Denser layout via --timeline-row-height and --timeline-item-height
				</p>
				<div style={{ height: 400 }}>
					<Timeline {...args} />
				</div>
			</div>
		</>
	)
};
