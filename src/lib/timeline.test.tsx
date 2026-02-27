/// <reference types="vitest/globals" />
import React from 'react';

import { render, fireEvent } from '@testing-library/react';

import Timeline from './timeline';
import type { TimelineRow } from './types';

vi.mock('react-virtualized', async () => {
	const actual = await vi.importActual<typeof import('react-virtualized')>('react-virtualized');

	const MockAutoSizer = ({
		children,
		onResize
	}: {
		children: (size: { width: number; height: number }) => React.ReactNode;
		onResize?: (size: { width: number; height: number }) => void;
	}) => {
		React.useEffect(() => {
			onResize?.({ width: 800, height: 600 });
		}, [onResize]);

		return <div style={{ width: 800, height: 600 }}>{children({ width: 800, height: 600 })}</div>;
	};

	return { ...actual, AutoSizer: MockAutoSizer };
});

const createRows = (count: number, itemsPerRow = 2): { rows: TimelineRow[]; range: { start: number; end: number } } => {
	const start = new Date('2025-06-01T00:00:00Z').getTime();
	const end = new Date('2025-06-02T00:00:00Z').getTime();

	const rows: TimelineRow[] = Array.from({ length: count }, (_, i) => ({
		rowId: i + 1,
		order: i,
		items: Array.from({ length: itemsPerRow }, (_item, j) => ({
			id: `${i + 1}_${j + 1}`,
			rowId: i + 1,
			start: start + j * 3600000,
			end: start + (j + 1) * 3600000,
			content: <span>{`Item ${i + 1}-${j + 1}`}</span>
		}))
	}));

	return { rows, range: { start, end } };
};

describe('Timeline', () => {
	it('should render successfully', () => {
		const { rows, range } = createRows(3, 10);
		const { baseElement } = render(
			<Timeline
				rows={rows}
				options={{
					minAxisTime: range.start,
					maxAxisTime: range.end
				}}
			/>
		);
		expect(baseElement).toBeTruthy();
	});

	it('should render time axis with hour markers', () => {
		const { rows, range } = createRows(3);
		const { container } = render(
			<Timeline rows={rows} options={{ minAxisTime: range.start, maxAxisTime: range.end }} />
		);

		const hourMarkers = container.querySelectorAll('[class*="hourMarker"]');
		expect(hourMarkers.length).toBeGreaterThan(0);
	});

	it('should render rows with correct test ids', () => {
		const { rows, range } = createRows(5);
		const { container } = render(
			<Timeline rows={rows} options={{ minAxisTime: range.start, maxAxisTime: range.end }} />
		);

		for (const row of rows) {
			const el = container.querySelector(`[data-test-id="timeline-row-${row.rowId}"]`);
			expect(el).toBeTruthy();
		}
	});

	it('should render zoom-in and zoom-out controls', () => {
		const { rows, range } = createRows(1);
		const { container } = render(
			<Timeline rows={rows} options={{ minAxisTime: range.start, maxAxisTime: range.end }} />
		);

		const zoomIn = container.querySelector('[data-test-id="timeline-zoom-in-button"]');
		const zoomOut = container.querySelector('[data-test-id="timeline-zoom-out-button"]');
		expect(zoomIn).toBeTruthy();
		expect(zoomOut).toBeTruthy();
	});

	it('should call onItemClick when an item is clicked', () => {
		const { rows, range } = createRows(2, 1);
		const onItemClick = vi.fn();

		const { container } = render(
			<Timeline
				rows={rows}
				options={{ minAxisTime: range.start, maxAxisTime: range.end }}
				onItemClick={onItemClick}
			/>
		);

		const item = container.querySelector('[data-test-id^="timeline-item-"]');
		expect(item).toBeTruthy();

		fireEvent.click(item!);
		expect(onItemClick).toHaveBeenCalledTimes(1);

		const callArgs = onItemClick.mock.calls[0];
		expect(callArgs[0]).toHaveProperty('id');
	});

	it('should render without crashing when rows are empty', () => {
		const start = new Date('2025-06-01T00:00:00Z').getTime();
		const end = new Date('2025-06-02T00:00:00Z').getTime();

		const { container } = render(<Timeline rows={[]} options={{ minAxisTime: start, maxAxisTime: end }} />);

		const timeline = container.querySelector('[data-test-id="timeline"]');
		expect(timeline).toBeTruthy();

		const rowElements = container.querySelectorAll('[data-test-id^="timeline-row-"]');
		expect(rowElements.length).toBe(0);
	});
});
