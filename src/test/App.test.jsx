import { render, screen } from '@testing-library/react';
import App from '../App';

describe('App shell', () => {
  it('shows the workspace dashboard heading', async () => {
    render(<App />);
    expect(await screen.findByText(/Workplace Efficiency & Sustainability/i)).toBeInTheDocument();
  });
});
