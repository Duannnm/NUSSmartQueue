import { auth, db } from './firebase';

// Mock Firebase modules
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(() => ({})),
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({})),
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(() => ({})),
}));

describe('Firebase Configuration', () => {
  it('should export auth instance', () => {
    expect(auth).toBeDefined();
  });

  it('should export db instance', () => {
    expect(db).toBeDefined();
  });

  it('should have proper firebase config structure', () => {
    // Test that the module exports the expected objects
    expect(typeof auth).toBe('object');
    expect(typeof db).toBe('object');
  });
});

