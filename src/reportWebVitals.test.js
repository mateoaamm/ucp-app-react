import reportWebVitals from './reportWebVitals';
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

jest.mock('web-vitals', () => ({
  getCLS: jest.fn(),
  getFID: jest.fn(),
  getFCP: jest.fn(),
  getLCP: jest.fn(),
  getTTFB: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

test('no mide nada si no recibe una función', async () => {
  reportWebVitals();
  await new Promise((resolve) => setTimeout(resolve, 0));
  expect(getCLS).not.toHaveBeenCalled();
});

test('registra las 5 métricas cuando recibe una función', async () => {
  const onPerfEntry = jest.fn();
  reportWebVitals(onPerfEntry);
  await new Promise((resolve) => setTimeout(resolve, 0));

  [getCLS, getFID, getFCP, getLCP, getTTFB].forEach((metrica) => {
    expect(metrica).toHaveBeenCalledWith(onPerfEntry);
  });
});
