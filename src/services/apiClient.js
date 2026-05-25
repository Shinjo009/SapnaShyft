import { BACKEND_BASE_URL, BACKEND_ENABLED } from '../config/appConfig';
import {
  getAccessToken,
  getRefreshToken,
  saveAuthTokens,
  extractTokensFromResponse,
  clearAuthTokens,
} from '../utils/authStorage';
import {
  SessionExpiredError,
  dispatchSessionExpired,
  logAuthError,
} from '../utils/sessionAuth';

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
      const detail = { reason: 'missing_refresh_token' };
      logAuthError('Token refresh skipped', detail);
      clearAuthTokens();
      dispatchSessionExpired(detail);
      throw new SessionExpiredError(detail);
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
      const detail = { status: response.status, body: parsedBody };
      logAuthError('Token refresh failed', getErrorMessage(parsedBody), detail);
      clearAuthTokens();
      dispatchSessionExpired(detail);
      throw new SessionExpiredError(detail);
    }

    const tokens = extractTokensFromResponse(parsedBody, refreshTokenValue);
    if (!tokens.accessToken) {
      const detail = { reason: 'missing_access_token_in_refresh_response', body: parsedBody };
      logAuthError('Token refresh response invalid', detail);
      clearAuthTokens();
      dispatchSessionExpired(detail);
      throw new SessionExpiredError(detail);
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
    const detail = { reason: 'missing_access_token', path };
    logAuthError('Authorized request blocked', missingAuthMessage, detail);
    clearAuthTokens();
    dispatchSessionExpired(detail);
    throw new SessionExpiredError(detail);
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
      if (refreshError instanceof SessionExpiredError) {
        throw refreshError;
      }
      const detail = { path, cause: refreshError?.message || refreshError };
      logAuthError('Token refresh retry failed', refreshError, detail);
      clearAuthTokens();
      dispatchSessionExpired(detail);
      throw new SessionExpiredError(detail);
    }
  }

  if (!response.ok) {
    if (requireAuth && response.status === 401) {
      const detail = { path, status: 401, body: parsedBody };
      logAuthError('Unauthorized after token refresh', getErrorMessage(parsedBody), detail);
      clearAuthTokens();
      dispatchSessionExpired(detail);
      throw new SessionExpiredError(detail);
    }
    throw new Error(getErrorMessage(parsedBody));
  }

  return parsedBody;
};
