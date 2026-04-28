/**
 * Razorpay package payments — browser uses Checkout.js; never put Key Secret in the frontend.
 *
 * Backend (required for production):
 * 1) POST /payments/create-order — expects { user_id, items[] }.
 * 2) POST /payments/verify — expects { razorpay_payment_id, razorpay_order_id, razorpay_signature }.
 * 3) Webhook `payment.captured` on your server — source of truth for settlement; notify admin / update DB.
 *
 * Default paths (override with env vars if needed):
 *   POST /payments/create-order
 *   POST /payments/verify
 *   POST /payments/failed
 *   GET  /payments/booking/{booking_id}/status
 */

import { BACKEND_ENABLED, RAZORPAY_KEY_ID, PAYMENT_DEMO_MODE } from '../config/appConfig';
import { authorizedRequest } from './apiClient';

const CREATE_ORDER_PATH =
  process.env.REACT_APP_RAZORPAY_ORDER_PATH || '/payments/create-order';
const VERIFY_PATH =
  process.env.REACT_APP_RAZORPAY_VERIFY_PATH || '/payments/verify';
const FAILED_PATH =
  process.env.REACT_APP_RAZORPAY_FAILED_PATH || '/payments/failed';
const BOOKING_STATUS_PATH_PREFIX =
  process.env.REACT_APP_RAZORPAY_BOOKING_STATUS_PATH_PREFIX || '/payments/booking';

const RAZORPAY_SCRIPT = 'https://checkout.razorpay.com/v1/checkout.js';

const normalizeMaybeJsonString = (value) => {
  if (typeof value !== 'string') {
    return value;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return value;
  }
  if (!(trimmed.startsWith('{') || trimmed.startsWith('['))) {
    return value;
  }
  try {
    return JSON.parse(trimmed);
  } catch {
    return value;
  }
};

const authorizedPost = async (path, payload) => {
  if (!BACKEND_ENABLED) {
    throw new Error(
      'Server is not configured. Set REACT_APP_BACKEND_BASE_URL, or set REACT_APP_PAYMENT_DEMO=true for local UI-only testing.',
    );
  }
  return authorizedRequest(path, {
    method: 'POST',
    payload,
    missingAuthMessage: 'Please log in to complete payment.',
  });
};

const authorizedGet = async (path) => {
  if (!BACKEND_ENABLED) {
    throw new Error(
      'Server is not configured. Set REACT_APP_BACKEND_BASE_URL, or set REACT_APP_PAYMENT_DEMO=true for local UI-only testing.',
    );
  }
  return authorizedRequest(path, {
    method: 'GET',
    missingAuthMessage: 'Please log in to complete payment.',
  });
};

export function loadRazorpayScript() {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Window is not available.'));
  }
  if (window.Razorpay) {
    return Promise.resolve();
  }
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${RAZORPAY_SCRIPT}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Failed to load Razorpay.')));
      return;
    }
    const script = document.createElement('script');
    script.src = RAZORPAY_SCRIPT;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Razorpay checkout.'));
    document.body.appendChild(script);
  });
}

/**
 * @param {{ user_id: number, items: Array<{ user_id: number, entity_type: string, entity_id: number }> }} body
 * @returns {Promise<{ orderId: string, amount: number, currency: string, keyId?: string }>}
 */
export async function createPackageRazorpayOrder(body) {
  const rawData = await authorizedPost(CREATE_ORDER_PATH, body);
  const data = normalizeMaybeJsonString(rawData);
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid create-order response from server.');
  }
  const orderId = data.orderId || data.id || data.razorpay_order_id;
  if (!orderId) {
    throw new Error('Create-order response is missing razorpay order id.');
  }

  const amountPaise = Number(data.amount ?? data.amount_paise ?? body?.amount);
  if (!Number.isFinite(amountPaise) || amountPaise <= 0) {
    throw new Error('Create-order response is missing amount in paise.');
  }

  return {
    orderId,
    amount: amountPaise,
    currency: data.currency || 'INR',
    keyId: data.keyId || data.key_id,
    bookingIds: Array.isArray(data.booking_ids)
      ? data.booking_ids
      : (data.booking_id ? [data.booking_id] : []),
  };
}

/**
 * @param {{ razorpay_order_id: string, razorpay_payment_id: string, razorpay_signature: string }} body
 * @returns {Promise<{ verified: boolean, bookingId?: string, paymentId?: string }>}
 */
export async function verifyPackageRazorpayPayment(body) {
  if (PAYMENT_DEMO_MODE && !BACKEND_ENABLED) {
    return {
      verified: true,
      bookingId: `DEMO-${Date.now().toString(36).toUpperCase()}`,
      paymentId: 'pay_demo',
      bookingIds: [],
      raw: null,
    };
  }
  const rawData = await authorizedPost(VERIFY_PATH, body);
  const data = normalizeMaybeJsonString(rawData);
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid verify response from server.');
  }
  const bookingIds = Array.isArray(data?.booking_ids)
    ? data.booking_ids
    : (data?.booking_id ? [data.booking_id] : []);
  return {
    ...data,
    verified: (data?.verified ?? data?.success ?? true) !== false,
    bookingId: data?.bookingId || data?.booking_id || bookingIds[0],
    paymentId: data?.paymentId || data?.payment_id || data?.razorpay_payment_id,
    bookingIds,
    raw: data,
  };
}

export async function markPackagePaymentFailed(body) {
  return authorizedPost(FAILED_PATH, body);
}

export async function getPackageBookingStatus(bookingId) {
  const safeId = encodeURIComponent(String(bookingId || '').trim());
  if (!safeId) {
    throw new Error('bookingId is required for status check.');
  }
  return authorizedGet(`${BOOKING_STATUS_PATH_PREFIX}/${safeId}/status`);
}

export function getDefaultRazorpayKeyId() {
  return RAZORPAY_KEY_ID;
}

export function isPaymentDemoMode() {
  return PAYMENT_DEMO_MODE;
}
