import { configure } from '@testing-library/react';

configure({ testIdAttribute: 'data-test-id' });

// ResizeObserver is not implemented in jsdom
class ResizeObserverMock {
	observe = () => undefined;
	unobserve = () => undefined;
	disconnect = () => undefined;
}
global.ResizeObserver = ResizeObserverMock as typeof ResizeObserver;
