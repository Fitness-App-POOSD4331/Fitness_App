// __tests__/RecordRunPage.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import RecordRunPage from '../RecordRunPage';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('RecordRunPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  test('renders record run form', () => {
    render(<BrowserRouter><RecordRunPage /></BrowserRouter>);
    expect(screen.getByText('Record New Run')).toBeInTheDocument();
    expect(screen.getByLabelText(/distance \(miles\)/i)).toBeInTheDocument();
  });

  test('calculates pace automatically', () => {
    render(<BrowserRouter><RecordRunPage /></BrowserRouter>);
    
    const distanceInput = screen.getByPlaceholderText('5.0');
    const minutesInput = screen.getByPlaceholderText('0');
    
    fireEvent.change(distanceInput, { target: { value: '5' } });
    fireEvent.change(minutesInput, { target: { value: '40' } });

    // Pace should be 40/5 = 8.00 min/mile
    expect(screen.getByText('8.00')).toBeInTheDocument();
  });

  test('validates duration is not zero', async () => {
    render(<BrowserRouter><RecordRunPage /></BrowserRouter>);
    
    const distanceInput = screen.getByPlaceholderText('5.0');
    const caloriesInput = screen.getByPlaceholderText('350');
    
    fireEvent.change(distanceInput, { target: { value: '5' } });
    fireEvent.change(caloriesInput, { target: { value: '300' } });

    const saveButton = screen.getByRole('button', { name: /save run/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid duration')).toBeInTheDocument();
    });
  });

  test('successfully submits run data', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({ success: true }),
    });

    render(<BrowserRouter><RecordRunPage /></BrowserRouter>);
    
    fireEvent.change(screen.getByPlaceholderText('5.0'), { target: { value: '5' } });
    fireEvent.change(screen.getAllByPlaceholderText('0')[1], { target: { value: '40' } });
    fireEvent.change(screen.getByPlaceholderText('350'), { target: { value: '300' } });

    const saveButton = screen.getByRole('button', { name: /save run/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Run recorded successfully!')).toBeInTheDocument();
    });
  });
});