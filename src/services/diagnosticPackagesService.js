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

const authorizedGet = async (path) => {
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

export const listDiagnosticPackages = async () => {
  const response = await authorizedGet('/diagnostic-packages');

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response)) {
    return response;
  }

  return [];
};

export const getDiagnosticPackageDetail = async (packageId) => {
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
