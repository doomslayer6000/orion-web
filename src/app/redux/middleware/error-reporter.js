/**
 * Sentry reporting middleware for errors that are thrown when executing Redux reducers in response
 * to dispatched actions. Since the error is explicitly try-caught, the error will not be duplicated
 * by the globally monkey-patched exception handler via Raven.config(...).install().
 */
const errorReporter = (store) => (next) => (action) => {
  try {
    const result = next(action);


    return result;
  } catch (err) {
 
    throw err;
  }
};

export default errorReporter;
