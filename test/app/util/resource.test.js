import fetch from 'unfetch';
import resource from 'app/util/resource';

jest.mock('unfetch', () => jest.fn(() => new Promise((resolve) => resolve())));

describe('Resource util', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  test('Setting base URL from build environment variable', () => {
    resource({
      endpoint: '/endpoint',
      method: 'GET',
      data: {},
    });

    const [[url]] = fetch.mock.calls;

    expect(url).toBe('https://example.com/endpoint');
  });

  test('JSON body is shipped with POST request', () => {
    resource({
      endpoint: '/endpoint',
      method: 'POST',
      data: { data: true },
    });

    const [[url, opts]] = fetch.mock.calls;

    expect(url).toBeDefined();
    expect(opts.body).toBe(JSON.stringify({ data: true }));
  });

  test('Client-side fatal error', (done) => {
    const mockError = new Error();
    fetch.mockImplementation(() => new Promise((resolve, reject) => reject(mockError)));

    resource({
      endpoint: '/endpoint',
    }, (err) => {
      expect(err).toBe(mockError);

      done();
    });
  });

  test('Invalid response JSON', (done) => {
    fetch.mockImplementation(() => new Promise((resolveFetch) => resolveFetch({
      json: () => new Promise((resolveJSON) => resolveJSON()),
    })));

    resource({
      endpoint: '/endpoint',
    }, (err) => {
      expect(err).toBeDefined();

      done();
    });
  });

  test('Successful API response', (done) => {
    fetch.mockImplementation(() => new Promise((resolveFetch) => resolveFetch({
      json: () => new Promise((resolveJSON) => resolveJSON({
        success: true,
        data: { response: true },
      })),
    })));

    resource({
      endpoint: '/endpoint',
    }, (err, data) => {
      expect(err).toBeNull();
      expect(data).toEqual({ response: true });

      done();
    });
  });

  test('Request/response pair captured as breadcrumb by Raven', (done) => {
    fetch.mockImplementation(() => new Promise((resolveFetch) => resolveFetch({
      json: () => new Promise((resolveJSON) => resolveJSON({
        success: true,
        data: { response: true },
      })),
      status: 200,
    })));
  });
});
