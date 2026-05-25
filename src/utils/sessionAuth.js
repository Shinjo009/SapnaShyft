/** Auth session helpers — expired/missing tokens redirect via event; details stay in console. */

export const SESSION_EXPIRED_EVENT = 'ss:session-expired';

export class SessionExpiredError extends Error {
  constructor(detail = null) {
    super('SESSION_EXPIRED');
    this.name = 'SessionExpiredError';
    this.detail = detail;
  }
}

const SESSION_AUTH_MESSAGE_PATTERNS = [
  /missing refresh token/i,
  /please login again/i,
  /session expired/i,
  /you are not logged in/i,
  /authentication failed/i,
  /auth_failed/i,
  /refresh response missing access token/i,
];

export const isSessionExpiredError = (error) =>
  error instanceof SessionExpiredError || error?.name === 'SessionExpiredError';

export const isSessionAuthMessage = (message) => {
  const text = String(message || '').trim();
  if (!text) {
    return false;
  }
  return SESSION_AUTH_MESSAGE_PATTERNS.some((pattern) => pattern.test(text));
};

export const isSessionAuthError = (error) =>
  isSessionExpiredError(error) || isSessionAuthMessage(error?.message);

export const logAuthError = (context, error, extra = null) => {
  if (extra !== null && extra !== undefined) {
    console.error(`[auth] ${context}`, error, extra);
    return;
  }
  console.error(`[auth] ${context}`, error);
};

export const dispatchSessionExpired = (detail = null) => {
  if (typeof window === 'undefined') {
    return;
  }
  window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT, { detail }));
};
