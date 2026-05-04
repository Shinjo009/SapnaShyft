import { authorizedRequest } from './apiClient';

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

const buildQueryString = (query) => {
  if (!query || typeof query !== 'object') {
    return '';
  }
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }
    params.append(key, String(value));
  });
  const encoded = params.toString();
  return encoded ? `?${encoded}` : '';
};

const requestWithAuth = async (path, query) => {
  return authorizedRequest(path, { method: 'GET', ...(query && Object.keys(query).length ? { query } : {}) });
};

const cacheKeyForGet = (path, query) => `${String(path)}${buildQueryString(query)}`;

export const authorizedGetCached = async (path, ttlMs = 45000, query) => {
  const key = cacheKeyForGet(path, query);
  const now = Date.now();
  const cached = cacheStore.get(key);

  if (cached && cached.expiresAt > now) {
    return cached.value;
  }

  const inFlight = inFlightStore.get(key);
  if (inFlight) {
    return inFlight;
  }

  const requestPromise = requestWithAuth(path, query)
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

const DEFAULT_ASSESSMENTS_ME_QUERY = Object.freeze({ page: 1, limit: 50 });

const fetchMyAssessmentsPageCached = async (ttlMs = 45000, query = DEFAULT_ASSESSMENTS_ME_QUERY) => {
  return authorizedGetCached('/assessments/me', ttlMs, query);
};

/** Cached GET /assessments/me rows (default page 1, limit 50). Warms the same cache as `getLatestAssessmentIdsCached`. */
export const peekMyAssessmentsRowsCached = async (ttlMs = 45000) => {
  return extractArray(await fetchMyAssessmentsPageCached(ttlMs, DEFAULT_ASSESSMENTS_ME_QUERY));
};

export const getLatestAssessmentIdsCached = async (ttlMs = 45000) => {
  const response = await fetchMyAssessmentsPageCached(ttlMs, DEFAULT_ASSESSMENTS_ME_QUERY);
  const ids = getSortedAssessmentIds(extractArray(response));
  if (ids.length > 0) {
    writeStoredLatestAssessmentId(ids[0]);
  }

  return ids;
};

export const fetchLatestAssessmentReport = async (buildPath, ttlMs = 45000) => {
  const tried = new Set();
  const likelyAssessmentId = readStoredLatestAssessmentId();

  // If we try a stored assessment id first, warm `/assessments/me` in parallel so a stale id
  // does not pay sequential latency before falling back to the sorted list.
  const assessmentsListPromise = likelyAssessmentId
    ? getLatestAssessmentIdsCached(ttlMs).catch(() => [])
    : null;

  if (likelyAssessmentId) {
    try {
      const response = await authorizedGetCached(buildPath(likelyAssessmentId), ttlMs);
      writeStoredLatestAssessmentId(likelyAssessmentId);
      return { assessmentId: likelyAssessmentId, response };
    } catch {
      tried.add(likelyAssessmentId);
    }
  }

  const assessmentIds = assessmentsListPromise != null
    ? await assessmentsListPromise
    : await getLatestAssessmentIdsCached(ttlMs);
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
