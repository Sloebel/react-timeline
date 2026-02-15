/// <reference types="vitest/globals" />
import React from 'react';

import { render } from '@testing-library/react';

import { getData } from './mocks/data';
import ReactTimeline from './react-timeline';

describe('ReactTimeline', () => {
	it('should render successfully', () => {
		const { rows, range } = getData();
		const { baseElement } = render(
			<ReactTimeline
				rows={rows}
				options={{
					minAxisTime: range.start,
					maxAxisTime: range.end
				}}
			/>
		);
		expect(baseElement).toBeTruthy();
	});
});
