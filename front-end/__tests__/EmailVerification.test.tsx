// __tests__/EmailVerification.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import EmailVerification from '../EmailVerification';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useSearchParams: () => [new URLSearchParams('token=test-token')],
}));

describe('EmailVerification Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  test('shows verifying state initially', () => {
    (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));
    render(<BrowserRouter><EmailVerification /></BrowserRouter>);
    expect(screen.getByText('Verifying your email...')).toBeInTheDocument();
  });

  test('shows success message on successful verification', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({ success: true, message: 'Email verified!' }),
    });

    render(<BrowserRouter><EmailVerification /></BrowserRouter>);

    await waitFor(() => {
      expect(screen.getByText(/Email Verified!/i)).toBeInTheDocument();
    });
  });

  test('shows error message on failed verification', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({ success: false, message: 'Invalid token' }),
    });

    render(<BrowserRouter><EmailVerification /></BrowserRouter>);

    await waitFor(() => {
      expect(screen.getByText(/Verification Failed/i)).toBeInTheDocument();
      expect(screen.getByText('Invalid token')).toBeInTheDocument();
    });
  });
});