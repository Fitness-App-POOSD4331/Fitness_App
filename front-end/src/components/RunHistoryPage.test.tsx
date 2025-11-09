import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import RunHistoryPage from './RunHistoryPage';

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Helper function to render with router
function renderWithRouter(component: React.ReactElement) {
  return render(
    <MemoryRouter>
      {component}
    </MemoryRouter>
  );
}

describe('RunHistoryPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('authToken', 'test-token');
    mockNavigate.mockClear();
    
    // Mock window.confirm
    global.confirm = jest.fn(() => true);
    
    // Mock fetch to return run data
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: [
          {
            _id: 'run123',
            date: '2024-01-15',
            distance: 5.2,
            time: 1680,
            caloriesBurned: 312,
            averagePace: 5.4,
            startTime: '2024-01-15T10:00:00Z',
            finishTime: '2024-01-15T10:28:00Z',
            location: 'Central Park'
          },
          {
            _id: 'run456',
            date: '2024-01-12',
            distance: 8.5,
            time: 2700,
            caloriesBurned: 510,
            averagePace: 5.3,
            startTime: '2024-01-12T10:00:00Z',
            finishTime: '2024-01-12T10:45:00Z',
            location: 'Riverside Trail'
          },
          {
            _id: 'run789',
            date: '2024-01-10',
            distance: 4.6,
            time: 1500,
            caloriesBurned: 280,
            averagePace: 5.4,
            startTime: '2024-01-10T10:00:00Z',
            finishTime: '2024-01-10T10:25:00Z',
            location: 'City Loop'
          }
        ]
      })
    }) as jest.Mock;
  });

  afterEach(() => {
    jest.resetAllMocks();
    localStorage.clear();
  });

  it('should render run history page', async () => {
    renderWithRouter(<RunHistoryPage />);
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText(/loading runs/i)).not.toBeInTheDocument();
    });
    
    expect(screen.getByText(/run history/i)).toBeInTheDocument();
  });

  it('should display correct number of runs', async () => {
    renderWithRouter(<RunHistoryPage />);
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText(/loading runs/i)).not.toBeInTheDocument();
    });
    
    expect(screen.getByText(/3 runs completed/i)).toBeInTheDocument();
  });

  it('should have sort functionality', async () => {
    renderWithRouter(<RunHistoryPage />);
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText(/loading runs/i)).not.toBeInTheDocument();
    });
    
    const sortSelect = screen.getByRole('combobox');
    expect(sortSelect).toBeInTheDocument();
    expect(screen.getByText(/sort by date/i)).toBeInTheDocument();
    expect(screen.getByText(/sort by distance/i)).toBeInTheDocument();
    expect(screen.getByText(/sort by calories/i)).toBeInTheDocument();
    expect(screen.getByText(/sort by pace/i)).toBeInTheDocument();
  });

  it('should change sort order when selecting different option', async () => {
    const user = userEvent.setup();
    renderWithRouter(<RunHistoryPage />);
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText(/loading runs/i)).not.toBeInTheDocument();
    });
    
    const sortSelect = screen.getByRole('combobox');
    await user.selectOptions(sortSelect, 'distance');
    
    expect(sortSelect).toHaveValue('distance');
  });

  it('should display action buttons for each run', async () => {
    renderWithRouter(<RunHistoryPage />);
    
    // Wait for runs to be displayed
    await waitFor(() => {
      expect(screen.getByText(/3 runs completed/i)).toBeInTheDocument();
    });
    
    // Each run should have view, edit, and delete buttons
    const viewButtons = screen.getAllByTitle('View Details');
    const editButtons = screen.getAllByTitle('Edit');
    const deleteButtons = screen.getAllByTitle('Delete');
    
    expect(viewButtons).toHaveLength(3);
    expect(editButtons).toHaveLength(3);
    expect(deleteButtons).toHaveLength(3);
  });

  it('should call confirm and attempt delete when delete button is clicked', async () => {
    const user = userEvent.setup();
    renderWithRouter(<RunHistoryPage />);
    
    // Wait for runs to load
    await waitFor(() => {
      expect(screen.getByText(/3 runs completed/i)).toBeInTheDocument();
    });
    
    // Click first delete button
    const deleteButtons = screen.getAllByTitle('Delete');
    await user.click(deleteButtons[0]);
    
    // Verify confirm was called
    expect(global.confirm).toHaveBeenCalledWith('Are you sure you want to delete this run?');
  });

  it('should navigate to edit page when edit button is clicked', async () => {
    const user = userEvent.setup();
    renderWithRouter(<RunHistoryPage />);
    
    // Wait for runs to load
    await waitFor(() => {
      expect(screen.getByText(/3 runs completed/i)).toBeInTheDocument();
    });
    
    const editButtons = screen.getAllByTitle('Edit');
    await user.click(editButtons[0]);
    
    // Component actually navigates to /runs/:id/edit
    expect(mockNavigate).toHaveBeenCalledWith('/runs/run123/edit');
  });

  it('should navigate to details page when view button is clicked', async () => {
    const user = userEvent.setup();
    renderWithRouter(<RunHistoryPage />);
    
    // Wait for runs to load
    await waitFor(() => {
      expect(screen.getByText(/3 runs completed/i)).toBeInTheDocument();
    });
    
    const viewButtons = screen.getAllByTitle('View Details');
    await user.click(viewButtons[0]);
    
    // Component actually navigates to /runs/:id
    expect(mockNavigate).toHaveBeenCalledWith('/runs/run123');
  });

  it('should have back to dashboard button', async () => {
    renderWithRouter(<RunHistoryPage />);
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText(/loading runs/i)).not.toBeInTheDocument();
    });
    
    const backButton = screen.getByText(/back to dashboard/i);
    expect(backButton).toBeInTheDocument();
  });

  it('should navigate to dashboard when back button is clicked', async () => {
    const user = userEvent.setup();
    renderWithRouter(<RunHistoryPage />);
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText(/loading runs/i)).not.toBeInTheDocument();
    });
    
    const backButton = screen.getByText(/back to dashboard/i);
    await user.click(backButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  it('should show empty state when no runs available', async () => {
    // Mock empty response
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: []
      })
    }) as jest.Mock;

    renderWithRouter(<RunHistoryPage />);
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText(/loading runs/i)).not.toBeInTheDocument();
    });
    
    expect(screen.getByText(/no runs recorded yet/i)).toBeInTheDocument();
    expect(screen.getByText(/0 runs completed/i)).toBeInTheDocument();
  });
});