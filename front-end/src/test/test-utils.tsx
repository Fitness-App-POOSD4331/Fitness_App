import { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { vi } from 'vitest'

// Mock navigation
export const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// Wrapper component for tests that need routing
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <BrowserRouter>{children}</BrowserRouter>
}

// Custom render function
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }

// Helper to mock successful API response
export const mockApiSuccess = (data: any) => {
  return Promise.resolve({
    ok: true,
    json: async () => ({ success: true, data }),
  } as Response)
}

// Helper to mock failed API response
export const mockApiError = (message: string) => {
  return Promise.resolve({
    ok: false,
    json: async () => ({ success: false, message }),
  } as Response)
}

// Helper to setup localStorage mock
export const setupLocalStorageMock = (data: Record<string, string> = {}) => {
  const mockLocalStorage = {
    getItem: vi.fn((key: string) => data[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      data[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete data[key]
    }),
    clear: vi.fn(() => {
      Object.keys(data).forEach(key => delete data[key])
    }),
  }

  Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
    writable: true,
  })

  return mockLocalStorage
}

// Helper to wait for async operations
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0))
