// __tests__/ProfileSettingsPage.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProfileSettingsPage from '../ProfileSettingsPage';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('ProfileSettingsPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem('token', 'test-token');
    global.fetch = jest.fn();
  });

  test('loads and displays user profile', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({
        success: true,
        data: {
          displayName: 'John Doe',
          userName: 'johndoe',
          email: 'john@example.com',
          weight: 70,
          height: 175,
          age: 30,
          sex: 'male'
        }
      }),
    });

    render(<BrowserRouter><ProfileSettingsPage /></BrowserRouter>);

    await waitFor(() => {
      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
      expect(screen.getByDisplayValue('johndoe')).toBeInTheDocument();
    });
  });

  test('calculates and displays BMI', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({
        success: true,
        data: {
          displayName: 'John Doe',
          userName: 'johndoe',
          email: 'john@example.com',
          weight: 70,
          height: 175,
          bmi: 22.9
        }
      }),
    });

    render(<BrowserRouter><ProfileSettingsPage /></BrowserRouter>);

    await waitFor(() => {
      expect(screen.getByText('22.9')).toBeInTheDocument();
      expect(screen.getByText('Normal weight')).toBeInTheDocument();
    });
  });

  test('successfully updates profile', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        json: async () => ({
          success: true,
          data: {
            displayName: 'John Doe',
            userName: 'johndoe',
            email: 'john@example.com'
          }
        }),
      })
      .mockResolvedValueOnce({
        json: async () => ({
          success: true,
          data: { displayName: 'John Smith' }
        }),
      });

    render(<BrowserRouter><ProfileSettingsPage /></BrowserRouter>);

    await waitFor(() => {
      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
    });

    const nameInput = screen.getByDisplayValue('John Doe');
    fireEvent.change(nameInput, { target: { value: 'John Smith' } });

    const saveButton = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Profile updated successfully!')).toBeInTheDocument();
    });
  });
});