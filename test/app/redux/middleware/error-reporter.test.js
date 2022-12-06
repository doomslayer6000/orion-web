import errorReporter from 'app/redux/middleware/error-reporter';

describe('Error reporting middleware', () => {
  beforeEach(() => {
  });

  test('Breadcrumb captured on successful state reduction', () => {
    const store = {
      getState: () => 'state',
    };
    const next = jest.fn(() => 'result');
    const action = 'action';

    expect(errorReporter(store)(next)(action)).toBe('result');
    expect(next).toBeCalledWith(action);
  });

  test('Exception captured on state reduction failure', () => {
    const store = {
      getState: () => 'state',
    };
    const next = jest.fn(() => {
      throw new Error();
    });
    const action = 'action';

    expect(() => errorReporter(store)(next)(action)).toThrow();
    expect(next).toBeCalledWith(action);
   
  });
});
