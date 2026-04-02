import { BACKEND_BASE_URL, BACKEND_ENABLED } from '../config/appConfig';
import { getAccessToken } from '../utils/authStorage';

const PROFILE_CACHE_TTL_MS = 30000;
let myProfileCache = null;
let myProfileInFlight = null;

const parseResponseBody = async (response) => {
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

const getErrorMessage = (parsedBody) => {
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

const authorizedRequest = async (path, method = 'GET', payload) => {
  if (!BACKEND_ENABLED) {
    throw new Error(
      'Backend base URL is not configured. Set REACT_APP_BACKEND_BASE_URL in .env and restart the app.'
    );
  }

  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new Error('You are not logged in. Please login again.');
  }

  const response = await fetch(`${BACKEND_BASE_URL}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: payload ? JSON.stringify(payload) : undefined,
  });

  const parsedBody = await parseResponseBody(response);

  if (!response.ok) {
    throw new Error(getErrorMessage(parsedBody));
  }

  return parsedBody;
};

export const getMyProfile = (options) => getMyProfileCached(options);

export const getMyProfileCached = async ({ forceRefresh = false } = {}) => {
  const accessToken = getAccessToken();

  if (!forceRefresh
    && myProfileCache
    && myProfileCache.token === accessToken
    && myProfileCache.expiresAt > Date.now()) {
    return myProfileCache.value;
  }

  if (!forceRefresh
    && myProfileInFlight
    && myProfileInFlight.token === accessToken) {
    return myProfileInFlight.promise;
  }

  const promise = authorizedRequest('/users/me')
    .then((value) => {
      myProfileCache = {
        token: accessToken,
        value,
        expiresAt: Date.now() + PROFILE_CACHE_TTL_MS,
      };

      return value;
    })
    .finally(() => {
      if (myProfileInFlight?.token === accessToken) {
        myProfileInFlight = null;
      }
    });

  myProfileInFlight = { token: accessToken, promise };
  return promise;
};

export const getMyProfileWithCache = getMyProfileCached;

export const invalidateMyProfileCache = () => {
  myProfileCache = null;
  myProfileInFlight = null;
};

export const updateMyProfile = (payload) => authorizedRequest('/users/me', 'PUT', payload);
