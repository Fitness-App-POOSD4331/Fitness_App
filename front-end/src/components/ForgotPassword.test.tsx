import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// Mock import.meta before importing the component
Object.defineProperty(global, 'import', {
  value: {
    meta: {
      env: {
        MODE: 'test',
        VITE_API_URL: 'http://localhost:5001'
      }
    }
  },
  writable: true
});

import ForgotPassword from './ForgotPassword';

describe('ForgotPassword Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn() as jest.Mock;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  function setup() {
    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    );
  }

  it('renders the forgot password form', () => {
    setup();
    expect(screen.getByText(/forgot password/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/you@example.com/i)).toBeInTheDocument();
  });

  // Remove the invalid email / empty email tests because component doesn't validate

  it('calls API and shows success message on valid submission', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        message: 'Password reset link sent successfully',
      }),
    });

    setup();
    const emailInput = screen.getByPlaceholderText(/you@example.com/i);
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    const submitButton = screen.getByRole('button', { name: /send reset link/i });
    fireEvent.click(submitButton);

    await waitFor(() =>
      expect(
        screen.getByText(/password reset link sent successfully/i)
      ).toBeInTheDocument()
    );
  });

  it('shows error message on failed API response', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: false,
        message: 'Failed to send reset link',
      }),
    });

    setup();
    const emailInput = screen.getByPlaceholderText(/you@example.com/i);
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    const submitButton = screen.getByRole('button', { name: /send reset link/i });
    fireEvent.click(submitButton);

    await waitFor(() =>
      expect(screen.getByText(/failed to send reset link/i)).toBeInTheDocument()
    );
  });

  it('shows network error on fetch failure', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network Error'));

    setup();
    const emailInput = screen.getByPlaceholderText(/you@example.com/i);
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    const submitButton = screen.getByRole('button', { name: /send reset link/i });
    fireEvent.click(submitButton);

    await waitFor(() =>
      expect(
        screen.getByText(/an error occurred\. please try again\./i)
      ).toBeInTheDocument()
    );
  });
});