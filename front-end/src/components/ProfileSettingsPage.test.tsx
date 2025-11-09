import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProfileSettingsPage from './ProfileSettingsPage';

// Helper function to render with router
function renderWithRouter(component: React.ReactElement) {
  return render(
    <MemoryRouter>
      {component}
    </MemoryRouter>
  );
}

describe('ProfileSettingsPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('user_data', JSON.stringify({
      displayName: 'Test User',
      email: 'test@example.com',
      userName: 'testuser',
      weight: 70,
      height: 175
    }));
    
    // Mock fetch to return profile data
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          displayName: 'Test User',
          email: 'test@example.com',
          userName: 'testuser',
          weight: 70,
          height: 175
        }
      })
    });
    global.fetch = mockFetch as jest.Mock;
  });

  afterEach(() => {
    jest.resetAllMocks();
    localStorage.clear();
  });

  it('should render profile settings page', async () => {
    renderWithRouter(<ProfileSettingsPage />);
    
    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });
    
    // Use heading role to get specific element
    expect(screen.getByRole('heading', { name: /profile settings/i })).toBeInTheDocument();
  });

  it('should display user information after loading', async () => {
    renderWithRouter(<ProfileSettingsPage />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });
    
    // Check if user data is in the form
    expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
  });

  it('should show loading state initially', () => {
    renderWithRouter(<ProfileSettingsPage />);
    
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });
});