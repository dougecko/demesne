import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Widget from './Widget';

describe('Widget', () => {
  it('renders the widget with children', () => {
    render(<Widget>Test Widget</Widget>);
    expect(screen.getByText('Test Widget')).not.toBeNull();
  });
}); 