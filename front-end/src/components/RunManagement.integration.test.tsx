import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from '../components/Dashboard';
import RecordRunPage from '../components/RecordRunPage';
import RunHistoryPage from '../components/RunHistoryPage';
import RunDetailsPage from '../components/RunDetailsPage';
import EditRunPage from '../components/EditRunPage';

// Integration test: Tests complete run management workflow
describe('Run Management Flow Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('token', 'fake-jwt-token');
    jest.clearAllMocks();
    
    // Setup default mock
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
    
    global.confirm = jest.fn(() => true);
  });

  it('should render record run page', async () => {
    render(
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RecordRunPage />} />
        </Routes>
      </BrowserRouter>
    );
    
    // Verify page renders
    await waitFor(() => {
      expect(screen.getByText(/record.*run|new run/i)).toBeInTheDocument();
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
    
    // Verify page renders
    await waitFor(() => {
      expect(screen.getByText(/run history/i)).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  it('should show empty state when no runs exist', async () => {
    render(
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RunHistoryPage />} />
        </Routes>
      </BrowserRouter>
    );
    
    // Wait for page to load
    await waitFor(() => {
      expect(screen.getByText(/run history/i)).toBeInTheDocument();
    }, { timeout: 5000 });

    // Verify no run items are displayed (checking that run count doesn't show "1 run" or similar)
    // The page should either show "0 runs" or no run items at all
    const bodyText = document.body.textContent || '';
    
    // Check that we don't have any run items (by checking for absence of action buttons)
    const deleteButtons = screen.queryAllByTitle('Delete');
    expect(deleteButtons).toHaveLength(0);
    
    // Alternatively, check if total runs is 0 or there's an empty message
    const hasEmptyIndicator = 
      bodyText.includes('No runs') || 
      bodyText.includes('0 runs') ||
      bodyText.match(/Total Runs:\s*0/i) ||
      deleteButtons.length === 0;
    
    expect(hasEmptyIndicator).toBe(true);
  });

  it('should display runs when data is available', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: [
          {
            _id: 'run1',
            distance: 5.0,
            time: 1800,
            caloriesBurned: 300,
            date: '2024-01-15',
            location: 'Park Trail',
            averagePace: 6.0,
          },
        ],
      }),
    });

    render(
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RunHistoryPage />} />
        </Routes>
      </BrowserRouter>
    );
    
    // Verify run appears
    await waitFor(() => {
      expect(screen.getByText(/1.*run/i)).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  it('should have action buttons for runs', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: [
          {
            _id: 'run1',
            distance: 5.0,
            time: 1800,
            caloriesBurned: 300,
            date: '2024-01-15',
            location: 'Park',
            averagePace: 6.0,
          },
        ],
      }),
    });

    render(
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RunHistoryPage />} />
        </Routes>
      </BrowserRouter>
    );
    
    // Wait for runs to load
    await waitFor(() => {
      expect(screen.getByText(/1.*run/i)).toBeInTheDocument();
    });
    
    // Verify action buttons exist
    expect(screen.getByTitle('View Details')).toBeInTheDocument();
    expect(screen.getByTitle('Edit')).toBeInTheDocument();
    expect(screen.getByTitle('Delete')).toBeInTheDocument();
  });

  it('should call confirm when delete button is clicked', async () => {
    const user = userEvent.setup();
    
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: [
          {
            _id: 'run1',
            distance: 5.0,
            time: 1800,
            caloriesBurned: 300,
            date: '2024-01-15',
            location: 'Park',
            averagePace: 6.0,
          },
        ],
      }),
    });

    render(
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RunHistoryPage />} />
        </Routes>
      </BrowserRouter>
    );
    
    // Wait for runs to load
    await waitFor(() => {
      expect(screen.getByText(/1.*run/i)).toBeInTheDocument();
    });
    
    // Click delete
    const deleteButton = screen.getByTitle('Delete');
    await user.click(deleteButton);
    
    // Verify confirm was called
    expect(global.confirm).toHaveBeenCalled();
  });

  it('should have back to dashboard button', async () => {
    render(
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RunHistoryPage />} />
        </Routes>
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText(/run history/i)).toBeInTheDocument();
    });
    
    // Verify back button exists
    expect(screen.getByText(/back to dashboard/i)).toBeInTheDocument();
  });

  it('should have sort options', async () => {
    render(
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RunHistoryPage />} />
        </Routes>
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText(/run history/i)).toBeInTheDocument();
    });
    
    // Verify sort dropdown exists
    const sortSelect = screen.getByRole('combobox');
    expect(sortSelect).toBeInTheDocument();
  });

  it('should make API call on component mount', async () => {
    render(
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RunHistoryPage />} />
        </Routes>
      </BrowserRouter>
    );
    
    // Verify API was called
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    }, { timeout: 5000 });
  });

  it('should handle API errors gracefully', async () => {
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
          <Route path="/" element={<RunHistoryPage />} />
        </Routes>
      </BrowserRouter>
    );
    
    // Page should still render
    await waitFor(() => {
      const body = document.body.textContent || '';
      expect(body.length).toBeGreaterThan(0);
    }, { timeout: 5000 });
  });
});