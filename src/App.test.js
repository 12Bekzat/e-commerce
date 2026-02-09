import { render, screen } from '@testing-library/react';
import App from './App';

test('renders diploma-style management platform home', () => {
  render(<App />);
  expect(screen.getByText(/Demand & Price Management System/i)).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /Open pricing center/i })).toBeInTheDocument();
  expect(screen.getByText(/Intelligent demand and price management workspace/i)).toBeInTheDocument();
});
