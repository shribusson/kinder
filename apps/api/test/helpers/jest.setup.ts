/**
 * Jest Setup File for Kinder CRM API Tests
 *
 * This file runs before each test file and sets up the testing environment.
 */

// Increase timeout for async operations
jest.setTimeout(30000);

// Mock console methods to reduce noise in test output (optional)
// Uncomment if you want to suppress console output during tests
// global.console = {
//   ...console,
//   log: jest.fn(),
//   debug: jest.fn(),
//   info: jest.fn(),
//   warn: jest.fn(),
//   error: jest.fn(),
// };

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});

// Global teardown
afterAll(async () => {
  // Add any global cleanup here
});

// Export empty to make this a module
export {};
