import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import SignUp from './SignUp';

// Mock Firebase auth
jest.mock('../firebase', () => ({
  auth: {},
}));

jest.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: jest.fn(),
  GoogleAuthProvider: jest.fn(),
  signInWithPopup: jest.fn(),
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  ArrowLeft: () => <div data-testid="arrow-left-icon">ArrowLeft</div>,
  User: () => <div data-testid="user-icon">User</div>,
  Mail: () => <div data-testid="mail-icon">Mail</div>,
  Lock: () => <div data-testid="lock-icon">Lock</div>,
  Eye: () => <div data-testid="eye-icon">Eye</div>,
  EyeOff: () => <div data-testid="eye-off-icon">EyeOff</div>,
}));

describe('SignUp Component', () => {
  const mockOnNavigate = jest.fn();

  beforeEach(() => {
    mockOnNavigate.mockClear();
  });

  it('renders signup form elements', () => {
    render(<SignUp onNavigate={mockOnNavigate} />);
    
    expect(screen.getByText('Create Account')).toBeInTheDocument();
    expect(screen.getByText('Join NUSmartQueue today')).toBeInTheDocument();
    expect(screen.getByLabelText(/Full Name/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create Account/i })).toBeInTheDocument();
  });

  it('navigates back to home when back button is clicked', () => {
    render(<SignUp onNavigate={mockOnNavigate} />);
    
    fireEvent.click(screen.getByText('← Back to Home'));
    expect(mockOnNavigate).toHaveBeenCalledWith('home');
  });

  it('handles form input changes', () => {
    render(<SignUp onNavigate={mockOnNavigate} />);
    
    const nameInput = screen.getByLabelText(/Full Name/) as HTMLInputElement;
    const emailInput = screen.getByLabelText(/Email/) as HTMLInputElement;
    
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    
    expect(nameInput.value).toBe('John Doe');
    expect(emailInput.value).toBe('john@example.com');
  });

  it('navigates to login page', () => {
    render(<SignUp onNavigate={mockOnNavigate} />);
    
    const loginLink = screen.getByText('Already have an account?');
    fireEvent.click(loginLink);
    
    expect(mockOnNavigate).toHaveBeenCalledWith('login');
  });

  it('renders all required icons', () => {
    render(<SignUp onNavigate={mockOnNavigate} />);
    
    expect(screen.getByTestId('user-icon')).toBeInTheDocument();
    expect(screen.getByTestId('mail-icon')).toBeInTheDocument();
    expect(screen.getByTestId('lock-icon')).toBeInTheDocument();
  });

  it('renders user type selection', () => {
    render(<SignUp onNavigate={mockOnNavigate} />);
    
    expect(screen.getByText('I am a:')).toBeInTheDocument();
    expect(screen.getByLabelText('Student')).toBeInTheDocument();
    expect(screen.getByLabelText('Vendor')).toBeInTheDocument();
  });

  it('handles user type selection', () => {
    render(<SignUp onNavigate={mockOnNavigate} />);
    
    const studentRadio = screen.getByLabelText('Student') as HTMLInputElement;
    const vendorRadio = screen.getByLabelText('Vendor') as HTMLInputElement;
    
    fireEvent.click(studentRadio);
    expect(studentRadio.checked).toBe(true);
    expect(vendorRadio.checked).toBe(false);
    
    fireEvent.click(vendorRadio);
    expect(vendorRadio.checked).toBe(true);
    expect(studentRadio.checked).toBe(false);
  });
});

