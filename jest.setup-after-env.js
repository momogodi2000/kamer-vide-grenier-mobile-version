// Jest setup after environment initialization
import '@testing-library/jest-native/extend-expect';

// Custom matchers for better testing
expect.extend({
  toBeWithinRange(received, floor, ceiling) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () => `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },
});

// Global test timeout
jest.setTimeout(10000);

// Mock global fetch if needed
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({}),
    ok: true,
    status: 200,
  })
);

// Mock FormData for file uploads
global.FormData = jest.fn(() => ({
  append: jest.fn(),
  delete: jest.fn(),
  get: jest.fn(),
  getAll: jest.fn(),
  has: jest.fn(),
  set: jest.fn(),
}));

// Mock Blob for file handling
global.Blob = jest.fn();

// Mock URL.createObjectURL
global.URL = {
  createObjectURL: jest.fn(() => 'mock-url'),
  revokeObjectURL: jest.fn(),
};

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
  // Clear any timers
  jest.clearAllTimers();
  // Reset any manual mocks
  jest.resetAllMocks();
});

// Global test utilities
global.testUtils = {
  mockUser: {
    id: '1',
    email: 'test@example.com',
    first_name: 'John',
    last_name: 'Doe',
    role: 'client',
    phone: '+237612345678',
    avatar: null,
    is_active: true,
    email_verified: true,
    phone_verified: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  mockFetchSuccess: (data) => {
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        json: () => Promise.resolve(data),
        ok: true,
        status: 200,
      })
    );
  },
  mockFetchError: (status = 400, message = 'Error') => {
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        json: () => Promise.resolve({ message }),
        ok: false,
        status,
      })
    );
  },
};