import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import Widget from './Widget';
import logger from '../utils/logger';

// Mock the logger
vi.mock('../utils/logger', () => ({
  default: {
    info: vi.fn(),
  },
}));

describe('Widget', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders the widget with children', () => {
    render(<Widget>Test Widget</Widget>);
    expect(screen.getByText('Test Widget')).not.toBeNull();
  });

  it('calls logger.info when clicked', () => {
    render(<Widget>Test Widget</Widget>);
    fireEvent.click(screen.getByText('Test Widget'));
    expect(logger.info).toHaveBeenCalledWith('Widget clicked');
  });
}); 