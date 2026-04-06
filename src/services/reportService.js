import { BACKEND_BASE_URL, BACKEND_ENABLED } from '../config/appConfig';
import { getAccessToken } from '../utils/authStorage';

const cacheStore = new Map();
const inFlightStore = new Map();
const LATEST_ASSESSMENT_STORAGE_KEY = 'latestAssessmentId';

let inMemoryLatestAssessmentId = null;

const readStoredLatestAssessmentId = () => {
  if (inMemoryLatestAssessmentId && Number.isFinite(inMemoryLatestAssessmentId)) {
    return inMemoryLatestAssessmentId;
  }

  if (typeof window === 'undefined') {
    return null;
  }

  const raw = window.localStorage.getItem(LATEST_ASSESSMENT_STORAGE_KEY);
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  inMemoryLatestAssessmentId = parsed;
  return parsed;
};

const writeStoredLatestAssessmentId = (assessmentId) => {
  const parsed = Number(assessmentId);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return;
  }

  inMemoryLatestAssessmentId = parsed;

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(LATEST_ASSESSMENT_STORAGE_KEY, String(parsed));
  }
};

export const clearStoredLatestAssessmentId = () => {
  inMemoryLatestAssessmentId = null;

  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(LATEST_ASSESSMENT_STORAGE_KEY);
  }
};

const parseResponseBody = async (response) => {
  const text = await response.text();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

const extractArray = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data?.items)) return payload.data.items;
  if (Array.isArray(payload?.data?.results)) return payload.data.results;
  return [];
};

const toTimestamp = (value) => {
  const timestamp = new Date(value || 0).getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
};

const extractAssessmentIdFromRow = (row) => {
  if (!row || typeof row !== 'object') return null;

  return row.assessment_id
    || row.assessment_instance_id
    || row.id
    || row.assessment?.assessment_id
    || row.assessment?.assessment_instance_id
    || row.assessment?.id
    || row.assessment?.assessment?.assessment_id
    || row.assessment?.assessment?.id
    || null;
};

const getSortedAssessmentIds = (assessments) => {
  const rows = Array.isArray(assessments) ? assessments : [];

  const sorted = [...rows].sort((a, b) => {
    const aTime = Math.max(
      toTimestamp(a?.assigned_at),
      toTimestamp(a?.assessment?.assigned_at),
      toTimestamp(a?.updated_at),
      toTimestamp(a?.assessment?.updated_at),
      toTimestamp(a?.created_at),
      toTimestamp(a?.assessment?.created_at)
    );
    const bTime = Math.max(
      toTimestamp(b?.assigned_at),
      toTimestamp(b?.assessment?.assigned_at),
      toTimestamp(b?.updated_at),
      toTimestamp(b?.assessment?.updated_at),
      toTimestamp(b?.created_at),
      toTimestamp(b?.assessment?.created_at)
    );

    if (bTime !== aTime) return bTime - aTime;

    const aId = Number(extractAssessmentIdFromRow(a) || 0);
    const bId = Number(extractAssessmentIdFromRow(b) || 0);
    return bId - aId;
  });

  return Array.from(new Set(sorted.map((row) => extractAssessmentIdFromRow(row)).filter(Boolean)));
};

const requestWithAuth = async (path) => {
  if (!BACKEND_ENABLED) {
    throw new Error('Backend base URL is not configured.');
  }

  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new Error('You are not logged in.');
  }

  const response = await fetch(`${BACKEND_BASE_URL}${path}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  const body = await parseResponseBody(response);
  if (!response.ok) {
    throw new Error(body?.message || body?.detail || 'Request failed.');
  }

  return body;
};

export const authorizedGetCached = async (path, ttlMs = 45000) => {
  const key = String(path);
  const now = Date.now();
  const cached = cacheStore.get(key);

  if (cached && cached.expiresAt > now) {
    return cached.value;
  }

  const inFlight = inFlightStore.get(key);
  if (inFlight) {
    return inFlight;
  }

  const requestPromise = requestWithAuth(path)
    .then((value) => {
      cacheStore.set(key, {
        value,
        expiresAt: Date.now() + Math.max(0, Number(ttlMs) || 0),
      });
      return value;
    })
    .finally(() => {
      inFlightStore.delete(key);
    });

  inFlightStore.set(key, requestPromise);
  return requestPromise;
};

export const getLatestAssessmentIdsCached = async (ttlMs = 45000) => {
  const response = await authorizedGetCached('/assessments/me', ttlMs);
  const ids = getSortedAssessmentIds(extractArray(response));
  if (ids.length > 0) {
    writeStoredLatestAssessmentId(ids[0]);
  }

  return ids;
};

export const fetchLatestAssessmentReport = async (buildPath, ttlMs = 45000) => {
  const tried = new Set();
  const likelyAssessmentId = readStoredLatestAssessmentId();

  if (likelyAssessmentId) {
    try {
      const response = await authorizedGetCached(buildPath(likelyAssessmentId), ttlMs);
      writeStoredLatestAssessmentId(likelyAssessmentId);
      return { assessmentId: likelyAssessmentId, response };
    } catch {
      tried.add(likelyAssessmentId);
    }
  }

  const assessmentIds = await getLatestAssessmentIdsCached(ttlMs);
  let lastError = null;

  for (const assessmentId of assessmentIds) {
    if (tried.has(assessmentId)) {
      continue;
    }

    try {
      const response = await authorizedGetCached(buildPath(assessmentId), ttlMs);
      writeStoredLatestAssessmentId(assessmentId);
      return { assessmentId, response };
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error('No report available.');
};

export const clearReportRequestCache = () => {
  cacheStore.clear();
  inFlightStore.clear();
};
