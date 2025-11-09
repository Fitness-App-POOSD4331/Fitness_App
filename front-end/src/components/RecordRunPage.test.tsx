import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import RecordRunPage from './RecordRunPage';

// Helper function to render with router
function renderWithRouter(component: React.ReactElement) {
  return render(
    <MemoryRouter>
      {component}
    </MemoryRouter>
  );
}

describe('RecordRunPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('user_data', JSON.stringify({
      displayName: 'Test User',
      weight: 70
    }));
  });

  afterEach(() => {
    jest.resetAllMocks();
    localStorage.clear();
  });

  it('should render record run form', () => {
    renderWithRouter(<RecordRunPage />);
    
    expect(screen.getByText(/record.*run/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/5\.0|distance/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /record|save|submit/i })).toBeInTheDocument();
  });

  it('should accept distance input', async () => {
    const user = userEvent.setup();
    renderWithRouter(<RecordRunPage />);
    
    const distanceInput = screen.getByPlaceholderText(/5\.0|distance/i);
    await user.type(distanceInput, '5');
    
    expect(distanceInput).toHaveValue(5);
  });

  it('should have a submit button', () => {
    renderWithRouter(<RecordRunPage />);
    
    const submitButton = screen.getByRole('button', { name: /record|save|submit/i });
    expect(submitButton).toBeInTheDocument();
  });
});