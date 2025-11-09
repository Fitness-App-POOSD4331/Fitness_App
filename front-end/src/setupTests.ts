// src/setupTests.ts
import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Polyfill TextEncoder/TextDecoder for Jest environment
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;

// Mock import.meta for Vite
(global as any).import = {
  meta: {
    env: {
      MODE: 'test',
      VITE_API_URL: 'http://localhost:3000',
      // Add any other env variables your app uses
    }
  }
};

// Mock localStorage
class LocalStorageMock {
  private store: Record<string, string> = {};

  clear() {
    this.store = {};
  }

  getItem(key: string) {
    return this.store[key] || null;
  }

  setItem(key: string, value: string) {
    this.store[key] = value.toString();
  }

  removeItem(key: string) {
    delete this.store[key];
  }

  get length() {
    return Object.keys(this.store).length;
  }

  key(index: number) {
    const keys = Object.keys(this.store);
    return keys[index] || null;
  }
}

// Define on global object
(global as any).localStorage = new LocalStorageMock();

// Mock fetch
(global as any).fetch = jest.fn();

// Mock window.confirm
(global as any).confirm = jest.fn(() => true);

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  (global as any).localStorage.clear();
});