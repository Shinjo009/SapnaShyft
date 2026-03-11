const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

const pickFirstString = (values) => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value;
    }
  }

  return '';
};

export const saveAuthTokens = ({ accessToken, refreshToken }) => {
  if (accessToken) {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  }

  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
};

export const getAccessToken = () => localStorage.getItem(ACCESS_TOKEN_KEY);

export const getRefreshToken = () =>
  localStorage.getItem(REFRESH_TOKEN_KEY) || localStorage.getItem('refreshToken') || '';

export const clearAuthTokens = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

export const extractTokensFromResponse = (response, fallbackRefreshToken = '') => {
  if (typeof response === 'string') {
    return { accessToken: response, refreshToken: fallbackRefreshToken };
  }

  if (!response || typeof response !== 'object') {
    return { accessToken: '', refreshToken: fallbackRefreshToken };
  }

  const container = response.data && typeof response.data === 'object'
    ? response.data
    : response;

  const nestedTokens = container.tokens && typeof container.tokens === 'object'
    ? container.tokens
    : {};

  const accessToken = pickFirstString([
    container.access_token,
    container.accessToken,
    container.token,
    nestedTokens.access_token,
    nestedTokens.accessToken,
    nestedTokens.token,
  ]);

  const refreshToken = pickFirstString([
    container.refresh_token,
    container.refreshToken,
    container.refresh,
    nestedTokens.refresh_token,
    nestedTokens.refreshToken,
    nestedTokens.refresh,
    fallbackRefreshToken,
  ]);

  return { accessToken, refreshToken: refreshToken || fallbackRefreshToken };
};
