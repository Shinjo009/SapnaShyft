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

/**
 * If true, homepage API-driven widgets use local dummy report payloads instead of backend data.
 * Default is enabled for demo flows; set REACT_APP_HOMEPAGE_DEMO=false to opt out.
 */
export const HOMEPAGE_DEMO_MODE = process.env.REACT_APP_HOMEPAGE_DEMO !== 'false';

/**
 * If true, disease risk analysis wheel/detail screens use local dummy payloads instead of backend data.
 * Default is enabled for demo flows; set REACT_APP_RISK_ANALYSIS_DEMO=false to opt out.
 */
export const RISK_ANALYSIS_DEMO_MODE = process.env.REACT_APP_RISK_ANALYSIS_DEMO !== 'false';

/**
 * If true, questionnaire categories/questions are sourced from local demo payloads.
 * Default is enabled for demo flows; set REACT_APP_QUESTIONNAIRE_DEMO=false to opt out.
 */
export const QUESTIONNAIRE_DEMO_MODE = process.env.REACT_APP_QUESTIONNAIRE_DEMO !== 'false';

/** Google Analytics 4 Measurement ID (e.g. G-XXXXXXXXXX). Leave unset to disable analytics. */
export const GA_MEASUREMENT_ID = (process.env.REACT_APP_GA_MEASUREMENT_ID || '').trim();
