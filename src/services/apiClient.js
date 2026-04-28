import { BACKEND_BASE_URL, BACKEND_ENABLED } from '../config/appConfig';
import {
  getAccessToken,
  getRefreshToken,
  saveAuthTokens,
  extractTokensFromResponse,
  clearAuthTokens,
} from '../utils/authStorage';

let refreshInFlightPromise = null;

export const parseResponseBody = async (response) => {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

export const getErrorMessage = (parsedBody) => {
  if (!parsedBody) {
    return 'Request failed. Please try again.';
  }

  if (typeof parsedBody === 'string') {
    return parsedBody;
  }

  if (Array.isArray(parsedBody.detail) && parsedBody.detail.length > 0) {
    return parsedBody.detail[0]?.msg || 'Validation error. Please check your input.';
  }

  if (typeof parsedBody.detail === 'string') {
    return parsedBody.detail;
  }

  if (typeof parsedBody.message === 'string') {
    return parsedBody.message;
  }

  return 'Request failed. Please try again.';
};

const ensureBackendConfigured = () => {
  if (!BACKEND_ENABLED) {
    throw new Error(
      'Backend base URL is not configured. Set REACT_APP_BACKEND_BASE_URL in .env and restart the app.'
    );
  }
};

const toQueryString = (query = {}) => {
  const params = new URLSearchParams();

  Object.entries(query || {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }
    params.append(key, String(value));
  });

  const encoded = params.toString();
  return encoded ? `?${encoded}` : '';
};

const refreshAccessToken = async () => {
  if (refreshInFlightPromise) {
    return refreshInFlightPromise;
  }

  refreshInFlightPromise = (async () => {
    const refreshTokenValue = getRefreshToken();
    if (!refreshTokenValue) {
      throw new Error('Missing refresh token. Please login again.');
    }

    const response = await fetch(`${BACKEND_BASE_URL}/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshTokenValue }),
    });

    const parsedBody = await parseResponseBody(response);
    if (!response.ok) {
      throw new Error(getErrorMessage(parsedBody));
    }

    const tokens = extractTokensFromResponse(parsedBody, refreshTokenValue);
    if (!tokens.accessToken) {
      throw new Error('Refresh response missing access token. Please login again.');
    }

    saveAuthTokens(tokens);
    return tokens.accessToken;
  })();

  try {
    return await refreshInFlightPromise;
  } finally {
    refreshInFlightPromise = null;
  }
};

const runRequest = async ({
  path,
  method,
  payload,
  query,
  extraHeaders,
  accessToken,
}) => {
  const response = await fetch(`${BACKEND_BASE_URL}${path}${toQueryString(query)}`, {
    method,
    headers: {
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      'Content-Type': 'application/json',
      ...(extraHeaders || {}),
    },
    body: payload === undefined ? undefined : JSON.stringify(payload),
  });

  const parsedBody = await parseResponseBody(response);
  return { response, parsedBody };
};

export const authorizedRequest = async (
  path,
  {
    method = 'GET',
    payload,
    query,
    extraHeaders = {},
    requireAuth = true,
    missingAuthMessage = 'You are not logged in. Please login again.',
  } = {}
) => {
  ensureBackendConfigured();

  const initialAccessToken = requireAuth ? getAccessToken() : '';
  if (requireAuth && !initialAccessToken) {
    throw new Error(missingAuthMessage);
  }

  let { response, parsedBody } = await runRequest({
    path,
    method,
    payload,
    query,
    extraHeaders,
    accessToken: initialAccessToken,
  });

  if (requireAuth && response.status === 401) {
    try {
      const refreshedAccessToken = await refreshAccessToken();
      ({ response, parsedBody } = await runRequest({
        path,
        method,
        payload,
        query,
        extraHeaders,
        accessToken: refreshedAccessToken,
      }));
    } catch (refreshError) {
      clearAuthTokens();
      throw new Error(refreshError?.message || 'Session expired. Please login again.');
    }
  }

  if (!response.ok) {
    throw new Error(getErrorMessage(parsedBody));
  }

  return parsedBody;
};
