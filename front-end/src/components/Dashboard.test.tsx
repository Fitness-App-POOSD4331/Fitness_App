import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import Dashboard from './Dashboard';
import { MemoryRouter } from 'react-router-dom';

describe('Dashboard Component', () => {
  beforeEach(() => {
    // Mock localStorage
    Storage.prototype.getItem = jest.fn((key) => {
      if (key === 'token') return 'mock-token';
      if (key === 'user_data') {
        return JSON.stringify({
          _id: '123',
          displayName: 'Bob Smith',
          userName: 'Bob',
          email: 'bob@example.com'
        });
      }
      return null;
    });

    // Mock fetch with correct API endpoints
    global.fetch = jest.fn((url) => {
      const urlString = url?.toString() || '';
      
      // Mock GET /api/runs (recent runs)
      if (urlString.includes('api/runs') && !urlString.includes('stats')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: [
              {
                _id: 'run1',
                distance: 5.2,
                time: 1800,
                averagePace: 8.5,
                caloriesBurned: 450,
                startTime: '2025-11-08T10:00:00Z',
                finishTime: '2025-11-08T10:30:00Z',
                createdAt: '2025-11-08T10:30:00Z'
              }
            ]
          })
        });
      }
      
      // Mock GET /api/runs/stats/summary
      if (urlString.includes('api/runs/stats/summary')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: {
              totalRuns: 10,
              totalDistance: 52.5,
              totalTime: 18000,
              totalCalories: 4500,
              averagePace: 8.5,
              averageDistance: 5.25
            }
          })
        });
      }
      
      // Mock GET /api/leaderboard/myrank
      if (urlString.includes('api/leaderboard/myrank')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: {
              myRank: 3,
              rank: 3,
              totalUsers: 10,
              leaderboard: [
                {
                  rank: 2,
                  userId: 'user2',
                  displayName: 'Alice Runner',
                  userName: 'alice',
                  totalDistance: 60.0,
                  caloriesBurned: 5000,
                  isCurrentUser: false
                },
                {
                  rank: 3,
                  userId: '123',
                  displayName: 'Bob Smith',
                  userName: 'Bob',
                  totalDistance: 52.5,
                  caloriesBurned: 4500,
                  isCurrentUser: true
                },
                {
                  rank: 4,
                  userId: 'user4',
                  displayName: 'Charlie Jogger',
                  userName: 'charlie',
                  totalDistance: 45.0,
                  caloriesBurned: 4000,
                  isCurrentUser: false
                }
              ]
            }
          })
        });
      }
      
      return Promise.reject(new Error('Unknown API endpoint: ' + urlString));
    }) as jest.Mock;
  });

  afterEach(() => {
    jest.resetAllMocks();
    localStorage.clear();
  });

  it('should fetch and display recent runs', async () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    // Wait for the component to load
    await waitFor(() => {
      expect(screen.queryByText(/Loading your dashboard/i)).not.toBeInTheDocument();
    });

    // Check if distance is displayed
    const distanceElement = await screen.findByText(/5\.2.*miles/i);
    expect(distanceElement).toBeInTheDocument();
  });

  it('should display user rank', async () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText(/Loading your dashboard/i)).not.toBeInTheDocument();
    });

    // Check for rank display
    await waitFor(() => {
      expect(screen.getByText('#3')).toBeInTheDocument();
    });

    expect(screen.getByText(/out of 10 runners/i)).toBeInTheDocument();
    
    // Check for username in header (use getAllByText since it appears multiple times)
    const bobElements = screen.getAllByText('Bob Smith');
    expect(bobElements.length).toBeGreaterThan(0);
    
    // Verify the username also appears in header
    expect(screen.getByText('@Bob')).toBeInTheDocument();
  });

  it('should display run statistics', async () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText(/Loading your dashboard/i)).not.toBeInTheDocument();
    });

    // Check stats are displayed
    expect(screen.getByText('10')).toBeInTheDocument(); // Total runs
    expect(screen.getByText('52.5')).toBeInTheDocument(); // Total distance
    expect(screen.getByText('4500')).toBeInTheDocument(); // Calories
  });
});