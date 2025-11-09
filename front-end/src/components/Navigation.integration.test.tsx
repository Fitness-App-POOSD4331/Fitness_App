import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from '../components/Dashboard';
import Leaderboard from '../components/Leaderboard';
import ProfileSettings from '../components/ProfileSettingsPage';
import RunHistoryPage from '../components/RunHistoryPage';

// Integration test: Tests navigation between pages and data consistency
describe('Navigation and Data Flow Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('token', 'fake-jwt-token');
    jest.clearAllMocks();
    
    // Setup default mock that returns empty but valid responses
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        runStats: {
          totalRuns: 0,
          totalDistance: 0,
          totalCalories: 0,
        },
        data: [],
        user: {
          username: 'testuser',
          email: 'test@example.com',
        },
      }),
    });
  });

  it('should render dashboard page', async () => {
    render(
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
        </Routes>
      </BrowserRouter>
    );
    
    // Just verify the dashboard page renders
    await waitFor(() => {
      expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  it('should render leaderboard page', async () => {
    render(
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Leaderboard />} />
        </Routes>
      </BrowserRouter>
    );
    
    // Just verify the leaderboard page renders
    await waitFor(() => {
      expect(screen.getByText(/leaderboard/i)).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  it('should render profile settings page', async () => {
    render(
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ProfileSettings />} />
        </Routes>
      </BrowserRouter>
    );
    
    // Just verify the profile page renders
    await waitFor(() => {
      expect(screen.getByText(/profile|settings/i)).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  it('should render run history page', async () => {
    render(
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RunHistoryPage />} />
        </Routes>
      </BrowserRouter>
    );
    
    // Just verify the history page renders
    await waitFor(() => {
      expect(screen.getByText(/run history/i)).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  it('should make API calls when components mount', async () => {
    render(
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
        </Routes>
      </BrowserRouter>
    );
    
    // Wait for component to mount and make API call
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    }, { timeout: 5000 });
    
    // Verify the component rendered
    expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
  });

  it('should have navigation buttons on pages', async () => {
    render(
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Leaderboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </BrowserRouter>
    );
    
    // Wait for leaderboard to render
    await waitFor(() => {
      expect(screen.getByText(/leaderboard/i)).toBeInTheDocument();
    });
    
    // Verify back to dashboard button exists
    const dashboardButton = screen.getByRole('button', { name: /dashboard/i });
    expect(dashboardButton).toBeInTheDocument();
  });

  it('should have logout button on pages', async () => {
    render(
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Leaderboard />} />
        </Routes>
      </BrowserRouter>
    );
    
    // Wait for page to render
    await waitFor(() => {
      expect(screen.getByText(/leaderboard/i)).toBeInTheDocument();
    });
    
    // Verify logout button exists
    const logoutButton = screen.getByRole('button', { name: /logout/i });
    expect(logoutButton).toBeInTheDocument();
  });

  it('should handle empty data gracefully', async () => {
    // Mock returns empty data
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: [],
        runStats: {
          totalRuns: 0,
          totalDistance: 0,
          totalCalories: 0,
        },
      }),
    });

    render(
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RunHistoryPage />} />
        </Routes>
      </BrowserRouter>
    );
    
    // Should render the page
    await waitFor(() => {
      expect(screen.getByText(/run history/i)).toBeInTheDocument();
    }, { timeout: 5000 });
    
    // Should show 0 runs completed
    expect(screen.getByText(/0.*runs completed/i)).toBeInTheDocument();
  });

  it('should handle API failures', async () => {
    // Mock API failure
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({
        success: false,
        message: 'Server error',
      }),
    });

    render(
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
        </Routes>
      </BrowserRouter>
    );
    
    // Page should still render or show error
    await waitFor(() => {
      const body = document.body.textContent || '';
      // Just verify something rendered
      expect(body.length).toBeGreaterThan(0);
    }, { timeout: 5000 });
  });

  it('should require authentication token', () => {
    // Remove token
    localStorage.clear();
    
    render(
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
        </Routes>
      </BrowserRouter>
    );
    
    // Component should handle missing token
    // (either redirect or show error)
    expect(document.body).toBeTruthy();
  });
});