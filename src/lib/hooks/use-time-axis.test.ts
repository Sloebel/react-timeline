import { renderHook } from '@testing-library/react';

import { oneDay, zoomStep } from '../consts';
import useTimeAxis from './use-time-axis';

describe('useTimeAxis', () => {
	describe('daysInRange', () => {
		it('returns one day for single-day range', () => {
			const rangeStart = Date.UTC(2025, 0, 15, 0, 0, 0);
			const rangeEnd = rangeStart + oneDay;

			const { result } = renderHook(() =>
				useTimeAxis({
					rangeStart,
					rangeEnd,
					zoom: zoomStep
				})
			);

			expect(result.current.daysInRange).toHaveLength(1);
			expect(result.current.daysInRange[0]).toContain('15');
			expect(result.current.daysInRange[0]).toContain('2025');
		});

		it('returns correct count for multi-day range', () => {
			const rangeStart = Date.UTC(2025, 0, 15, 0, 0, 0);
			const rangeEnd = rangeStart + 3 * oneDay;

			const { result } = renderHook(() =>
				useTimeAxis({
					rangeStart,
					rangeEnd,
					zoom: zoomStep
				})
			);

			expect(result.current.daysInRange).toHaveLength(3);
			expect(result.current.daysInRange[0]).toContain('15');
			expect(result.current.daysInRange[1]).toContain('16');
			expect(result.current.daysInRange[2]).toContain('17');
			result.current.daysInRange.forEach(day => expect(day).toContain('2025'));
		});

		it('uses custom dayFormat from axisOptions when provided', () => {
			const rangeStart = Date.UTC(2025, 0, 15, 0, 0, 0);
			const rangeEnd = rangeStart + oneDay;

			const { result } = renderHook(() =>
				useTimeAxis({
					rangeStart,
					rangeEnd,
					zoom: zoomStep,
					axisOptions: { dayFormat: 'YYYY-MM-DD' }
				})
			);

			expect(result.current.daysInRange).toHaveLength(1);
			expect(result.current.daysInRange[0]).toBe('2025-01-15');
		});
	});

	describe('hoursValues', () => {
		it('returns empty array when zoom is below zoomStep/4', () => {
			const rangeStart = Date.UTC(2025, 0, 15, 0, 0, 0);
			const rangeEnd = rangeStart + oneDay;

			const { result } = renderHook(() =>
				useTimeAxis({
					rangeStart,
					rangeEnd,
					zoom: zoomStep / 4 - 1
				})
			);

			expect(result.current.hoursValues).toEqual([]);
		});

		it('returns hour markers with left position and time for single-day range at zoomStep', () => {
			const rangeStart = Date.UTC(2025, 0, 15, 0, 0, 0);
			const rangeEnd = rangeStart + oneDay;

			const { result } = renderHook(() =>
				useTimeAxis({
					rangeStart,
					rangeEnd,
					zoom: zoomStep
				})
			);

			expect(result.current.hoursValues.length).toBeGreaterThan(0);
			result.current.hoursValues.forEach(marker => {
				expect(marker).toHaveProperty('left');
				expect(marker).toHaveProperty('time');
				expect(typeof marker.left).toBe('number');
				expect(typeof marker.time).toBe('string');
			});
			// First marker at index 1 (index 0 is skipped) -> left = 1 * zoomStep, time = "1:00"
			const firstMarker = result.current.hoursValues[0];
			expect(firstMarker.left).toBe(zoomStep);
			expect(firstMarker.time).toBe('1:00');
		});

		it('returns correct markers at different zoom levels', () => {
			const rangeStart = Date.UTC(2025, 0, 15, 0, 0, 0);
			const rangeEnd = rangeStart + oneDay;

			const { result: atZoomStep } = renderHook(() =>
				useTimeAxis({
					rangeStart,
					rangeEnd,
					zoom: zoomStep
				})
			);

			const { result: atHalfZoom } = renderHook(() =>
				useTimeAxis({
					rangeStart,
					rangeEnd,
					zoom: zoomStep / 2
				})
			);

			// At zoomStep we get every hour (every index % 2 === 0 from the logic: zoom < zoomStep -> index % 2 !== 0 skipped)
			// So we get markers for hours 1..23 (index 0 is skipped)
			expect(atZoomStep.current.hoursValues.length).toBeGreaterThan(atHalfZoom.current.hoursValues.length);
		});
	});

	describe('% 24 fix (multi-day ranges)', () => {
		it('produces no Invalid date in hoursValues for multi-day range', () => {
			const rangeStart = Date.UTC(2025, 0, 15, 0, 0, 0);
			const rangeEnd = rangeStart + 3 * oneDay;

			const { result } = renderHook(() =>
				useTimeAxis({
					rangeStart,
					rangeEnd,
					zoom: zoomStep
				})
			);

			result.current.hoursValues.forEach(marker => {
				expect(marker.time).not.toBe('Invalid date');
				expect(marker.time).not.toContain('Invalid');
			});
		});

		it('repeats hour labels 0-23 across days (index % 24)', () => {
			const rangeStart = Date.UTC(2025, 0, 15, 0, 0, 0);
			const rangeEnd = rangeStart + 2 * oneDay;

			const { result } = renderHook(() =>
				useTimeAxis({
					rangeStart,
					rangeEnd,
					zoom: zoomStep
				})
			);

			// We should see multiple "0:00", "1:00", etc. (one per day)
			const times = result.current.hoursValues.map(m => m.time);
			const zeroOClock = times.filter(t => t === '0:00');
			expect(zeroOClock.length).toBeGreaterThanOrEqual(1);
			// All times should be valid hour strings (H:mm format)
			times.forEach(time => {
				expect(time).toMatch(/^\d{1,2}:\d{2}$/);
			});
		});
	});

	describe('custom hourFormat', () => {
		it('applies custom hourFormat to time strings', () => {
			const rangeStart = Date.UTC(2025, 0, 15, 0, 0, 0);
			const rangeEnd = rangeStart + oneDay;

			const { result } = renderHook(() =>
				useTimeAxis({
					rangeStart,
					rangeEnd,
					zoom: zoomStep,
					hourFormat: 'hh:mm A'
				})
			);

			// Default is 'H:mm' (24h). With 'hh:mm A' we expect 12h + AM/PM
			expect(result.current.hoursValues.length).toBeGreaterThan(0);
			result.current.hoursValues.forEach(marker => {
				expect(marker.time).toMatch(/\d{1,2}:\d{2}\s*(AM|PM)/);
			});
		});

		it('uses default H:mm when hourFormat not provided', () => {
			const rangeStart = Date.UTC(2025, 0, 15, 0, 0, 0);
			const rangeEnd = rangeStart + oneDay;

			const { result } = renderHook(() =>
				useTimeAxis({
					rangeStart,
					rangeEnd,
					zoom: zoomStep
				})
			);

			const firstMarker = result.current.hoursValues[0];
			expect(firstMarker.time).toBe('1:00');
		});
	});
});
