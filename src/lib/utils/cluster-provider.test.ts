import type { TimelineItem } from '../types';
import { ClusterGenerator, clusterProvider } from './cluster-provider';

const makeItem = (id: number | string, rowId: number, start: number, end: number): TimelineItem => ({
	id,
	rowId,
	start,
	end
});

describe('ClusterGenerator', () => {
	let generator: ClusterGenerator;

	beforeEach(() => {
		generator = new ClusterGenerator();
	});

	describe('create', () => {
		it('sets start as min of two items, end as max, and items as both', () => {
			const item1 = makeItem(1, 0, 100, 200);
			const item2 = makeItem(2, 0, 150, 300);

			generator.create(item1, item2);

			expect(generator.item.start).toBe(100);
			expect(generator.item.end).toBe(300);
			expect(generator.item.items).toEqual([item1, item2]);
		});

		it('handles reversed order (nextItem earlier than item)', () => {
			const item1 = makeItem(1, 0, 200, 400);
			const item2 = makeItem(2, 0, 50, 250);

			generator.create(item1, item2);

			expect(generator.item.start).toBe(50);
			expect(generator.item.end).toBe(400);
			expect(generator.item.items).toEqual([item1, item2]);
		});
	});

	describe('addItem', () => {
		it('extends cluster with new item (grows end, keeps items)', () => {
			const item1 = makeItem(1, 0, 100, 200);
			const item2 = makeItem(2, 0, 150, 300);
			generator.create(item1, item2);

			const item3 = makeItem(3, 0, 400, 500);
			generator.addItem(item3);

			expect(generator.item.start).toBe(100);
			expect(generator.item.end).toBe(500);
			expect(generator.item.items).toEqual([item1, item2, item3]);
		});

		it('extends start when new item starts before cluster', () => {
			const item1 = makeItem(1, 0, 100, 200);
			const item2 = makeItem(2, 0, 150, 300);
			generator.create(item1, item2);

			const item3 = makeItem(3, 0, 50, 80);
			generator.addItem(item3);

			expect(generator.item.start).toBe(50);
			expect(generator.item.end).toBe(80);
			expect(generator.item.items).toEqual([item1, item2, item3]);
		});
	});

	describe('reset', () => {
		it('clears cluster to initial empty state', () => {
			const item1 = makeItem(1, 0, 100, 200);
			const item2 = makeItem(2, 0, 150, 300);
			generator.create(item1, item2);
			expect(generator.itemsInCluster).toBe(2);

			generator.reset();

			expect(generator.item.start).toBe(0);
			expect(generator.item.end).toBe(0);
			expect(generator.item.items).toEqual([]);
			expect(generator.itemsInCluster).toBe(0);
		});
	});
});

describe('clusterProvider.criteria', () => {
	it('returns true when item positions overlap (within 1px)', () => {
		const itemPosition = { left: 0, width: 100 };
		const nextItemPosition = { left: 99, width: 50 };
		// item ends at 0+100=100, next starts at 99. Overlap = 100 - 99 = 1 >= 1 -> true
		expect(clusterProvider.criteria(itemPosition, nextItemPosition)).toBe(true);
	});

	it('returns true when items clearly overlap', () => {
		const itemPosition = { left: 0, width: 100 };
		const nextItemPosition = { left: 50, width: 50 };
		expect(clusterProvider.criteria(itemPosition, nextItemPosition)).toBe(true);
	});

	it('returns false when items do not overlap', () => {
		const itemPosition = { left: 0, width: 100 };
		const nextItemPosition = { left: 101, width: 50 };
		// item ends at 100, next starts at 101. 100 - 101 + 1 = 0 < 1 -> false
		expect(clusterProvider.criteria(itemPosition, nextItemPosition)).toBe(false);
	});

	it('returns false when exactly touching (no overlap)', () => {
		const itemPosition = { left: 0, width: 100 };
		const nextItemPosition = { left: 100, width: 50 };
		// left + width - nextLeft = 100 - 100 = 0 < 1
		expect(clusterProvider.criteria(itemPosition, nextItemPosition)).toBe(false);
	});
});
