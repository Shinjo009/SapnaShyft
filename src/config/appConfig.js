const normalizedBaseUrl = (
	process.env.REACT_APP_BACKEND_BASE_URL ||
	process.env.BACKEND_BASE_URL ||
	''
).replace(/\/+$/, '');

export const BACKEND_BASE_URL = normalizedBaseUrl;
export const BACKEND_ENABLED = Boolean(BACKEND_BASE_URL);
