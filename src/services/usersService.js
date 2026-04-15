
import { post } from './authService';
import { SIGNUP_BEARER_TOKEN } from '../config/appConfig';
import { BACKEND_BASE_URL, BACKEND_ENABLED } from '../config/appConfig';
import { getAccessToken } from '../utils/authStorage';

const MY_PROFILES_CACHE_TTL_MS = 30000;
let myProfilesCache = null;
let myProfilesInFlight = null;

// Preferences API
export const getMyPreferences = () =>
  authorizedUsersRequest('/users/me/preferences', 'GET').then((response) => response?.data || response);

export const updateMyPreferences = (preferences) =>
  authorizedUsersRequest('/users/me/preferences', 'PUT', preferences).then((response) => response?.data || response);

export const submitSupportTicket = ({ contact_input, query_text }) =>
  post('/support/tickets', { contact_input, query_text }).then((response) => response?.data || response);

const formatDate = (date) => date.toISOString().split('T')[0];

const parseAge = (ageValue) => {
  const age = Number.parseInt(ageValue, 10);

  if (Number.isNaN(age) || age <= 0) {
    return undefined;
  }

  return age;
};

const getDateOfBirthFromAge = (ageValue) => {
  const age = parseAge(ageValue);

  if (age === undefined) {
    return undefined;
  }

  const today = new Date();
  const dateOfBirth = new Date(today.getFullYear() - age, today.getMonth(), today.getDate());

  return formatDate(dateOfBirth);
};

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

const authorizedUsersRequest = async (path, method = 'GET', payload) => {
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

export const buildCreateUserPayload = (formData) => ({
  age: parseAge(formData.age),
  first_name: formData.firstName.trim(),
  last_name: formData.lastName.trim(),
  phone: formData.phone.trim(),
  email: formData.email.trim(),
  date_of_birth: getDateOfBirthFromAge(formData.age),
  gender: formData.gender.trim(),
  city: formData.city.trim(),
  referred_by: formData.organization?.trim() || undefined,
  status: 'active',
});

export const createUser = (formData) => {
  const headers = SIGNUP_BEARER_TOKEN
    ? { Authorization: `Bearer ${SIGNUP_BEARER_TOKEN}` }
    : {};

  return post('/users', buildCreateUserPayload(formData), headers);
};

export const getMyProfiles = async ({ forceRefresh = false } = {}) => {
  const accessToken = getAccessToken();

  if (!forceRefresh
    && myProfilesCache
    && myProfilesCache.token === accessToken
    && myProfilesCache.expiresAt > Date.now()) {
    return myProfilesCache.value;
  }

  if (!forceRefresh
    && myProfilesInFlight
    && myProfilesInFlight.token === accessToken) {
    return myProfilesInFlight.promise;
  }

  const promise = authorizedUsersRequest('/users/me/profiles')
    .then((value) => {
      myProfilesCache = {
        token: accessToken,
        value,
        expiresAt: Date.now() + MY_PROFILES_CACHE_TTL_MS,
      };

      return value;
    })
    .finally(() => {
      if (myProfilesInFlight?.token === accessToken) {
        myProfilesInFlight = null;
      }
    });

  myProfilesInFlight = { token: accessToken, promise };
  return promise;
};

export const invalidateMyProfilesCache = () => {
  myProfilesCache = null;
  myProfilesInFlight = null;
};

export const buildCreateSubProfilePayload = (formData) => ({
  age: parseAge(formData.age),
  first_name: formData.firstName.trim(),
  last_name: formData.lastName.trim(),
  date_of_birth: getDateOfBirthFromAge(formData.age),
  gender: formData.gender.trim().toLowerCase(),
  relationship: formData.relation.trim().toLowerCase(),
  phone: formData.phone.trim() || null,
  city: formData.city.trim() || null,
});

export const createMySubProfile = (formData) => {
  return authorizedUsersRequest('/users/me/profiles', 'POST', buildCreateSubProfilePayload(formData));
};

export const updateMySubProfile = (userId, payload) => {
  const parsedUserId = Number(userId || 0);

  if (!Number.isFinite(parsedUserId) || parsedUserId <= 0) {
    throw new Error('Invalid sub profile user id for update.');
  }

  const safePayload = payload && typeof payload === 'object' ? payload : {};
  return authorizedUsersRequest('/users/me', 'PUT', {
    ...safePayload,
    user_id: parsedUserId,
  });
};

export const unlinkMyProfile = (payload = {}) => {
  const safePayload = payload && typeof payload === 'object' ? payload : {};
  return authorizedUsersRequest('/users/me/unlink', 'POST', safePayload);
};
