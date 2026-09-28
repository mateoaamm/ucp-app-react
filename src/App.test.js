import { render, screen } from '@testing-library/react';
import App from './App';

test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/Ã‚Â¡Universidad CatÃƒÂ³lica de Pereira !/i);
  expect(linkElement).toBeInTheDocument();
});
