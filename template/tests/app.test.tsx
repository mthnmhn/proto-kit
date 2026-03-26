import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '@/App';

test('renders about page heading', () => {
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );

  expect(screen.getByText('Welcome to your prototype')).toBeInTheDocument();
});
