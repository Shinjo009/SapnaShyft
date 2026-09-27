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

export const updateMyProfile = async (payload) => {
  const result = await authorizedProfileRequest('/users/me', 'PUT', payload);
  invalidateMyProfileCache();
  return result;
};

const unwrapList = (response) => {
  if (Array.isArray(response?.data)) {
    return response.data;
  }
  if (Array.isArray(response)) {
    return response;
  }
  return [];
};

export const listMyAddresses = async () => {
  const response = await authorizedProfileRequest('/users/me/addresses');
  return unwrapList(response);
};

export const createMyAddress = async (payload) => {
  const result = await authorizedProfileRequest('/users/me/addresses', 'POST', payload);
  invalidateMyProfileCache();
  return result?.data && typeof result.data === 'object' ? result.data : result;
};

export const updateMyAddress = async (userAddressId, payload) => {
  const result = await authorizedProfileRequest(`/users/me/addresses/${userAddressId}`, 'PUT', payload);
  invalidateMyProfileCache();
  return result?.data && typeof result.data === 'object' ? result.data : result;
};

export const deleteMyAddress = async (userAddressId) => {
  const result = await authorizedProfileRequest(`/users/me/addresses/${userAddressId}`, 'DELETE');
  invalidateMyProfileCache();
  return result;
};
