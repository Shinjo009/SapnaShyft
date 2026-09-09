import { BACKEND_BASE_URL, BACKEND_ENABLED } from '../config/appConfig';
import { authorizedRequest } from './apiClient';

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
    const firstDetail = parsedBody.detail[0];
    return firstDetail?.msg || 'Validation error. Please check your input.';
  }

  if (typeof parsedBody.detail === 'string') {
    return parsedBody.detail;
  }

  if (typeof parsedBody.message === 'string') {
    return parsedBody.message;
  }

  return 'Request failed. Please try again.';
};

export const post = async (path, payload, extraHeaders = {}) => {
  if (!BACKEND_ENABLED) {
    throw new Error(
      'Backend base URL is not configured. Set REACT_APP_BACKEND_BASE_URL in .env and restart the app.'
    );
  }

  const response = await fetch(`${BACKEND_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...extraHeaders,
    },
    body: JSON.stringify(payload),
  });

  const parsedBody = await parseResponseBody(response);

  if (!response.ok) {
    throw new Error(getErrorMessage(parsedBody));
  }

  return parsedBody;
};

const normalizePhoneDigits = (phone) => String(phone || '').replace(/\D/g, '');

export const resendOtp = (phone) => post('/auth/resend-otp', { phone: normalizePhoneDigits(phone) });

// Temporarily disabled: /auth/send-otp. Send and resend both use /auth/resend-otp with the same payload.
export const sendOtp = (phone) => resendOtp(phone);

export const verifyOtp = ({ phone, otp }) => post('/auth/verify-otp', {
  phone: normalizePhoneDigits(phone),
  otp: String(otp || '').trim(),
});

export const refreshToken = (refreshTokenValue) => {
  if (!refreshTokenValue || !String(refreshTokenValue).trim()) {
    throw new Error('Missing refresh token. Please login again.');
  }

  return post('/auth/refresh-token', { refresh_token: refreshTokenValue });
};

export const logout = (refreshTokenValue) => {
  if (!refreshTokenValue || !String(refreshTokenValue).trim()) {
    return Promise.resolve(null);
  }

  return post('/auth/logout', { refresh_token: refreshTokenValue });
};

export const switchAccount = (targetUserId) => {
  const parsedTargetUserId = Number.parseInt(targetUserId, 10);

  if (Number.isNaN(parsedTargetUserId) || parsedTargetUserId <= 0) {
    throw new Error('Invalid target user id for account switch.');
  }

  return authorizedRequest(`/auth/switch/${parsedTargetUserId}`, {
    method: 'POST',
    payload: {},
  });
};
