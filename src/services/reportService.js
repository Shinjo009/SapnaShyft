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

const sortAssessmentRowsLatestFirst = (rows) => {
  const list = Array.isArray(rows) ? rows : [];
  return [...list].sort((a, b) => {
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
};

const extractEngagementIdFromRow = (row) => {
  if (!row || typeof row !== 'object') return null;

  return row.engagement_id
    || row.engagement?.engagement_id
    || row.engagement?.id
    || row.assessment?.engagement_id
    || row.assessment?.engagement?.engagement_id
    || row.assessment?.engagement?.id
    || row.assessment_instance?.engagement_id
    || row.assessment_instance?.engagement?.engagement_id
    || row.assessment_instance?.engagement?.id
    || null;
};

const normalizedAssessmentFamily = (row) => {
  const text = String(
    row?.assessment_type
      || row?.type
      || row?.assessment_name
      || row?.name
      || row?.package_name
      || row?.package_code
      || row?.package_display_name
      || row?.assessment_type_code
      || row?.program_name
      || row?.assessment?.assessment_type
      || row?.assessment?.type
      || row?.assessment?.assessment_name
      || row?.assessment?.name
      || row?.assessment?.package_name
      || row?.assessment?.package_code
      || row?.assessment?.package_display_name
      || row?.assessment?.assessment_type_code
      || ''
  ).trim().toLowerCase();

  const compact = text.replace(/[\s_-]+/g, '');
  const packageCode = String(row?.package_code || row?.packageCode || row?.assessment?.package_code || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '_');

  if (
    packageCode === 'MY_FITNESS_PRINT'
    || packageCode.includes('FITPRINT')
    || packageCode.includes('FITNESS_PRINT')
    || text.includes('fitprint')
    || text.includes('fit print')
    || text.includes('fitness print')
    || compact.includes('fitprint')
    || compact.includes('fitnessprint')
    || compact.includes('myfitnessprint')
    || text === '7'
    || text.endsWith(':7')
    || compact.endsWith('7')
  ) {
    return 'fitprint';
  }

  if (
    text.includes('basic')
    || text.includes('pro')
    || text.includes('metsights_basic')
    || text.includes('metsights_pro')
    || text === '1'
    || text === '2'
    || text.endsWith(':1')
    || text.endsWith(':2')
  ) {
    return 'basic_or_pro';
  }

  return '';
};

const normalizeHealthSpanScores = (payload) => {
  const root = payload && typeof payload === 'object'
    ? (payload.data && typeof payload.data === 'object' ? payload.data : payload)
    : null;

  if (!root || typeof root !== 'object') {
    return null;
  }

  const fitness = Number(root.fitness_score);
  const nutrition = Number(root.nutrition_score);
  const lifestyle = Number(root.lifestyle_score);

  const clampScore = (value) => {
    if (!Number.isFinite(value)) {
      return null;
    }
    return Math.max(0, Math.min(100, Math.round(value)));
  };

  return {
    fitnessScore: clampScore(fitness),
    nutritionScore: clampScore(nutrition),
    lifestyleScore: clampScore(lifestyle),
  };
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

/**
 * Latest Metsights Basic/Pro assessment instance id from `/assessments/me` (newest first).
 * Excludes FitPrint and unrecognized package rows — use for lab-backed reports (e.g. Bio-AI / blood PDFs).
 */
export const getLatestMetsightsBasicOrProAssessmentIdCached = async (ttlMs = 45000) => {
  const rows = sortAssessmentRowsLatestFirst(await peekMyAssessmentsRowsCached(ttlMs));
  const latestBasicOrPro = rows.find((row) => normalizedAssessmentFamily(row) === 'basic_or_pro') || null;
  if (!latestBasicOrPro) {
    return null;
  }
  const id = Number(extractAssessmentIdFromRow(latestBasicOrPro));
  if (!Number.isFinite(id) || id <= 0) {
    return null;
  }
  return id;
};

export const getLatestAssessmentIdsCached = async (ttlMs = 45000) => {
  const response = await fetchMyAssessmentsPageCached(ttlMs, DEFAULT_ASSESSMENTS_ME_QUERY);
  return getSortedAssessmentIds(extractArray(response));
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

/**
 * Resolves latest Basic/Pro and matching FitPrint (same engagement) from /assessments/me rows.
 * Used for Health Span Index gating without calling the report endpoint.
 */
export const resolveHealthSpanIndexSourcesFromRows = (rawRows) => {
  const rows = sortAssessmentRowsLatestFirst(Array.isArray(rawRows) ? rawRows : []);

  const latestBasicOrPro = rows.find((row) => normalizedAssessmentFamily(row) === 'basic_or_pro') || null;
  if (!latestBasicOrPro) {
    return { status: 'no_basic_or_pro', rows };
  }

  const basicOrProAssessmentId = Number(extractAssessmentIdFromRow(latestBasicOrPro));
  if (!Number.isFinite(basicOrProAssessmentId) || basicOrProAssessmentId <= 0) {
    return { status: 'invalid_basic_or_pro', rows };
  }

  const basicOrProEngagementId = String(extractEngagementIdFromRow(latestBasicOrPro) || '').trim();
  if (!basicOrProEngagementId) {
    return { status: 'missing_engagement', rows, basicOrProAssessmentId };
  }

  const latestMatchingFitprint = rows.find((row) => (
    normalizedAssessmentFamily(row) === 'fitprint'
      && String(extractEngagementIdFromRow(row) || '').trim() === basicOrProEngagementId
  )) || null;

  if (!latestMatchingFitprint) {
    return { status: 'missing_fitprint', rows, basicOrProAssessmentId, engagementId: basicOrProEngagementId };
  }

  const fitprintAssessmentId = Number(extractAssessmentIdFromRow(latestMatchingFitprint));
  if (!Number.isFinite(fitprintAssessmentId) || fitprintAssessmentId <= 0) {
    return { status: 'invalid_fitprint', rows };
  }

  return {
    status: 'ready',
    rows,
    fitprintAssessmentId,
    basicOrProAssessmentId,
    engagementId: basicOrProEngagementId,
    latestMatchingFitprint,
    latestBasicOrPro,
  };
};

export const getHealthSpanIndexSourceStatus = async ({ ttlMs = 45000 } = {}) => {
  try {
    const response = await fetchMyAssessmentsPageCached(ttlMs, DEFAULT_ASSESSMENTS_ME_QUERY);
    return resolveHealthSpanIndexSourcesFromRows(extractArray(response));
  } catch {
    return { status: 'fetch_error', rows: [] };
  }
};

export const findLatestFitprintAssessmentIdFromRows = (rawRows) => {
  const rows = sortAssessmentRowsLatestFirst(Array.isArray(rawRows) ? rawRows : []);
  const latestFitprint = rows.find((row) => normalizedAssessmentFamily(row) === 'fitprint') || null;
  const id = Number(extractAssessmentIdFromRow(latestFitprint));
  return Number.isFinite(id) && id > 0 ? id : null;
};

export const fetchHealthSpanIndexForPair = async ({
  fitprintAssessmentId,
  basicOrProAssessmentId,
  includeDetails = false,
} = {}) => {
  const fitprintId = Number(fitprintAssessmentId);
  const basicProId = Number(basicOrProAssessmentId);
  if (!Number.isFinite(fitprintId) || fitprintId <= 0 || !Number.isFinite(basicProId) || basicProId <= 0) {
    throw new Error('Invalid FitPrint or Basic/Pro assessment id for Health Span Index.');
  }

  const payload = {
    source_assessment_instance_ids: [fitprintId, basicProId],
    include_details: Boolean(includeDetails),
  };

  let reportResponse;
  try {
    reportResponse = await authorizedRequest(
      `/reports/${fitprintId}/health-span-index`,
      { method: 'POST', payload },
    );
  } catch (primaryError) {
    reportResponse = await authorizedRequest(
      `/reports/${basicProId}/health-span-index`,
      { method: 'POST', payload },
    );
  }

  return {
    fitprintAssessmentId: fitprintId,
    basicOrProAssessmentId: basicProId,
    response: reportResponse,
    scores: normalizeHealthSpanScores(reportResponse),
  };
};

export const fetchLatestHealthSpanIndex = async ({
  includeDetails = false,
  ttlMs = 45000,
} = {}) => {
  const debugPrefix = '[HealthSpanIndex]';
  const response = await fetchMyAssessmentsPageCached(ttlMs, DEFAULT_ASSESSMENTS_ME_QUERY);
  const rows = sortAssessmentRowsLatestFirst(extractArray(response));
  console.log(`${debugPrefix} assessments loaded`, {
    total: rows.length,
    topRows: rows.slice(0, 5).map((row) => ({
      assessment_instance_id: extractAssessmentIdFromRow(row),
      package_code: row?.package_code || row?.assessment?.package_code || null,
      package_display_name: row?.package_display_name || row?.assessment?.package_display_name || null,
      assessment_type_code: row?.assessment_type_code || row?.assessment?.assessment_type_code || null,
      engagement_id: extractEngagementIdFromRow(row),
      family: normalizedAssessmentFamily(row),
    })),
  });

  const resolved = resolveHealthSpanIndexSourcesFromRows(rows);
  if (resolved.status === 'no_basic_or_pro') {
    console.warn(`${debugPrefix} latest Basic/Pro not found`);
    throw new Error('No Basic/Pro assessment available for Health Span Index.');
  }
  if (resolved.status === 'invalid_basic_or_pro') {
    throw new Error('Invalid Basic/Pro assessment id for Health Span Index.');
  }
  if (resolved.status === 'missing_engagement') {
    console.warn(`${debugPrefix} latest Basic/Pro missing engagement`, {
      assessment_instance_id: resolved.basicOrProAssessmentId,
    });
    throw new Error('Missing engagement id on latest Basic/Pro assessment.');
  }
  if (resolved.status === 'missing_fitprint') {
    console.warn(`${debugPrefix} matching Fitprint not found`, {
      required_engagement_id: resolved.engagementId,
      fitprintCandidates: rows
        .filter((row) => normalizedAssessmentFamily(row) === 'fitprint')
        .slice(0, 10)
        .map((row) => ({
          assessment_instance_id: extractAssessmentIdFromRow(row),
          engagement_id: extractEngagementIdFromRow(row),
          package_code: row?.package_code || null,
          package_display_name: row?.package_display_name || null,
          assessment_type_code: row?.assessment_type_code || null,
        })),
    });
    throw new Error('No Fitprint assessment found for latest Basic/Pro engagement.');
  }
  if (resolved.status === 'invalid_fitprint') {
    throw new Error('Invalid Fitprint assessment id for Health Span Index.');
  }

  const {
    fitprintAssessmentId,
    basicOrProAssessmentId,
    engagementId: basicOrProEngagementId,
    latestMatchingFitprint,
    latestBasicOrPro,
  } = resolved;

  console.log(`${debugPrefix} latest Basic/Pro selected`, {
    assessment_instance_id: basicOrProAssessmentId,
    engagement_id: basicOrProEngagementId,
    package_code: latestBasicOrPro?.package_code || null,
    package_display_name: latestBasicOrPro?.package_display_name || null,
    assessment_type_code: latestBasicOrPro?.assessment_type_code || null,
  });
  console.log(`${debugPrefix} matching Fitprint selected`, {
    assessment_instance_id: fitprintAssessmentId,
    engagement_id: basicOrProEngagementId,
    package_code: latestMatchingFitprint?.package_code || null,
    package_display_name: latestMatchingFitprint?.package_display_name || null,
    assessment_type_code: latestMatchingFitprint?.assessment_type_code || null,
  });

  console.log(`${debugPrefix} requesting report`, {
    path: `/reports/${fitprintAssessmentId}/health-span-index`,
    fitprintAssessmentId,
    basicOrProAssessmentId,
  });

  const result = await fetchHealthSpanIndexForPair({
    fitprintAssessmentId,
    basicOrProAssessmentId,
    includeDetails,
  });

  console.log(`${debugPrefix} report response`, {
    includeDetails: Boolean(includeDetails),
    scores: result.scores,
    hasFitness: Boolean(result.response?.data?.fitness),
    hasNutrition: Boolean(result.response?.data?.nutrition),
    hasLifestyle: Boolean(result.response?.data?.lifestyle),
  });

  return {
    ...result,
    engagementId: basicOrProEngagementId,
  };
};

/** Assessment instance id last used successfully for overview / report fetches. */
export const getStoredLatestReportAssessmentId = () => readStoredLatestAssessmentId();

const isActiveIncompleteAssessmentRow = (row) => {
  const status = String(row?.status || '').trim().toLowerCase();
  const completedAt = row?.completed_at || row?.completedAt || null;
  const isCompleteFlag = Boolean(row?.is_completed ?? row?.isComplete ?? false);
  if (status === 'completed' || completedAt || isCompleteFlag) {
    return false;
  }
  return status === 'active' || status === 'assigned' || status === 'pending'
    || status === 'in_progress' || status === 'in-progress';
};

export const resolveEngagementIdFromAssessmentId = (rawRows, assessmentInstanceId) => {
  const targetId = Number(assessmentInstanceId);
  if (!Number.isFinite(targetId) || targetId <= 0) {
    return '';
  }
  const row = (Array.isArray(rawRows) ? rawRows : []).find(
    (item) => Number(extractAssessmentIdFromRow(item)) === targetId,
  );
  return String(extractEngagementIdFromRow(row) || '').trim();
};

const resolvePriorReportEngagementId = (rows, latestEngagementId) => {
  const basicProRows = rows.filter((row) => normalizedAssessmentFamily(row) === 'basic_or_pro');
  const engagementOrder = [];
  basicProRows.forEach((row) => {
    const engagementId = String(extractEngagementIdFromRow(row) || '').trim();
    if (engagementId && !engagementOrder.includes(engagementId)) {
      engagementOrder.push(engagementId);
    }
  });

  if (engagementOrder.length < 2) {
    return '';
  }

  return engagementOrder.find((id) => id !== latestEngagementId) || '';
};

/**
 * User has an older report visible but a newer Basic/Pro + FitPrint cycle still needs questionnaire.
 */
export const resolveReassessmentPromptFromRows = (rawRows, {
  reportAssessmentId = null,
  reportEngagementId: explicitReportEngagementId = null,
} = {}) => {
  const rows = sortAssessmentRowsLatestFirst(Array.isArray(rawRows) ? rawRows : []);

  const latestBasicOrPro = rows.find((row) => normalizedAssessmentFamily(row) === 'basic_or_pro') || null;
  if (!latestBasicOrPro) {
    return { shouldPrompt: false };
  }

  const latestEngagementId = String(extractEngagementIdFromRow(latestBasicOrPro) || '').trim();
  const latestBasicProAssessmentId = Number(extractAssessmentIdFromRow(latestBasicOrPro));
  if (!latestEngagementId || !Number.isFinite(latestBasicProAssessmentId) || latestBasicProAssessmentId <= 0) {
    return { shouldPrompt: false };
  }

  const hasFitprintOnEngagement = rows.some((row) => (
    normalizedAssessmentFamily(row) === 'fitprint'
    && String(extractEngagementIdFromRow(row) || '').trim() === latestEngagementId
  ));

  if (!hasFitprintOnEngagement) {
    return { shouldPrompt: false };
  }

  const reportId = Number(reportAssessmentId);
  let reportEngagementId = String(explicitReportEngagementId || '').trim();

  if (!reportEngagementId && Number.isFinite(reportId) && reportId > 0) {
    reportEngagementId = resolveEngagementIdFromAssessmentId(rows, reportId);
  }

  if (!reportEngagementId) {
    reportEngagementId = resolvePriorReportEngagementId(rows, latestEngagementId);
  }

  if (!reportEngagementId) {
    return { shouldPrompt: false };
  }

  const isDifferentEngagement = reportEngagementId !== latestEngagementId;
  const isNewInstanceSameEngagement = !isDifferentEngagement
    && Number.isFinite(reportId) && reportId > 0
    && reportId !== latestBasicProAssessmentId;

  if (!isDifferentEngagement && !isNewInstanceSameEngagement) {
    return { shouldPrompt: false };
  }

  const hasOpenAssessmentOnLatestEngagement = rows.some((row) => (
    String(extractEngagementIdFromRow(row) || '').trim() === latestEngagementId
    && isActiveIncompleteAssessmentRow(row)
  ));

  return {
    shouldPrompt: true,
    latestEngagementId,
    latestBasicProAssessmentId,
    reportEngagementId,
    reportAssessmentId: Number.isFinite(reportId) && reportId > 0 ? reportId : null,
    hasOpenAssessmentOnLatestEngagement,
  };
};

export const clearReportRequestCache = () => {
  cacheStore.clear();
  inFlightStore.clear();
};
