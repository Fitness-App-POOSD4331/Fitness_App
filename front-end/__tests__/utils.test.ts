// __tests__/utils.test.ts
import { formatTime, formatDate } from '../utils';

describe('Utility Functions', () => {
  test('formatTime converts seconds to HH:MM:SS', () => {
    expect(formatTime(3661)).toBe('1:01:01');
    expect(formatTime(3600)).toBe('1:00:00');
    expect(formatTime(61)).toBe('0:01:01');
  });

  test('formatDate formats date correctly', () => {
    const date = new Date('2024-01-15T08:00:00Z');
    expect(formatDate(date.toISOString())).toContain('Jan');
  });
});

// package.json test scripts
/*
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  },
  "devDependencies": {
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.1.4",
    "@testing-library/user-event": "^14.5.1",
    "jest": "^29.7.0",
    "jest-environment-jsdom": "^29.7.0",
    "@types/jest": "^29.5.8"
  }
}
*/

// jest.config.js
/*
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.tsx',
  ],
};
*/

// jest.setup.js
/*
import '@testing-library/jest-dom';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock as any;

// Mock window.location
delete (window as any).location;
window.location = { href: '' } as any;
*/