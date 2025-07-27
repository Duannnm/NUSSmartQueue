import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoadingSpinner from './LoadingSpinner';

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Loader2: ({ className }: { className?: string }) => (
    <div data-testid="loader-icon" className={className}>Loader2</div>
  ),
}));

describe('LoadingSpinner Component', () => {
  it('renders with default props', () => {
    render(<LoadingSpinner />);
    
    expect(screen.getByTestId('loader-icon')).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders with custom message', () => {
    render(<LoadingSpinner message="Please wait..." />);
    
    expect(screen.getByTestId('loader-icon')).toBeInTheDocument();
    expect(screen.getByText('Please wait...')).toBeInTheDocument();
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  it('renders with custom size', () => {
    render(<LoadingSpinner size="large" />);
    
    const loader = screen.getByTestId('loader-icon');
    expect(loader).toHaveClass('h-8', 'w-8');
  });

  it('renders with small size', () => {
    render(<LoadingSpinner size="small" />);
    
    const loader = screen.getByTestId('loader-icon');
    expect(loader).toHaveClass('h-4', 'w-4');
  });

  it('renders with medium size (default)', () => {
    render(<LoadingSpinner />);
    
    const loader = screen.getByTestId('loader-icon');
    expect(loader).toHaveClass('h-6', 'w-6');
  });

  it('has proper styling classes', () => {
    render(<LoadingSpinner />);
    
    const container = screen.getByTestId('loader-icon').closest('div');
    expect(container).toHaveClass('flex', 'flex-col', 'items-center', 'justify-center');
  });

  it('renders without message when message is empty', () => {
    render(<LoadingSpinner message="" />);
    
    expect(screen.getByTestId('loader-icon')).toBeInTheDocument();
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });
});

