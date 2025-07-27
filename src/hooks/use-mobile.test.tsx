import { renderHook } from '@testing-library/react';
import { useIsMobile } from './use-mobile';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

describe('useIsMobile Hook', () => {
  beforeEach(() => {
    // Reset the mock before each test
    (window.matchMedia as jest.Mock).mockClear();
  });

  it('should return false for desktop screen', () => {
    (window.matchMedia as jest.Mock).mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  it('should return true for mobile screen', () => {
    (window.matchMedia as jest.Mock).mockImplementation(query => ({
      matches: true,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  it('should call matchMedia with correct query', () => {
    renderHook(() => useIsMobile());
    expect(window.matchMedia).toHaveBeenCalledWith('(max-width: 768px)');
  });

  it('should handle matchMedia not supported', () => {
    const originalMatchMedia = window.matchMedia;
    // @ts-ignore
    delete window.matchMedia;

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);

    window.matchMedia = originalMatchMedia;
  });
});

