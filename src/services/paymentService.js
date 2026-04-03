/**
 * Razorpay package payments — browser uses Checkout.js; never put Key Secret in the frontend.
 *
 * Backend (required for production):
 * 1) POST create-order — uses Razorpay secret to create an Order; returns { orderId, amount, currency, keyId? }.
 * 2) POST verify — verifies razorpay_signature with secret; on success marks booking paid and returns { bookingId, paymentId }.
 * 3) Webhook `payment.captured` on your server — source of truth for settlement; notify admin / update DB.
 *
 * Default paths (override with REACT_APP_RAZORPAY_ORDER_PATH / REACT_APP_RAZORPAY_VERIFY_PATH):
 *   POST /payments/razorpay/create-package-order
 *   POST /payments/razorpay/verify-package-payment
 */

import { BACKEND_BASE_URL, BACKEND_ENABLED, RAZORPAY_KEY_ID, PAYMENT_DEMO_MODE } from '../config/appConfig';
import { getAccessToken } from '../utils/authStorage';

const CREATE_ORDER_PATH =
  process.env.REACT_APP_RAZORPAY_ORDER_PATH || '/payments/razorpay/create-package-order';
const VERIFY_PATH =
  process.env.REACT_APP_RAZORPAY_VERIFY_PATH || '/payments/razorpay/verify-package-payment';

const RAZORPAY_SCRIPT = 'https://checkout.razorpay.com/v1/checkout.js';

const parseResponseBody = async (response) => {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

const getErrorMessage = (parsedBody) => {
  if (!parsedBody) return 'Request failed. Please try again.';
  if (typeof parsedBody === 'string') return parsedBody;
  if (typeof parsedBody.message === 'string') return parsedBody.message;
  if (typeof parsedBody.detail === 'string') return parsedBody.detail;
  return 'Request failed. Please try again.';
};

const authorizedPost = async (path, payload) => {
  if (!BACKEND_ENABLED) {
    throw new Error(
      'Server is not configured. Set REACT_APP_BACKEND_BASE_URL, or set REACT_APP_PAYMENT_DEMO=true for local UI-only testing.',
    );
  }
  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new Error('Please log in to complete payment.');
  }
  const response = await fetch(`${BACKEND_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  const parsed = await parseResponseBody(response);
  if (!response.ok) {
    throw new Error(getErrorMessage(parsed));
  }
  return parsed;
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
 * @param {{ amount: number, currency?: string, receipt?: string, notes?: object, bookingDraft?: object }} body
 * amount = subtotal in paise (integer)
 * @returns {Promise<{ orderId: string, amount: number, currency: string, keyId?: string }>}
 */
export async function createPackageRazorpayOrder(body) {
  const data = await authorizedPost(CREATE_ORDER_PATH, body);
  const orderId = data.orderId || data.id;
  if (!orderId) {
    throw new Error('Invalid order response from server.');
  }
  return {
    orderId,
    amount: data.amount ?? body.amount,
    currency: data.currency || 'INR',
    keyId: data.keyId || data.key_id,
  };
}

/**
 * @param {{ razorpay_order_id: string, razorpay_payment_id: string, razorpay_signature: string, bookingDraft?: object }} body
 * @returns {Promise<{ verified: boolean, bookingId?: string, paymentId?: string }>}
 */
export async function verifyPackageRazorpayPayment(body) {
  if (PAYMENT_DEMO_MODE && !BACKEND_ENABLED) {
    return {
      verified: true,
      bookingId: `DEMO-${Date.now().toString(36).toUpperCase()}`,
      paymentId: 'pay_demo',
    };
  }
  return authorizedPost(VERIFY_PATH, body);
}

export function getDefaultRazorpayKeyId() {
  return RAZORPAY_KEY_ID;
}

export function isPaymentDemoMode() {
  return PAYMENT_DEMO_MODE;
}
