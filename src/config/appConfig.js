const normalizedBaseUrl = (
	process.env.REACT_APP_BACKEND_BASE_URL ||
	process.env.BACKEND_BASE_URL ||
	''
).replace(/\/+$/, '');

const normalizedSignupBearerToken =
	process.env.REACT_APP_SIGNUP_BEARER_TOKEN ||
	process.env.SIGNUP_BEARER_TOKEN ||
	'';

export const BACKEND_BASE_URL = normalizedBaseUrl;
export const BACKEND_ENABLED = Boolean(BACKEND_BASE_URL);
export const SIGNUP_BEARER_TOKEN = normalizedSignupBearerToken;

/** Publishable key only (safe in browser). Used if the create-order API does not return `keyId`. */
export const RAZORPAY_KEY_ID = (process.env.REACT_APP_RAZORPAY_KEY_ID || '').trim();

/** If true, skips Razorpay UI and server calls; confirms booking immediately (local UI testing only). */
export const PAYMENT_DEMO_MODE = process.env.REACT_APP_PAYMENT_DEMO === 'true';
