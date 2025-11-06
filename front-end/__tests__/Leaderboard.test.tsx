// __tests__/Leaderboard.test.tsx
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Leaderboard from '../Leaderboard';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('Leaderboard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('user_data', JSON.stringify({
      _id: '1',
      displayName: 'Test User',
      userName: 'testuser'
    }));
    global.fetch = jest.fn();
  });

  test('renders leaderboard tabs', () => {
    (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));
    render(<BrowserRouter><Leaderboard /></BrowserRouter>);
    expect(screen.getByText('Distance')).toBeInTheDocument();
    expect(screen.getByText('Calories')).toBeInTheDocument();
  });

  test('displays leaderboard data', async () => {
    const mockLeaderboard = [
      {
        userId: '1',
        displayName: 'John Doe',
        userName: 'johndoe',
        totalDistance: 100.5,
        caloriesBurned: 10000,
        rank: 1
      },
      {
        userId: '2',
        displayName: 'Jane Smith',
        userName: 'janesmith',
        totalDistance: 95.2,
        caloriesBurned: 9500,
        rank: 2
      }
    ];

    (global.fetch as jest.Mock).mockImplementation((url) => {
      if (url.includes('myrank')) {
        return Promise.resolve({
          json: async () => ({ 
            success: true, 
            data: { myRank: 5, totalUsers: 100, leaderboard: [] } 
          }),
        });
      }
      return Promise.resolve({
        json: async () => ({ 
          success: true, 
          data: { leaderboard: mockLeaderboard } 
        }),
      });
    });

    render(<BrowserRouter><Leaderboard /></BrowserRouter>);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  test('switches between leaderboard types', async () => {
    (global.fetch as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        json: async () => ({ success: true, data: { leaderboard: [] } }),
      })
    );

    render(<BrowserRouter><Leaderboard /></BrowserRouter>);

    await waitFor(() => {
      expect(screen.getByText('Greatest Distance')).toBeInTheDocument();
    });

    const caloriesTab = screen.getByRole('button', { name: /calories/i });
    fireEvent.click(caloriesTab);

    await waitFor(() => {
      expect(screen.getByText('Most Calories Burned')).toBeInTheDocument();
    });
  });

  test('displays user rank', async () => {
    (global.fetch as jest.Mock).mockImplementation((url) => {
      if (url.includes('myrank')) {
        return Promise.resolve({
          json: async () => ({ 
            success: true, 
            data: { myRank: 15, totalUsers: 100, leaderboard: [] } 
          }),
        });
      }
      return Promise.resolve({
        json: async () => ({ success: true, data: { leaderboard: [] } }),
      });
    });

    render(<BrowserRouter><Leaderboard /></BrowserRouter>);

    await waitFor(() => {
      expect(screen.getByText('#15')).toBeInTheDocument();
      expect(screen.getByText('out of 100 runners')).toBeInTheDocument();
    });
  });
});