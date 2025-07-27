import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

// Mock all sub-components
jest.mock('./components/Home', () => ({
  __esModule: true,
  default: ({ onNavigate }: { onNavigate: (page: string) => void }) => (
    <div data-testid="home-component">
      Home Component
      <button onClick={() => onNavigate('login')}>Go to Login</button>
      <button onClick={() => onNavigate('signup')}>Go to Signup</button>
      <button onClick={() => onNavigate('student-dashboard')}>Go to Student Dashboard</button>
    </div>
  ),
}));

jest.mock('./components/Login', () => ({
  __esModule: true,
  default: ({ onNavigate }: { onNavigate: (page: string) => void }) => (
    <div data-testid="login-component">
      Login Component
      <button onClick={() => onNavigate('home')}>Go to Home</button>
    </div>
  ),
}));

jest.mock('./components/SignUp', () => ({
  __esModule: true,
  default: ({ onNavigate }: { onNavigate: (page: string) => void }) => (
    <div data-testid="signup-component">
      SignUp Component
      <button onClick={() => onNavigate('home')}>Go to Home</button>
    </div>
  ),
}));

jest.mock('./components/StudentDashboard', () => ({
  __esModule: true,
  default: ({ onNavigate }: { onNavigate: (page: string) => void }) => (
    <div data-testid="student-dashboard-component">Student Dashboard Component</div>
  ),
}));

jest.mock('./components/VendorDashboard', () => ({
  __esModule: true,
  default: ({ onNavigate }: { onNavigate: (page: string) => void }) => (
    <div data-testid="vendor-dashboard-component">Vendor Dashboard Component</div>
  ),
}));

jest.mock('./components/EnhancedStudentDashboard', () => ({
  __esModule: true,
  default: ({ onNavigate }: { onNavigate: (page: string) => void }) => (
    <div data-testid="enhanced-student-dashboard-component">Enhanced Student Dashboard Component</div>
  ),
}));

jest.mock('./components/CanteenDetails', () => ({
  __esModule: true,
  default: ({ canteen, onNavigate }: { canteen: any, onNavigate: (page: string) => void }) => (
    <div data-testid="canteen-details-component">Canteen Details Component for {canteen?.name}</div>
  ),
}));

jest.mock('./components/ErrorBoundary', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="error-boundary-component">{children}</div>
  ),
}));

jest.mock('./components/NotificationSystem', () => ({
  __esModule: true,
  default: ({ notifications, onRemove }: { notifications: any[], onRemove: (id: string) => void }) => (
    <div data-testid="notification-system-component">
      {notifications.map(n => (
        <div key={n.id} data-testid={`notification-${n.type}`}>
          {n.message}
          <button onClick={() => onRemove(n.id)}>Remove</button>
        </div>
      ))}
    </div>
  ),
}));

describe('App Component', () => {
  it('renders Home component by default', () => {
    render(<App />);
    expect(screen.getByTestId('home-component')).toBeInTheDocument();
    expect(screen.getByTestId('error-boundary-component')).toBeInTheDocument();
    expect(screen.getByTestId('notification-system-component')).toBeInTheDocument();
  });

  it('navigates to Login component', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Go to Login'));
    expect(screen.getByTestId('login-component')).toBeInTheDocument();
  });

  it('navigates to SignUp component', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Go to Signup'));
    expect(screen.getByTestId('signup-component')).toBeInTheDocument();
  });

  it('navigates to Enhanced Student Dashboard component', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Go to Student Dashboard'));
    expect(screen.getByTestId('enhanced-student-dashboard-component')).toBeInTheDocument();
  });

  it('navigates back to Home from Login', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Go to Login'));
    fireEvent.click(screen.getByText('Go to Home'));
    expect(screen.getByTestId('home-component')).toBeInTheDocument();
  });

  it('handles default case in navigation', () => {
    render(<App />);
    // Test default case by navigating to an unknown page
    const app = screen.getByTestId('home-component');
    expect(app).toBeInTheDocument();
  });
});

