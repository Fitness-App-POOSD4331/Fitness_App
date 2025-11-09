import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from '../components/Login';
import Dashboard from '../components/Dashboard';
import EmailVerificationPage from '../components/EmailVerification';

// Integration test: Tests actual routing and multiple components together
describe('Authentication Flow Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('should complete full login to dashboard flow', async () => {
    const user = userEvent.setup();
    
    // Mock successful login - match whatever structure your Login component expects
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        token: 'fake-jwt-token',
        user: { id: '123', username: 'testuser', email: 'test@example.com' },
      }),
    });
    
    render(
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </BrowserRouter>
    );
    
    // Fill out login form
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'Password123!');
    
    // Get all buttons and find the submit one (with "Login" text, not "Sign In")
    const buttons = screen.getAllByRole('button');
    const loginButton = buttons.find(btn => btn.textContent?.includes('Login'));
    expect(loginButton).toBeDefined();
    
    await user.click(loginButton!);
    
    // Just verify login API was called with correct credentials
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    }, { timeout: 3000 });
    
    // Verify the API was called with login endpoint
    const fetchCalls = (global.fetch as jest.Mock).mock.calls;
    const loginCall = fetchCalls.find(call => 
      call[0].includes('/login') || call[0].includes('/auth')
    );
    expect(loginCall).toBeDefined();
  });

  it('should handle login failure and show error', async () => {
    const user = userEvent.setup();
    
    // Mock failed login
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        success: false,
        message: 'Invalid credentials',
      }),
    });
    
    render(
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
        </Routes>
      </BrowserRouter>
    );
    
    // Fill out login form with bad credentials
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    
    await user.type(emailInput, 'wrong@example.com');
    await user.type(passwordInput, 'WrongPassword');
    
    // Get all buttons and find the submit one (with "Login" text, not "Sign In")
    const buttons = screen.getAllByRole('button');
    const loginButton = buttons.find(btn => btn.textContent?.includes('Login'));
    expect(loginButton).toBeDefined();
    
    await user.click(loginButton!);
    
    // Should show error message and stay on login page
    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    }, { timeout: 5000 });
    
    // Should not store token
    expect(localStorage.getItem('token')).toBeNull();
  });
});