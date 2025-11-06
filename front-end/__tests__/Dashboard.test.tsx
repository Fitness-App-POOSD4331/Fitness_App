// __tests__/Dashboard.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from '../Dashboard';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('Dashboard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('user_data', JSON.stringify({
      _id: '1',
      displayName: 'Test User',
      userName: 'testuser',
      email: 'test@example.com'
    }));
    global.fetch = jest.fn();
  });

  test('renders loading state initially', () => {
    render(<BrowserRouter><Dashboard /></BrowserRouter>);
    expect(screen.getByText('Loading your dashboard...')).toBeInTheDocument();
  });

  test('loads and displays user data', async () => {
    (global.fetch as jest.Mock).mockImplementation((url) => {
      if (url.includes('api/runs')) {
        return Promise.resolve({
          json: async () => ({ success: true, data: [] }),
        });
      }
      if (url.includes('api/runs/stats/summary')) {
        return Promise.resolve({
          json: async () => ({ 
            success: true, 
            data: { 
              totalRuns: 5, 
              totalDistance: 25.5, 
              totalCalories: 2500,
              averagePace: 8.5 
            } 
          }),
        });
      }
      return Promise.resolve({
        json: async () => ({ success: true, data: {} }),
      });
    });

    render(<BrowserRouter><Dashboard /></BrowserRouter>);

    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText('@testuser')).toBeInTheDocument();
    });
  });

  test('displays no runs message when no runs exist', async () => {
    (global.fetch as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        json: async () => ({ success: true, data: [] }),
      })
    );

    render(<BrowserRouter><Dashboard /></BrowserRouter>);

    await waitFor(() => {
      expect(screen.getByText('No runs recorded yet')).toBeInTheDocument();
    });
  });

  test('redirects to login when no token exists', () => {
    localStorage.removeItem('token');
    render(<BrowserRouter><Dashboard /></BrowserRouter>);
    
    waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });
});