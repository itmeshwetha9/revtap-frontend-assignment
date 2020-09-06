import React from 'react';
import { render } from '@testing-library/react';
import Dashboard from './dashboard';

test('renders dashboard', () => {
  const container = render(<Dashboard />);
  expect(container).toMatchSnapshot();
});
