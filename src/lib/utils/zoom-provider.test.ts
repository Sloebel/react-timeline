import { zoomStep } from '../consts';
import { zoomProvider } from './zoom-provider';

describe('zoomProvider', () => {
	describe('calcZoomInOffset', () => {
		it('returns next step when below zoomStep (step progression)', () => {
			// zoomStep/12 = 5, /4 = 15, /2 = 30, 3/4 = 45
			expect(zoomProvider.calcZoomInOffset(1)).toBe(zoomStep / 12);
			expect(zoomProvider.calcZoomInOffset(4)).toBe(zoomStep / 12);
			expect(zoomProvider.calcZoomInOffset(zoomStep / 12)).toBe(zoomStep / 4);
			expect(zoomProvider.calcZoomInOffset(zoomStep / 4)).toBe(zoomStep / 2);
			expect(zoomProvider.calcZoomInOffset(zoomStep / 2)).toBe((zoomStep * 3) / 4);
			expect(zoomProvider.calcZoomInOffset((zoomStep * 3) / 4)).toBe(zoomStep);
		});

		it('returns zoomStep when at zoomStep (boundary)', () => {
			expect(zoomProvider.calcZoomInOffset(zoomStep)).toBe(zoomStep * 2);
		});

		it('returns zoom + zoomStep when above zoomStep and aligned', () => {
			expect(zoomProvider.calcZoomInOffset(zoomStep * 2)).toBe(zoomStep * 3);
			expect(zoomProvider.calcZoomInOffset(zoomStep * 3)).toBe(zoomStep * 4);
		});

		it('snaps to next step for non-aligned values above zoomStep', () => {
			const nonAligned = zoomStep + 7;
			expect(zoomProvider.calcZoomInOffset(nonAligned)).toBe(
				nonAligned + zoomStep - ((nonAligned - zoomStep) % zoomStep)
			);
			expect(zoomProvider.calcZoomInOffset(zoomStep + 1)).toBe(zoomStep * 2);
			expect(zoomProvider.calcZoomInOffset(zoomStep + 59)).toBe(zoomStep * 2);
		});
	});

	describe('calcZoomOutOffset', () => {
		it('returns previous step when at or below zoomStep (step regression)', () => {
			expect(zoomProvider.calcZoomOutOffset(zoomStep)).toBe((zoomStep * 3) / 4);
			expect(zoomProvider.calcZoomOutOffset((zoomStep * 3) / 4)).toBe(zoomStep / 2);
			expect(zoomProvider.calcZoomOutOffset(zoomStep / 2)).toBe(zoomStep / 4);
			expect(zoomProvider.calcZoomOutOffset(zoomStep / 4)).toBe(zoomStep / 12);
			expect(zoomProvider.calcZoomOutOffset(zoomStep / 12)).toBe(1);
		});

		it('returns 1 when zoom is at minimum', () => {
			expect(zoomProvider.calcZoomOutOffset(1)).toBe(1);
		});

		it('returns zoom - zoomStep when above zoomStep and aligned', () => {
			expect(zoomProvider.calcZoomOutOffset(zoomStep * 2)).toBe(zoomStep);
			expect(zoomProvider.calcZoomOutOffset(zoomStep * 3)).toBe(zoomStep * 2);
		});

		it('snaps to previous step for non-aligned values above zoomStep', () => {
			expect(zoomProvider.calcZoomOutOffset(zoomStep + 1)).toBe(zoomStep);
			expect(zoomProvider.calcZoomOutOffset(zoomStep + 59)).toBe(zoomStep);
			const nonAligned = zoomStep * 2 + 10;
			expect(zoomProvider.calcZoomOutOffset(nonAligned)).toBe(nonAligned - ((nonAligned - zoomStep) % zoomStep));
		});
	});

	describe('calcZoomRange', () => {
		const hourInMili = 3600000;

		it('computes start and end for known scrollLeft, zoom, viewWidth, rangeStart', () => {
			const scrollLeft = 0;
			const zoom = 60;
			const viewWidth = 600;
			const rangeStart = 0;

			const result = zoomProvider.calcZoomRange(scrollLeft, zoom, viewWidth, rangeStart);

			const expectedStart = Math.floor((scrollLeft / zoom) * hourInMili + rangeStart);
			const expectedEnd = Math.floor(((scrollLeft + viewWidth) / zoom) * hourInMili + rangeStart);

			expect(result.start).toBe(expectedStart);
			expect(result.end).toBe(expectedEnd);
			expect(result.start).toBe(0);
			expect(result.end).toBe(36000000); // 10 hours in ms
		});

		it('shifts range by scrollLeft and rangeStart', () => {
			const scrollLeft = 120; // 2 hours at zoom 60
			const zoom = 60;
			const viewWidth = 60; // 1 hour
			const rangeStart = 1000;

			const result = zoomProvider.calcZoomRange(scrollLeft, zoom, viewWidth, rangeStart);

			expect(result.start).toBe(Math.floor((scrollLeft / zoom) * hourInMili + rangeStart));
			expect(result.end).toBe(Math.floor(((scrollLeft + viewWidth) / zoom) * hourInMili + rangeStart));
		});
	});
});
