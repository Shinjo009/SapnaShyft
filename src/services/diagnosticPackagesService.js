import { BACKEND_BASE_URL, BACKEND_ENABLED } from '../config/appConfig';
import { getAccessToken } from '../utils/authStorage';

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

const resolveAccessTokenFromPayload = (payload) => {
  if (!payload || typeof payload !== 'object') {
    return '';
  }

  return String(
    payload?.accessToken
    ?? payload?.access_token
    ?? payload?.token
    ?? ''
  ).trim();
};

const authorizedGet = async (path, payload) => {
  if (!BACKEND_ENABLED) {
    throw new Error(
      'Backend base URL is not configured. Set REACT_APP_BACKEND_BASE_URL in .env and restart the app.'
    );
  }

  const accessToken = resolveAccessTokenFromPayload(payload) || getAccessToken();
  if (!accessToken) {
    throw new Error('You are not logged in. Please login again.');
  }

  const response = await fetch(`${BACKEND_BASE_URL}${path}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  const parsedBody = await parseResponseBody(response);

  if (!response.ok) {
    throw new Error(getErrorMessage(parsedBody));
  }

  return parsedBody;
};

export const listDiagnosticPackages = async (payload) => {
  const response = await authorizedGet('/diagnostic-packages', payload);

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response)) {
    return response;
  }

  return [];
};

export const listDiagnosticPackageFilterChips = async (payload, options) => {
  const requestedChipFor = String(
    options?.chipFor
    ?? payload?.chipFor
    ?? payload?.chip_for
    ?? 'custom_package'
  ).trim();

  const chipFor = requestedChipFor || 'custom_package';
  const response = await authorizedGet(`/diagnostic-packages/filters-chips?for=${encodeURIComponent(chipFor)}`, payload);

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.items)) {
    return response.items;
  }

  if (Array.isArray(response?.results)) {
    return response.results;
  }

  return [];
};

export const listPublicDiagnosticPackageFilterChips = async (payload) => {
  const response = await authorizedGet('/diagnostic-packages/filters-chips', payload);

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.items)) {
    return response.items;
  }

  if (Array.isArray(response?.results)) {
    return response.results;
  }

  return [];
};

export const getDiagnosticPackageDetail = async (packageId, payload) => {
  const parsedId = Number(packageId);

  if (!Number.isFinite(parsedId) || parsedId <= 0) {
    throw new Error('Invalid diagnostic package id.');
  }

  const response = await authorizedGet(`/diagnostic-packages/${parsedId}`, payload);

  if (response?.data && typeof response.data === 'object') {
    return response.data;
  }

  if (response && typeof response === 'object') {
    return response;
  }

  return null;
};

const appendFilterChipQuery = (path, filterChip) => {
  if (filterChip == null || filterChip === '') {
    return path;
  }

  const chips = Array.isArray(filterChip) ? filterChip : [filterChip];
  const encoded = chips
    .map((chip) => String(chip || '').trim())
    .filter(Boolean)
    .map((chip) => `filter_chip=${encodeURIComponent(chip)}`);

  if (encoded.length === 0) {
    return path;
  }

  return `${path}?${encoded.join('&')}`;
};

export const listDiagnosticTestGroups = async (filterChip, payload) => {
  const path = appendFilterChipQuery('/diagnostic-test-groups', filterChip);
  const response = await authorizedGet(path, payload);

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.items)) {
    return response.items;
  }

  if (Array.isArray(response?.results)) {
    return response.results;
  }

  return [];
};

export const listDiagnosticTestGroupTests = async (groupId, payload) => {
  const parsedId = Number(groupId);

  if (!Number.isFinite(parsedId) || parsedId <= 0) {
    throw new Error('Invalid diagnostic test group id.');
  }

  const response = await authorizedGet(`/diagnostic-test-groups/${parsedId}/tests`, payload);

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.items)) {
    return response.items;
  }

  if (Array.isArray(response?.results)) {
    return response.results;
  }

  return [];
};
