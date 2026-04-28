import { authorizedRequest } from './apiClient';

const authorizedGet = async (path) => {
  return authorizedRequest(path, {
    method: 'GET',
  });
};

export const listDiagnosticPackages = async (_payload) => {
  const response = await authorizedGet('/diagnostic-packages');

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response)) {
    return response;
  }

  return [];
};

export const listDiagnosticPackageFilterChips = async (_payload, options) => {
  const requestedChipFor = String(
    options?.chipFor
    ?? _payload?.chipFor
    ?? _payload?.chip_for
    ?? 'custom_package'
  ).trim();

  const chipFor = requestedChipFor || 'custom_package';
  const response = await authorizedGet(`/diagnostic-packages/filters-chips?for=${encodeURIComponent(chipFor)}`);

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

export const listPublicDiagnosticPackageFilterChips = async (_payload) => {
  const response = await authorizedGet('/diagnostic-packages/filters-chips');

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

export const getDiagnosticPackageDetail = async (packageId, _payload) => {
  const parsedId = Number(packageId);

  if (!Number.isFinite(parsedId) || parsedId <= 0) {
    throw new Error('Invalid diagnostic package id.');
  }

  const response = await authorizedGet(`/diagnostic-packages/${parsedId}`);

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

export const listDiagnosticTestGroups = async (filterChip, _payload) => {
  const path = appendFilterChipQuery('/diagnostic-test-groups', filterChip);
  const response = await authorizedGet(path);

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

export const listDiagnosticTestGroupTests = async (groupId, _payload) => {
  const parsedId = Number(groupId);

  if (!Number.isFinite(parsedId) || parsedId <= 0) {
    throw new Error('Invalid diagnostic test group id.');
  }

  const response = await authorizedGet(`/diagnostic-test-groups/${parsedId}/tests`);

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
