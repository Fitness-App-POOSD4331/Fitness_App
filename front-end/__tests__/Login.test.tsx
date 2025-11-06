// __tests__/Login.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../Login';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('Login Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  test('renders login form by default', () => {
    render(<BrowserRouter><Login /></BrowserRouter>);
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
  });

  test('switches to register form', () => {
    render(<BrowserRouter><Login /></BrowserRouter>);
    const registerButton = screen.getByRole('button', { name: /register/i });
    fireEvent.click(registerButton);
    expect(screen.getByPlaceholderText('John Doe')).toBeInTheDocument();
  });

  test('successful login redirects to dashboard', async () => {
    (global.fetch).mockResolvedValueOnce({
      json: async () => ({ success: true, data: { token: 'test-token', displayName: 'Test User' } }),
    });

    render(<BrowserRouter><Login /></BrowserRouter>);
    
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { value: 'password123' },
    });
    
    const loginButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(localStorage.getItem('token')).toBe('test-token');
    });
  });

  test('displays error message on failed login', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({ success: false, message: 'Invalid credentials' }),
    });

    render(<BrowserRouter><Login /></BrowserRouter>);
    
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { value: 'wrongpassword' },
    });
    
    const loginButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  test('validates password match in registration', async () => {
    render(<BrowserRouter><Login /></BrowserRouter>);
    
    const registerTab = screen.getByRole('button', { name: /register/i });
    fireEvent.click(registerTab);

    fireEvent.change(screen.getByPlaceholderText('John Doe'), {
      target: { value: 'Test User' },
    });
    fireEvent.change(screen.getByPlaceholderText('johndoe123'), {
      target: { value: 'testuser' },
    });
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), {
      target: { value: 'test@example.com' },
    });
    
    const passwordInputs = screen.getAllByPlaceholderText('••••••••');
    fireEvent.change(passwordInputs[0], { target: { value: 'password123' } });
    fireEvent.change(passwordInputs[1], { target: { value: 'password456' } });

    const createButton = screen.getByRole('button', { name: /create account/i });
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });
  });
});