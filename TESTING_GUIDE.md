# Testing Guide - NUS Smart Queue

## Quick Start

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- --testPathPatterns="App.test.tsx"

# Run tests in watch mode
npm test -- --watch

# Run tests for specific directory
npm test -- --testPathPatterns="services"
```

### Test Structure

```
src/
├── __tests__/              # Global test utilities
├── components/
│   ├── Component.tsx
│   └── Component.test.tsx   # Component tests
├── services/
│   ├── service.ts
│   └── service.test.ts      # Service tests
└── hooks/
    ├── useHook.ts
    └── useHook.test.ts      # Hook tests
```

## Test Configuration

### Jest Configuration (`jest.config.cjs`)

```javascript
module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        jsx: 'react-jsx',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        skipLibCheck: true,
      },
      diagnostics: false,
    }],
  },
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/main.tsx',
    '!src/vite-env.d.ts',
    '!src/components/ui/**',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

### Test Setup (`jest.setup.js`)

```javascript
import '@testing-library/jest-dom';

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};
```

## Testing Patterns

### 1. Component Testing

```typescript
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import MyComponent from './MyComponent';

// Mock external dependencies
jest.mock('lucide-react', () => ({
  Icon: () => <div data-testid="icon">Icon</div>,
}));

describe('MyComponent', () => {
  const mockProps = {
    onAction: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    render(<MyComponent {...mockProps} />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('handles user interactions', () => {
    render(<MyComponent {...mockProps} />);
    fireEvent.click(screen.getByRole('button'));
    expect(mockProps.onAction).toHaveBeenCalled();
  });
});
```

### 2. Service Testing

```typescript
import { MyService } from './MyService';

describe('MyService', () => {
  let service: MyService;

  beforeEach(() => {
    service = new MyService();
  });

  it('processes data correctly', () => {
    const input = { data: 'test' };
    const result = service.processData(input);
    expect(result).toEqual(expectedOutput);
  });

  it('handles errors gracefully', () => {
    expect(() => service.processData(null)).toThrow('Invalid input');
  });
});
```

### 3. Hook Testing

```typescript
import { renderHook, act } from '@testing-library/react';
import useMyHook from './useMyHook';

describe('useMyHook', () => {
  it('initializes with default state', () => {
    const { result } = renderHook(() => useMyHook());
    expect(result.current.value).toBe(defaultValue);
  });

  it('updates state correctly', () => {
    const { result } = renderHook(() => useMyHook());
    
    act(() => {
      result.current.updateValue('new value');
    });
    
    expect(result.current.value).toBe('new value');
  });
});
```

## Mocking Strategies

### 1. External Libraries

```typescript
// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  Icon: ({ className }: { className?: string }) => (
    <div data-testid="icon" className={className}>Icon</div>
  ),
  ArrowRight: () => <div data-testid="arrow-right">→</div>,
}));

// Mock Firebase
jest.mock('../firebase', () => ({
  auth: {},
  db: {},
}));
```

### 2. Browser APIs

```typescript
// Mock Geolocation
const mockGeolocation = {
  getCurrentPosition: jest.fn(),
  watchPosition: jest.fn(),
  clearWatch: jest.fn(),
};

Object.defineProperty(global.navigator, 'geolocation', {
  value: mockGeolocation,
  writable: true,
});
```

### 3. CSS and Assets

```typescript
// In jest.config.cjs
moduleNameMapper: {
  '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/__mocks__/fileMock.js',
}
```

## Best Practices

### 1. Test Organization

- **Group related tests** using `describe` blocks
- **Use descriptive test names** that explain what is being tested
- **Follow AAA pattern**: Arrange, Act, Assert

```typescript
describe('UserService', () => {
  describe('when creating a user', () => {
    it('should return user with generated ID', () => {
      // Arrange
      const userData = { name: 'John', email: 'john@example.com' };
      
      // Act
      const user = userService.createUser(userData);
      
      // Assert
      expect(user.id).toBeDefined();
      expect(user.name).toBe('John');
    });
  });
});
```

### 2. Mock Management

- **Clear mocks** between tests using `beforeEach`
- **Use specific mocks** for each test when needed
- **Mock at the right level** (module vs function vs method)

```typescript
beforeEach(() => {
  jest.clearAllMocks();
});

// Specific mock for one test
it('handles API error', () => {
  apiService.getData.mockRejectedValue(new Error('API Error'));
  // ... test implementation
});
```

### 3. Async Testing

```typescript
// Testing async functions
it('fetches data successfully', async () => {
  const data = await dataService.fetchData();
  expect(data).toBeDefined();
});

// Testing with waitFor
it('shows loading state', async () => {
  render(<AsyncComponent />);
  expect(screen.getByText('Loading...')).toBeInTheDocument();
  
  await waitFor(() => {
    expect(screen.getByText('Data loaded')).toBeInTheDocument();
  });
});
```

### 4. Error Testing

```typescript
it('handles network errors', async () => {
  // Mock network failure
  fetch.mockRejectedValue(new Error('Network error'));
  
  const result = await apiService.getData();
  expect(result.error).toBe('Network error');
});
```

## Coverage Guidelines

### Target Metrics
- **Statements**: 90%
- **Branches**: 90%
- **Functions**: 90%
- **Lines**: 90%

### Coverage Exclusions
```javascript
collectCoverageFrom: [
  'src/**/*.{ts,tsx}',
  '!src/**/*.d.ts',           // Type definitions
  '!src/main.tsx',            // Entry point
  '!src/vite-env.d.ts',       // Vite types
  '!src/components/ui/**',    // Third-party UI components
  '!src/**/*.stories.tsx',    // Storybook files
]
```

### Improving Coverage

1. **Identify uncovered lines** using coverage reports
2. **Add tests for edge cases** and error conditions
3. **Test all code paths** including conditionals and loops
4. **Mock external dependencies** to focus on unit logic

## Troubleshooting

### Common Issues

#### 1. Module Resolution Errors
```bash
# Error: Cannot find module
# Solution: Check moduleNameMapper in jest.config.cjs
```

#### 2. CSS Import Errors
```bash
# Error: Unexpected token @import
# Solution: Add CSS mock to moduleNameMapper
```

#### 3. React Component Errors
```bash
# Error: Element type is invalid
# Solution: Check component imports and mocks
```

#### 4. Async Test Timeouts
```bash
# Error: Test timeout
# Solution: Increase timeout or use proper async patterns
```

### Debug Tips

1. **Use `screen.debug()`** to see rendered output
2. **Add `console.log`** in tests for debugging
3. **Run single test** with `--testNamePattern`
4. **Use `--verbose`** flag for detailed output

```bash
# Debug specific test
npm test -- --testNamePattern="should render correctly" --verbose

# Run with debug output
DEBUG=* npm test
```

## Continuous Integration

### GitHub Actions Example

```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v1
```

### Coverage Reporting

```bash
# Generate coverage report
npm run test:coverage

# View HTML report
open coverage/lcov-report/index.html
```

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Mock Service Worker](https://mswjs.io/) for API mocking

