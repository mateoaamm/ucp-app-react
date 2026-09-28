import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Universidad Catolica de Pereira', () => {
  render(<App />);
  const linkElement = screen.getByText(/Universidad Cat.lica de Pereira/i);
  expect(linkElement).toBeInTheDocument();
});