import { render, screen } from '@testing-library/react';
import App from './App';

test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/Â¡Universidad CatÃ³lica de Pereira !/i);
  expect(linkElement).toBeInTheDocument();
});
