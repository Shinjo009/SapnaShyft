import { authorizedRequest } from './apiClient';

const authorizedGet = async (path) => {
  return authorizedRequest(path, {
    method: 'GET',
  });
};

const extractListPayload = (response) => {
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

export const listDiagnosticPackages = async (_payload, options = {}) => {
  const query = {
    gender: options?.gender ?? _payload?.gender,
    tag: options?.tag ?? _payload?.tag,
    filter_chip: options?.filterChip ?? options?.filter_chip ?? _payload?.filterChip ?? _payload?.filter_chip,
    type: options?.type ?? _payload?.type,
    include_inactive: options?.includeInactive ?? options?.include_inactive ?? _payload?.includeInactive ?? _payload?.include_inactive,
    package_for: options?.packageFor ?? options?.package_for ?? _payload?.packageFor ?? _payload?.package_for,
  };

  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }
    params.append(key, String(value));
  });

  const queryString = params.toString();
  const path = queryString ? `/diagnostic-packages?${queryString}` : '/diagnostic-packages';
  const response = await authorizedGet(path);

  return extractListPayload(response);
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

  return extractListPayload(response);
};

export const listPublicDiagnosticPackageFilterChips = async (_payload) => {
  const response = await authorizedGet('/diagnostic-packages/filters-chips');

  return extractListPayload(response);
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

export const getDiagnosticPackageTests = async (packageId, _payload) => {
  const parsedId = Number(packageId);

  if (!Number.isFinite(parsedId) || parsedId <= 0) {
    throw new Error('Invalid diagnostic package id.');
  }

  const response = await authorizedGet(`/diagnostic-packages/${parsedId}/tests`);

  if (response?.data && typeof response.data === 'object') {
    return response.data;
  }

  if (response && typeof response === 'object') {
    return response;
  }

  return { groups: [] };
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
