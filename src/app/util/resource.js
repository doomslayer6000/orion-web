import fetch from 'unfetch';

const BASE_URL = process.env.ORION_SERVER_URL || '';

// Stateful record of the most recent timestamp of a fetch for a particular request ID.
// Used to reject responses that are stale (superseded by a more recent request).
const fetchTimestamps = {};

// Error code for a request failure due to deduplication with a subsequent request with the same ID.
export const EREQUESTDEDUPLICATION = 'EREQUESTDEDUPLICATION';

/**
 * Make a client-side request to a server-side endpoint.
 *
 * @param {string} Unique identifier for this request used for response de-duplication. If multiple
 *                 requests with the same identifier overlap temporally, only the most recent
 *                 request's callback will be successful.
 * @param {string} endpoint Endpoint path.
 * @param {string} method HTTP verb for the request.
 * @param {Object} data Optional JSON request payload.
 * @param {Function=} cb Callback function to invoke on completion.
 */
const resource = ({ id = 'fetch', endpoint, method, data = {} }, cb = (() => {})) => {
  const currentFetchTimestamp = Date.now();
  fetchTimestamps[id] = currentFetchTimestamp;

  fetch(`${BASE_URL}${endpoint}`, {
    method,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    ...Object.keys(data).length &&
      !['HEAD', 'GET'].includes(method) &&
      { body: JSON.stringify(data) },
  })
    .then((resp) => {
      if (currentFetchTimestamp !== fetchTimestamps[id]) {
        return cb({
          code: EREQUESTDEDUPLICATION,
          message: 'Request superseded by more recent request of the same ID',
        });
      }

      return resp.json().then(({ data: respData } = {}) => {
     
        return cb(null, respData);
      });
    })
    .catch((err) => cb(err));
};

export default resource;
