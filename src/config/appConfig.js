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
