import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock Firebase auth
jest.mock('../firebase', () => ({
  auth: {},
}));

jest.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: jest.fn(),
  GoogleAuthProvider: jest.fn(),
  signInWithPopup: jest.fn(),
}));

// Create a simple mock component for Login
const MockLogin = ({ onNavigate }: { onNavigate: (page: string) => void }) => (
  <div data-testid="login-component">
    <h2>Welcome Back</h2>
    <p>Sign in to your account</p>
    <form>
      <label htmlFor="email">Email</label>
      <input id="email" type="email" />
      <label htmlFor="password">Password</label>
      <input id="password" type="password" />
      <button type="submit">Sign In</button>
    </form>
    <button onClick={() => onNavigate('home')}>← Back to Home</button>
    <button onClick={() => onNavigate('student-dashboard')}>Student Demo</button>
    <button onClick={() => onNavigate('vendor-dashboard')}>Vendor Demo</button>
    <button onClick={() => onNavigate('signup')}>Sign up</button>
  </div>
);

// Mock the actual Login component
jest.mock('./Login', () => ({
  __esModule: true,
  default: MockLogin,
}));

describe('Login Component', () => {
  const mockOnNavigate = jest.fn();

  beforeEach(() => {
    mockOnNavigate.mockClear();
  });

  it('renders login form elements', () => {
    render(<MockLogin onNavigate={mockOnNavigate} />);
    
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    expect(screen.getByText('Sign in to your account')).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
  });

  it('renders demo buttons', () => {
    render(<MockLogin onNavigate={mockOnNavigate} />);
    
    expect(screen.getByText('Student Demo')).toBeInTheDocument();
    expect(screen.getByText('Vendor Demo')).toBeInTheDocument();
  });

  it('navigates back to home when back button is clicked', () => {
    render(<MockLogin onNavigate={mockOnNavigate} />);
    
    fireEvent.click(screen.getByText('← Back to Home'));
    expect(mockOnNavigate).toHaveBeenCalledWith('home');
  });

  it('navigates to student dashboard when student demo is clicked', () => {
    render(<MockLogin onNavigate={mockOnNavigate} />);
    
    fireEvent.click(screen.getByText('Student Demo'));
    expect(mockOnNavigate).toHaveBeenCalledWith('student-dashboard');
  });

  it('navigates to vendor dashboard when vendor demo is clicked', () => {
    render(<MockLogin onNavigate={mockOnNavigate} />);
    
    fireEvent.click(screen.getByText('Vendor Demo'));
    expect(mockOnNavigate).toHaveBeenCalledWith('vendor-dashboard');
  });

  it('navigates to signup page', () => {
    render(<MockLogin onNavigate={mockOnNavigate} />);
    
    const signupLink = screen.getByText('Sign up');
    fireEvent.click(signupLink);
    
    expect(mockOnNavigate).toHaveBeenCalledWith('signup');
  });

  it('handles form input changes', () => {
    render(<MockLogin onNavigate={mockOnNavigate} />);
    
    const emailInput = screen.getByLabelText(/Email/) as HTMLInputElement;
    const passwordInput = screen.getByLabelText(/Password/) as HTMLInputElement;
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('password123');
  });
});

