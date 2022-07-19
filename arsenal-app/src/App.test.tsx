import { render, screen } from '@testing-library/react';
import App from './App';

test('renders classification banner', () => {
  render(<App />);
  const classificationBannerElements = screen.getAllByText(/Classification/i);
  expect(classificationBannerElements.length).toBe(2);
  classificationBannerElements.forEach((e) => expect(e).toBeInTheDocument());
});
