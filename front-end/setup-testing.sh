#!/bin/bash

# Sky Run Testing Setup Script
# This script automates the testing setup process

set -e  # Exit on any error

echo "================================================"
echo "  Sky Run Testing Setup Script"
echo "================================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: package.json not found!${NC}"
    echo "Please run this script from your front-end directory:"
    echo "  cd front-end"
    echo "  bash setup-testing.sh"
    exit 1
fi

echo -e "${GREEN}✓${NC} Found package.json"
echo ""

# Step 1: Install dependencies
echo "Step 1: Installing testing dependencies..."
echo "This may take 2-3 minutes..."
npm install --save-dev \
    vitest \
    @vitest/ui \
    @testing-library/react \
    @testing-library/jest-dom \
    @testing-library/user-event \
    jsdom \
    @types/testing-library__jest-dom

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} Dependencies installed successfully"
else
    echo -e "${RED}✗${NC} Failed to install dependencies"
    exit 1
fi
echo ""

# Step 2: Update package.json scripts
echo "Step 2: Adding test scripts to package.json..."

# Check if test script already exists
if grep -q '"test":' package.json; then
    echo -e "${YELLOW}⚠${NC} Test scripts already exist in package.json"
    echo "  Please manually add these if needed:"
    echo '    "test": "vitest",'
    echo '    "test:run": "vitest run",'
    echo '    "test:ui": "vitest --ui",'
    echo '    "test:coverage": "vitest run --coverage"'
else
    # Add test scripts using sed
    sed -i.bak '/"scripts": {/a\
    "test": "vitest",\
    "test:run": "vitest run",\
    "test:ui": "vitest --ui",\
    "test:coverage": "vitest run --coverage",' package.json
    echo -e "${GREEN}✓${NC} Test scripts added to package.json"
fi
echo ""

# Step 3: Create test directory
echo "Step 3: Creating test directory structure..."
mkdir -p src/test

if [ -d "src/test" ]; then
    echo -e "${GREEN}✓${NC} Created src/test directory"
else
    echo -e "${RED}✗${NC} Failed to create src/test directory"
    exit 1
fi
echo ""

# Step 4: Create setup.ts
echo "Step 4: Creating setup.ts..."
cat > src/test/setup.ts << 'EOF'
import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
global.localStorage = localStorageMock as any

// Mock fetch
global.fetch = vi.fn()

// Extend expect matchers
expect.extend({})
EOF

echo -e "${GREEN}✓${NC} Created src/test/setup.ts"
echo ""

# Step 5: Create test-utils.tsx
echo "Step 5: Creating test-utils.tsx..."
cat > src/test/test-utils.tsx << 'EOF'
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
EOF

echo -e "${GREEN}✓${NC} Created src/test/test-utils.tsx"
echo ""

# Step 6: Check if mockData.ts already exists
echo "Step 6: Checking mockData.ts..."
if [ -f "src/test/mockData.ts" ]; then
    echo -e "${GREEN}✓${NC} mockData.ts already exists"
else
    echo -e "${YELLOW}⚠${NC} mockData.ts not found"
    echo "  You'll need to create this file with your mock data"
fi
echo ""

# Step 7: Update vite.config.ts
echo "Step 7: Updating vite.config.ts..."
if grep -q "test:" vite.config.ts; then
    echo -e "${YELLOW}⚠${NC} vite.config.ts already has test configuration"
    echo "  Please verify it matches the setup guide"
else
    echo -e "${YELLOW}⚠${NC} Please manually update vite.config.ts"
    echo "  Add the test configuration from TESTING_SETUP_GUIDE.md"
fi
echo ""

# Step 8: Create a simple example test
echo "Step 8: Creating example test..."
mkdir -p src/components
cat > src/components/Example.test.tsx << 'EOF'
import { describe, it, expect } from 'vitest'
import { render } from '../test/test-utils'

describe('Example Test', () => {
  it('should pass', () => {
    expect(true).toBe(true)
  })

  it('should render a div', () => {
    const { container } = render(<div>Hello Testing!</div>)
    expect(container.firstChild).toBeInTheDocument()
  })
})
EOF

echo -e "${GREEN}✓${NC} Created example test file"
echo ""

# Final summary
echo "================================================"
echo -e "${GREEN}  Setup Complete! 🎉${NC}"
echo "================================================"
echo ""
echo "Next steps:"
echo "1. Update vite.config.ts with test configuration (see TESTING_SETUP_GUIDE.md)"
echo "2. Create src/test/mockData.ts with your mock data"
echo "3. Run tests:"
echo "   npm test          # Watch mode"
echo "   npm run test:run  # Run once"
echo "   npm run test:ui   # Visual UI"
echo ""
echo "Check TESTING_SETUP_GUIDE.md for detailed instructions!"
echo ""
