/// <reference types="vitest/globals" />
import React from 'react';

import { render } from '@testing-library/react';

import { getData } from './mocks/data';
import Timeline from './timeline';

describe('Timeline', () => {
	it('should render successfully', () => {
		const { rows, range } = getData();
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
});
