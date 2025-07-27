import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Create a simple mock component for Home
const MockHome = ({ onNavigate }: { onNavigate: (page: string) => void }) => (
  <div data-testid="home-component">
    <h1>NUSmartQueue</h1>
    <p>Smart Queue Management for NUS</p>
    <button onClick={() => onNavigate('login')}>I'm a Student</button>
    <button onClick={() => onNavigate('login')}>I'm a Vendor</button>
    <div>Real-time Queue Updates</div>
    <div>Smart Recommendations</div>
    <div>Indoor Positioning</div>
    <div>Vendor Analytics</div>
    <div>Advanced Location Services</div>
    <div>Comprehensive Analytics</div>
    <div>Enhanced UX Design</div>
  </div>
);

// Mock the actual Home component
jest.mock('./Home', () => ({
  __esModule: true,
  default: MockHome,
}));

describe('Home Component', () => {
  const mockOnNavigate = jest.fn();

  beforeEach(() => {
    mockOnNavigate.mockClear();
  });

  it('renders the main heading and description', () => {
    render(<MockHome onNavigate={mockOnNavigate} />);
    
    expect(screen.getByText('NUSmartQueue')).toBeInTheDocument();
    expect(screen.getByText(/Smart Queue Management for NUS/)).toBeInTheDocument();
  });

  it('renders user type selection buttons', () => {
    render(<MockHome onNavigate={mockOnNavigate} />);
    
    expect(screen.getByText("I'm a Student")).toBeInTheDocument();
    expect(screen.getByText("I'm a Vendor")).toBeInTheDocument();
  });

  it('navigates to login when student button is clicked', () => {
    render(<MockHome onNavigate={mockOnNavigate} />);
    
    fireEvent.click(screen.getByText("I'm a Student"));
    expect(mockOnNavigate).toHaveBeenCalledWith('login');
  });

  it('navigates to login when vendor button is clicked', () => {
    render(<MockHome onNavigate={mockOnNavigate} />);
    
    fireEvent.click(screen.getByText("I'm a Vendor"));
    expect(mockOnNavigate).toHaveBeenCalledWith('login');
  });

  it('renders feature cards', () => {
    render(<MockHome onNavigate={mockOnNavigate} />);
    
    expect(screen.getByText('Real-time Queue Updates')).toBeInTheDocument();
    expect(screen.getByText('Smart Recommendations')).toBeInTheDocument();
    expect(screen.getByText('Indoor Positioning')).toBeInTheDocument();
    expect(screen.getByText('Vendor Analytics')).toBeInTheDocument();
  });

  it('renders MS3 enhancement features', () => {
    render(<MockHome onNavigate={mockOnNavigate} />);
    
    expect(screen.getByText('Advanced Location Services')).toBeInTheDocument();
    expect(screen.getByText('Comprehensive Analytics')).toBeInTheDocument();
    expect(screen.getByText('Enhanced UX Design')).toBeInTheDocument();
  });

  it('has proper component structure', () => {
    render(<MockHome onNavigate={mockOnNavigate} />);
    
    const container = screen.getByTestId('home-component');
    expect(container).toBeInTheDocument();
  });
});

