import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import CheckEmail from './CheckEmail';

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

describe('CheckEmail Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn() as any;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should render check email page', () => {
    renderWithRouter(<CheckEmail />);
    
    expect(screen.getByRole('heading', { name: /check your email/i })).toBeInTheDocument();
  });

  it('should display email verification instructions', () => {
    renderWithRouter(<CheckEmail />);
    
    expect(screen.getByText(/verification.*sent|sent.*verification/i)).toBeInTheDocument();
    expect(screen.getByText(/click.*link|follow.*link/i)).toBeInTheDocument();
  });

  it('should have a resend verification link button', () => {
    renderWithRouter(<CheckEmail />);
    
    expect(screen.getByRole('button', { name: /resend|send again/i })).toBeInTheDocument();
  });

  it('should successfully resend verification email', async () => {
    const user = userEvent.setup();
    
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        message: 'Verification email resent',
      }),
    }) as any;
    
    renderWithRouter(<CheckEmail />);
    
    const resendButton = screen.getByRole('button', { name: /resend|send again/i });
    await user.click(resendButton);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/auth/resend-verification'),
        expect.objectContaining({
          method: 'POST',
        })
      );
    });
    
    expect(await screen.findByText(/verification email sent|check your inbox/i)).toBeInTheDocument();
  });

  it('should show loading state while resending', async () => {
    const user = userEvent.setup();
    
    global.fetch = jest.fn().mockImplementation(() => new Promise(() => {})) as any;
    
    renderWithRouter(<CheckEmail />);
    
    const resendButton = screen.getByRole('button', { name: /resend|send again/i });
    await user.click(resendButton);
    
    expect(screen.getByText(/sending|loading/i)).toBeInTheDocument();
  });

  it('should disable resend button while sending', async () => {
    const user = userEvent.setup();
    
    global.fetch = jest.fn().mockImplementation(() => new Promise(() => {})) as any;
    
    renderWithRouter(<CheckEmail />);
    
    const resendButton = screen.getByRole('button', { name: /resend|send again/i });
    await user.click(resendButton);
    
    expect(resendButton).toBeDisabled();
  });

  it('should show error message when resend fails', async () => {
    const user = userEvent.setup();
    
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        success: false,
        message: 'Failed to resend verification email',
      }),
    }) as any;
    
    renderWithRouter(<CheckEmail />);
    
    const resendButton = screen.getByRole('button', { name: /resend|send again/i });
    await user.click(resendButton);
    
    expect(await screen.findByText(/failed.*resend/i)).toBeInTheDocument();
  });

  it('should navigate back to login', async () => {
    const user = userEvent.setup();
    renderWithRouter(<CheckEmail />);
    
    const backToLoginLink = screen.getByText(/back to login/i);
    await user.click(backToLoginLink);
    
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('should display spam folder reminder', () => {
    renderWithRouter(<CheckEmail />);
    
    expect(screen.getByText(/check.*spam|spam.*folder/i)).toBeInTheDocument();
  });
});