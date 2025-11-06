// __tests__/RunHistoryPage.test.tsx
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import RunHistoryPage from '../RunHistoryPage';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('RunHistoryPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem('token', 'test-token');
    global.fetch = jest.fn();
  });

  test('renders loading state', () => {
    (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));
    render(<BrowserRouter><RunHistoryPage /></BrowserRouter>);
    expect(screen.getByText('Loading runs...')).toBeInTheDocument();
  });

  test('displays runs when loaded', async () => {
    const mockRuns = [
      {
        _id: '1',
        distance: 5.2,
        time: 2400,
        averagePace: 7.69,
        caloriesBurned: 450,
        startTime: '2024-01-15T08:00:00Z',
        finishTime: '2024-01-15T08:40:00Z',
        createdAt: '2024-01-15T08:40:00Z'
      }
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({ success: true, data: mockRuns }),
    });

    render(<BrowserRouter><RunHistoryPage /></BrowserRouter>);

    await waitFor(() => {
      expect(screen.getByText('1 runs completed')).toBeInTheDocument();
      expect(screen.getByText('5.20 miles')).toBeInTheDocument();
    });
  });

  test('allows sorting by different criteria', async () => {
    const mockRuns = [
      {
        _id: '1',
        distance: 3.0,
        time: 1800,
        averagePace: 10.0,
        caloriesBurned: 300,
        startTime: '2024-01-15T08:00:00Z',
        finishTime: '2024-01-15T08:30:00Z',
        createdAt: '2024-01-15T08:30:00Z'
      },
      {
        _id: '2',
        distance: 5.0,
        time: 2400,
        averagePace: 8.0,
        caloriesBurned: 500,
        startTime: '2024-01-16T08:00:00Z',
        finishTime: '2024-01-16T08:40:00Z',
        createdAt: '2024-01-16T08:40:00Z'
      }
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({ success: true, data: mockRuns }),
    });

    render(<BrowserRouter><RunHistoryPage /></BrowserRouter>);

    await waitFor(() => {
      expect(screen.getByText('2 runs completed')).toBeInTheDocument();
    });

    const sortSelect = screen.getByRole('combobox');
    fireEvent.change(sortSelect, { target: { value: 'distance' } });

    // After sorting by distance, 5.0 mile run should appear first
    const distanceElements = screen.getAllByText(/miles/);
    expect(distanceElements[0]).toHaveTextContent('5.00');
  });

  test('confirms before deleting a run', async () => {
    window.confirm = jest.fn(() => false);
    
    const mockRuns = [{
      _id: '1',
      distance: 5.0,
      time: 2400,
      averagePace: 8.0,
      caloriesBurned: 500,
      startTime: '2024-01-15T08:00:00Z',
      finishTime: '2024-01-15T08:40:00Z',
      createdAt: '2024-01-15T08:40:00Z'
    }];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({ success: true, data: mockRuns }),
    });

    render(<BrowserRouter><RunHistoryPage /></BrowserRouter>);

    await waitFor(() => {
      expect(screen.getByText('1 runs completed')).toBeInTheDocument();
    });

    const deleteButton = screen.getByTitle('Delete');
    fireEvent.click(deleteButton);

    expect(window.confirm).toHaveBeenCalled();
  });
});