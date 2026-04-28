import { authorizedRequest as apiAuthorizedRequest } from './apiClient';
import { getAccessToken } from '../utils/authStorage';

const PROFILE_CACHE_TTL_MS = 30000;
let myProfileCache = null;
let myProfileInFlight = null;

const authorizedProfileRequest = async (path, method = 'GET', payload) => {
  return apiAuthorizedRequest(path, {
    method,
    payload,
  });
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

  const promise = authorizedProfileRequest('/users/me')
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

export const updateMyProfile = (payload) => authorizedProfileRequest('/users/me', 'PUT', payload);
