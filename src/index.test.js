jest.mock('react-dom/client', () => {
  const render = jest.fn();
  return { createRoot: jest.fn(() => ({ render })) };
});
jest.mock('./reportWebVitals', () => jest.fn());

test('monta la aplicación en el elemento #root', () => {
  document.body.innerHTML = '<div id="root"></div>';

  require('./index');

  const { createRoot } = require('react-dom/client');
  const reportWebVitals = require('./reportWebVitals');
  const root = createRoot.mock.results[0].value;

  expect(createRoot).toHaveBeenCalledWith(document.getElementById('root'));
  expect(root.render).toHaveBeenCalledTimes(1);
  expect(reportWebVitals).toHaveBeenCalled();
});
