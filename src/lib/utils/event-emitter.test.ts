import { EventEmitter } from './event-emitter';

describe('EventEmitter', () => {
	describe('on / emit', () => {
		it('calls handler with emitted data', () => {
			const emitter = new EventEmitter<number>();
			const fn = vi.fn();
			emitter.on(fn);
			emitter.emit(42);
			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(42);
		});

		it('calls multiple handlers with same data', () => {
			const emitter = new EventEmitter<string>();
			const fn1 = vi.fn();
			const fn2 = vi.fn();
			emitter.on(fn1);
			emitter.on(fn2);
			emitter.emit('hello');
			expect(fn1).toHaveBeenCalledWith('hello');
			expect(fn2).toHaveBeenCalledWith('hello');
		});
	});

	describe('off', () => {
		it('stops calling handler after removal', () => {
			const emitter = new EventEmitter<number>();
			const fn = vi.fn();
			emitter.on(fn);
			emitter.off(fn);
			emitter.emit(1);
			expect(fn).not.toHaveBeenCalled();
		});

		it('keeps other handlers when one is removed', () => {
			const emitter = new EventEmitter<number>();
			const fn1 = vi.fn();
			const fn2 = vi.fn();
			emitter.on(fn1);
			emitter.on(fn2);
			emitter.off(fn1);
			emitter.emit(1);
			expect(fn1).not.toHaveBeenCalled();
			expect(fn2).toHaveBeenCalledWith(1);
		});
	});

	describe('on with addToStart', () => {
		it('invokes addToStart handler before others', () => {
			const emitter = new EventEmitter<number>();
			const order: number[] = [];
			emitter.on(() => order.push(1));
			emitter.on(() => order.push(2));
			emitter.on(() => order.push(3), { addToStart: true });
			emitter.emit(0);
			expect(order).toEqual([3, 1, 2]);
		});

		it('invokes multiple addToStart handlers in reverse registration order', () => {
			const emitter = new EventEmitter<number>();
			const order: number[] = [];
			emitter.on(() => order.push(1));
			emitter.on(() => order.push(2), { addToStart: true });
			emitter.on(() => order.push(3), { addToStart: true });
			emitter.emit(0);
			expect(order).toEqual([3, 2, 1]);
		});
	});
});
