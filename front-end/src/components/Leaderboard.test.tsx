import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Leaderboard from './Leaderboard';

// Helper function to render with router
function renderWithRouter(component: React.ReactElement) {
  return render(
    <MemoryRouter>
      {component}
    </MemoryRouter>
  );
}

describe('Leaderboard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('token', 'test-token');

    // Default mock for fetch (resolves instantly)
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          leaderboard: [
            { username: 'Alice', points: 120 },
            { username: 'Bob', points: 100 },
          ],
        },
      }),
    }) as jest.Mock;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should render leaderboard page', async () => {
    renderWithRouter(<Leaderboard />);

    // Wait for leaderboard to load
    await waitFor(() => {
      expect(screen.getByText(/leaderboard/i)).toBeInTheDocument();
    });
  });

  it('should show loading state initially', () => {
    // Mock fetch that never resolves to simulate loading
    global.fetch = jest.fn().mockImplementation(() => new Promise(() => {})) as jest.Mock;

    renderWithRouter(<Leaderboard />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('should have a back to dashboard button or navigation', async () => {
    renderWithRouter(<Leaderboard />);

    // Wait for loading to disappear (React updates handled automatically)
    await waitFor(() =>
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
    );

    // Check for navigation element
    const navigation =
      screen.queryByRole('button', { name: /dashboard/i }) ||
      screen.queryByRole('link', { name: /dashboard/i });

    expect(navigation).toBeTruthy();
  });
});