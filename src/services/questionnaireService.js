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

const toQueryString = (query = {}) => {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }

    params.append(key, String(value));
  });

  const result = params.toString();
  return result ? `?${result}` : '';
};

const authorizedGet = async (path, query) => {
  if (!BACKEND_ENABLED) {
    throw new Error(
      'Backend base URL is not configured. Set REACT_APP_BACKEND_BASE_URL in .env and restart the app.'
    );
  }

  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new Error('You are not logged in. Please login again.');
  }

  const response = await fetch(`${BACKEND_BASE_URL}${path}${toQueryString(query)}`, {
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

  return parsedBody?.data ?? parsedBody;
};

const authorizedPut = async (path, body) => {
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
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body || {}),
  });

  const parsedBody = await parseResponseBody(response);

  if (!response.ok) {
    throw new Error(getErrorMessage(parsedBody));
  }

  return parsedBody?.data ?? parsedBody;
};

const toTimestamp = (value) => {
  if (!value) {
    return 0;
  }

  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
};

const normalizeAssessmentStatus = (status) => String(status || '').trim().toLowerCase();
const normalizeCategoryStatus = (status) => String(status || '').trim().toLowerCase();

const mapCategoryToRouteId = (category) => {
  const key = String(category?.category_key || '').toLowerCase();
  const name = String(category?.display_name || '').toLowerCase();

  if (key.includes('anthropometry') || name.includes('anthropometry')) {
    return 'anthropometry';
  }

  if (key.includes('family') || name.includes('family')) {
    return 'family-history';
  }

  if (key.includes('lifestyle') || name.includes('lifestyle')) {
    return 'lifestyle-habits';
  }

  if (key.includes('nutrition') || name.includes('nutrition') || key.includes('diet') || name.includes('diet')) {
    return 'nutrition-log';
  }

  if (key.includes('vital') || name.includes('vital')) {
    return 'vitals';
  }

  return '';
};

const routeOrder = ['anthropometry', 'family-history', 'lifestyle-habits', 'nutrition-log', 'vitals'];

const sortCategories = (categories) => {
  return [...categories].sort((a, b) => {
    const aIndex = routeOrder.indexOf(a.routeId);
    const bIndex = routeOrder.indexOf(b.routeId);

    const safeA = aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex;
    const safeB = bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex;

    if (safeA !== safeB) {
      return safeA - safeB;
    }

    return Number(a.category_id || 0) - Number(b.category_id || 0);
  });
};

const pickLatestIncompleteActiveAssessment = (assessments) => {
  const activeIncomplete = assessments
    .filter((row) => {
      const status = normalizeAssessmentStatus(row?.status);
      return status === 'active' && !row?.completed_at;
    })
    .sort((a, b) => {
      const byAssigned = toTimestamp(b?.assigned_at) - toTimestamp(a?.assigned_at);
      if (byAssigned !== 0) {
        return byAssigned;
      }
      return Number(b?.assessment_instance_id || 0) - Number(a?.assessment_instance_id || 0);
    });

  return activeIncomplete[0] || null;
};

export const listMyAssessments = (page = 1, limit = 20) => authorizedGet('/assessments/me', { page, limit });

export const listMyPackageCategories = (packageId) => {
  return authorizedGet(`/assessment-packages/me/${packageId}/categories`);
};

export const listCategoryQuestions = (categoryId) => {
  return authorizedGet(`/questionnaire/categories/${categoryId}/questions`);
};

export const submitQuestionnaireResponses = (categoryId, responses = []) => {
  return authorizedPut(`/questionnaire/${categoryId}/responses`, {
    responses: Array.isArray(responses) ? responses : [],
  });
};

export const loadQuestionnaireContext = async () => {
  const assessments = await listMyAssessments(1, 50);
  const latestAssessment = pickLatestIncompleteActiveAssessment(Array.isArray(assessments) ? assessments : []);

  if (!latestAssessment || !latestAssessment.package_id) {
    throw new Error('No active incomplete assessment is assigned to this user.');
  }

  const rawCategories = await listMyPackageCategories(latestAssessment.package_id);
  const categoriesWithRoute = (Array.isArray(rawCategories) ? rawCategories : [])
    .map((category) => ({
      ...category,
      routeId: mapCategoryToRouteId(category),
      status: normalizeCategoryStatus(category?.status),
    }));

  const categories = sortCategories(categoriesWithRoute);

  const questionEntries = await Promise.all(
    categories.map(async (category) => {
      const questions = await listCategoryQuestions(category.category_id);
      return [String(category.category_id), Array.isArray(questions) ? questions : []];
    })
  );

  return {
    assessment: latestAssessment,
    categories,
    questionsByCategoryId: Object.fromEntries(questionEntries),
  };
};
