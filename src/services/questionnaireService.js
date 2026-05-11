import { authorizedRequest } from './apiClient';
import { authorizedGetCached } from './reportService';

const authorizedGet = async (path, query) => {
  const parsedBody = await authorizedRequest(path, {
    method: 'GET',
    query,
  });
  return parsedBody?.data ?? parsedBody;
};

const authorizedPut = async (path, body) => {
  const parsedBody = await authorizedRequest(path, {
    method: 'PUT',
    payload: body || {},
  });
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

const getAssessmentInstanceId = (assessment) => {
  return Number(
    assessment?.assessment_instance_id
    || assessment?.assessment_id
    || assessment?.id
    || 0
  );
};

/**
 * Prefer Metsights Pro/Basic over FitPrint — only compares rows that share the same engagement_id.
 */
const normalizePackageCode = (row) => String(row?.package_code || row?.packageCode || '').trim()
  .toUpperCase()
  .replace(/\s+/g, '_');

const getPackagePriorityTier = (row) => {
  const code = normalizePackageCode(row);

  const isFitPrint = code === 'MY_FITNESS_PRINT'
    || code.includes('FITPRINT')
    || code.includes('FITNESS_PRINT');

  if (code.includes('METSIGHTS') && code.includes('PRO')) {
    return 3;
  }

  if (code === 'METSIGHTS_BASIC' || (code.includes('METSIGHTS') && code.includes('BASIC'))) {
    return 2;
  }

  if (isFitPrint) {
    return 0;
  }

  return 1;
};

const groupAssessmentsByEngagementId = (rows = []) => {
  const buckets = new Map();

  rows.forEach((row) => {
    const engagementId = Number(row?.engagement_id || row?.engagementId || 0);
    const instanceId = getAssessmentInstanceId(row);
    const key = engagementId > 0 ? String(engagementId) : `single_${instanceId}`;
    if (!buckets.has(key)) {
      buckets.set(key, []);
    }
    buckets.get(key).push(row);
  });

  return buckets;
};

const pickPreferredAssessmentInEngagementGroup = (group = []) => {
  if (group.length <= 1) {
    return group[0] || null;
  }

  return [...group].sort((a, b) => {
    const tierDiff = getPackagePriorityTier(b) - getPackagePriorityTier(a);
    if (tierDiff !== 0) {
      return tierDiff;
    }

    const byAssigned = toTimestamp(b?.assigned_at) - toTimestamp(a?.assigned_at);
    if (byAssigned !== 0) {
      return byAssigned;
    }

    return getAssessmentInstanceId(b) - getAssessmentInstanceId(a);
  })[0];
};

const isActiveIncompleteAssessment = (assessment) => {
  const status = normalizeAssessmentStatus(assessment?.status);
  const normalizedCompletedAt = assessment?.completed_at || assessment?.completedAt || null;
  const isCompleteFlag = Boolean(assessment?.is_completed ?? assessment?.isComplete ?? false);

  const activeStatuses = new Set(['active', 'in_progress', 'in-progress', 'assigned', 'pending']);
  return activeStatuses.has(status) && !normalizedCompletedAt && !isCompleteFlag;
};

const extractCategoriesFromAssessmentStatus = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (!payload || typeof payload !== 'object') {
    return [];
  }

  if (Array.isArray(payload.categories)) {
    return payload.categories;
  }

  if (Array.isArray(payload.category_statuses)) {
    return payload.category_statuses;
  }

  if (Array.isArray(payload.assessment_categories)) {
    return payload.assessment_categories;
  }

  if (Array.isArray(payload.data?.categories)) {
    return payload.data.categories;
  }

  return [];
};

const extractQuestionsFromCategoryPayload = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (!payload || typeof payload !== 'object') {
    return [];
  }

  if (Array.isArray(payload.questions)) {
    return payload.questions;
  }

  if (Array.isArray(payload.questionnaire)) {
    return payload.questionnaire;
  }

  if (Array.isArray(payload.items)) {
    return payload.items;
  }

  if (Array.isArray(payload.data?.questions)) {
    return payload.data.questions;
  }

  if (Array.isArray(payload.category?.questions)) {
    return payload.category.questions;
  }

  return [];
};

const isNil = (value) => value === null || value === undefined;

const isBlankString = (value) => typeof value === 'string' && value.trim() === '';

export const isEmptyAnswer = (value) => {
  if (isNil(value)) {
    return true;
  }

  if (Array.isArray(value)) {
    return value.length === 0;
  }

  if (isBlankString(value)) {
    return true;
  }

  return false;
};

const normalizeScaleAnswer = (value) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return value;
  }

  if (!Object.prototype.hasOwnProperty.call(value, 'value')) {
    return value;
  }

  const numericValue = Number(value.value);
  if (!Number.isFinite(numericValue)) {
    return null;
  }

  const normalizedUnit = String(value.unit ?? '').trim();
  if (!normalizedUnit) {
    return null;
  }

  return {
    value: numericValue,
    unit: normalizedUnit,
  };
};

const normalizeOutgoingAnswer = (answer) => {
  if (answer == null) {
    return answer;
  }

  if (Array.isArray(answer)) {
    return answer
      .map((item) => String(item ?? '').trim())
      .filter((item) => item !== '');
  }

  if (typeof answer === 'object') {
    return normalizeScaleAnswer(answer);
  }

  if (typeof answer === 'boolean') {
    return answer ? 'true' : 'false';
  }

  if (typeof answer === 'number') {
    return Number.isFinite(answer) ? String(answer) : null;
  }

  return answer;
};

const normalizeCategoryResponseItem = (item) => {
  if (!item || typeof item !== 'object') {
    return null;
  }

  const questionId = Number(item.question_id || item.questionId || item.id || 0);
  if (questionId <= 0) {
    return null;
  }

  const answer = item.answer
    ?? item.response
    ?? item.value
    ?? item.selected_option
    ?? item.selected_options
    ?? item.answers;

  const normalizedAnswer = normalizeOutgoingAnswer(answer);

  if (isEmptyAnswer(normalizedAnswer)) {
    return null;
  }

  return {
    question_id: questionId,
    answer: normalizedAnswer,
  };
};

const extractResponseCandidates = (payload) => {
  if (!payload || typeof payload !== 'object') {
    return [];
  }

  const candidates = [
    payload.responses,
    payload.answers,
    payload.user_responses,
    payload.user_answers,
    payload.question_responses,
    payload.data?.responses,
    payload.data?.answers,
    payload.data?.user_responses,
    payload.questionnaire_responses,
  ];

  return candidates.filter(Array.isArray);
};

const extractResponsesFromQuestions = (questions = []) => {
  if (!Array.isArray(questions)) {
    return [];
  }

  return questions
    .map((question) => {
      const questionId = Number(question?.question_id || question?.id || 0);
      if (questionId <= 0) {
        return null;
      }

      const answer = question?.answer
        ?? question?.response
        ?? question?.value
        ?? question?.selected_option
        ?? question?.selected_options
        ?? question?.user_answer
        ?? question?.user_response;

      if (isEmptyAnswer(answer)) {
        return null;
      }

      return {
        question_id: questionId,
        answer,
      };
    })
    .filter(Boolean);
};

const extractResponsesFromCategoryPayload = (payload, questions = []) => {
  const responsesFromPayload = extractResponseCandidates(payload)
    .flatMap((responseArray) => responseArray.map(normalizeCategoryResponseItem).filter(Boolean));

  const responsesFromQuestions = extractResponsesFromQuestions(questions);
  const mergedByQuestionId = new Map();

  for (const response of [...responsesFromPayload, ...responsesFromQuestions]) {
    mergedByQuestionId.set(response.question_id, response);
  }

  return Array.from(mergedByQuestionId.values());
};

export const mapCategoryToRouteId = (category) => {
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
    .filter((row) => isActiveIncompleteAssessment(row));

  if (activeIncomplete.length === 0) {
    return null;
  }

  if (activeIncomplete.length === 1) {
    return activeIncomplete[0];
  }

  const engagementBuckets = groupAssessmentsByEngagementId(activeIncomplete);
  const representatives = Array.from(engagementBuckets.values())
    .map((group) => pickPreferredAssessmentInEngagementGroup(group))
    .filter(Boolean);

  const sortedRepresentatives = representatives.sort((a, b) => {
    const byAssigned = toTimestamp(b?.assigned_at) - toTimestamp(a?.assigned_at);
    if (byAssigned !== 0) {
      return byAssigned;
    }
    return getAssessmentInstanceId(b) - getAssessmentInstanceId(a);
  });

  return sortedRepresentatives[0] || null;
};

/**
 * When all rows are complete, `pickLatestIncompleteActiveAssessment` is null but drafts/responses
 * still live on the latest assignment — use that row for category draft checks (matches in-app questionnaire).
 */
const pickLatestAssessmentRowByAssignment = (assessments) => {
  const rows = Array.isArray(assessments) ? assessments : [];
  const sorted = [...rows]
    .map((item) => ({
      ...item,
      assessmentInstanceId: getAssessmentInstanceId(item),
      assignedAtTs: toTimestamp(item?.assigned_at || item?.assignedAt),
    }))
    .filter((item) => item.assessmentInstanceId > 0)
    .sort((a, b) => {
      if (b.assignedAtTs !== a.assignedAtTs) {
        return b.assignedAtTs - a.assignedAtTs;
      }
      return b.assessmentInstanceId - a.assessmentInstanceId;
    });
  return sorted[0] || null;
};

const pickAssessmentRowForCategoryDraftCheck = (assessments) => (
  pickLatestIncompleteActiveAssessment(assessments) || pickLatestAssessmentRowByAssignment(assessments)
);

const extractAssessmentsFromListPayload = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (!payload || typeof payload !== 'object') {
    return [];
  }

  if (Array.isArray(payload.items)) {
    return payload.items;
  }

  if (Array.isArray(payload.results)) {
    return payload.results;
  }

  if (Array.isArray(payload.rows)) {
    return payload.rows;
  }

  if (Array.isArray(payload.data?.items)) {
    return payload.data.items;
  }

  if (Array.isArray(payload.data?.results)) {
    return payload.data.results;
  }

  return [];
};

export const listMyAssessments = async (page = 1, limit = 50) => {
  const raw = await authorizedGetCached('/assessments/me', 45000, { page, limit });
  return raw?.data ?? raw;
};

export const getAssessmentStatus = (assessmentInstanceId) => {
  return authorizedGet(`/assessments/${assessmentInstanceId}/status`);
};

export const getCategoryQuestionnaire = (assessmentInstanceId, categoryId) => {
  return authorizedGet(`/questionnaire/${assessmentInstanceId}/category/${categoryId}`);
};

const FH_FAMILY_DRAFT_CACHE_TTL_MS = 90_000;
let fhFamilyDraftCache = { expiresAt: 0, value: null };
let fhFamilyDraftInFlight = null;

/** Synchronous read; `null` means cache miss or expired (caller should await network). */
export const peekFamilyHistoryQuestionnaireDraftCache = () => {
  if (Date.now() < fhFamilyDraftCache.expiresAt) {
    return fhFamilyDraftCache.value;
  }
  return null;
};

/** Call after a successful family-history save so home can resolve without waiting on the network. */
export const markFamilyHistoryQuestionnaireDraftKnown = (hasDraft) => {
  fhFamilyDraftCache = {
    expiresAt: Date.now() + FH_FAMILY_DRAFT_CACHE_TTL_MS,
    value: Boolean(hasDraft),
  };
};

export const invalidateFamilyHistoryQuestionnaireDraftCache = () => {
  fhFamilyDraftCache = { expiresAt: 0, value: null };
  fhFamilyDraftInFlight = null;
};

async function fetchHasFamilyHistoryQuestionnaireDraftUncached() {
  const assessmentsPayload = await listMyAssessments(1, 50);
  const assessments = extractAssessmentsFromListPayload(assessmentsPayload);
  const latestAssessment = pickAssessmentRowForCategoryDraftCheck(assessments);

  const assessmentInstanceId = getAssessmentInstanceId(latestAssessment || {});
  if (assessmentInstanceId <= 0) {
    return false;
  }

  const statusPayload = await getAssessmentStatus(assessmentInstanceId);
  const rawCategories = extractCategoriesFromAssessmentStatus(statusPayload);
  const familyCategory = rawCategories
    .map((category) => ({
      ...category,
      category_id: Number(category?.category_id || category?.id || 0),
      category_key: category?.category_key || category?.key || '',
      display_name: category?.display_name || category?.name || category?.category_name || '',
      assessment_instance_id: Number(
        category?.assessment_instance_id || category?.assessment_id || assessmentInstanceId,
      ),
    }))
    .find((category) => Number(category?.category_id || 0) > 0 && mapCategoryToRouteId(category) === 'family-history');

  if (!familyCategory) {
    return false;
  }

  const categoryAssessmentInstanceId = Number(
    familyCategory.assessment_instance_id || assessmentInstanceId,
  );
  const categoryId = Number(familyCategory.category_id || 0);
  if (categoryAssessmentInstanceId <= 0 || categoryId <= 0) {
    return false;
  }

  const questionnairePayload = await getCategoryQuestionnaire(
    categoryAssessmentInstanceId,
    categoryId,
  );
  const questions = extractQuestionsFromCategoryPayload(questionnairePayload);
  const responses = extractResponsesFromCategoryPayload(questionnairePayload, questions);
  return responses.length > 0;
}

/**
 * True when the latest (by assignment time) assessment has at least one saved
 * family-history questionnaire response (draft or otherwise). Used for B2B home
 * “questionnaire submitted” UX — does not use per-category completion status.
 * Results are cached briefly and in-flight calls are deduped to speed repeat navigation (e.g. home).
 * @param {{ forceRefresh?: boolean }} [options]
 */
export const hasFamilyHistoryQuestionnaireDraft = async (options = {}) => {
  const { forceRefresh = false } = options;

  if (!forceRefresh && Date.now() < fhFamilyDraftCache.expiresAt) {
    return fhFamilyDraftCache.value;
  }

  if (!forceRefresh && fhFamilyDraftInFlight) {
    return fhFamilyDraftInFlight;
  }

  const promise = fetchHasFamilyHistoryQuestionnaireDraftUncached()
    .then((result) => {
      fhFamilyDraftCache = {
        expiresAt: Date.now() + FH_FAMILY_DRAFT_CACHE_TTL_MS,
        value: result,
      };
      return result;
    })
    .finally(() => {
      fhFamilyDraftInFlight = null;
    });

  if (!forceRefresh) {
    fhFamilyDraftInFlight = promise;
  }

  return promise;
};

const NUTRITION_DRAFT_CACHE_TTL_MS = 90_000;
let nutritionDraftCache = { expiresAt: 0, value: null };
let nutritionDraftInFlight = null;

export const peekNutritionLogQuestionnaireDraftCache = () => {
  if (Date.now() < nutritionDraftCache.expiresAt) {
    return nutritionDraftCache.value;
  }
  return null;
};

export const markNutritionLogQuestionnaireDraftKnown = (hasDraft) => {
  nutritionDraftCache = {
    expiresAt: Date.now() + NUTRITION_DRAFT_CACHE_TTL_MS,
    value: Boolean(hasDraft),
  };
};

export const invalidateNutritionLogQuestionnaireDraftCache = () => {
  nutritionDraftCache = { expiresAt: 0, value: null };
  nutritionDraftInFlight = null;
};

async function fetchHasNutritionLogQuestionnaireDraftUncached() {
  const assessmentsPayload = await listMyAssessments(1, 50);
  const assessments = extractAssessmentsFromListPayload(assessmentsPayload);
  const latestAssessment = pickAssessmentRowForCategoryDraftCheck(assessments);

  const assessmentInstanceId = getAssessmentInstanceId(latestAssessment || {});
  if (assessmentInstanceId <= 0) {
    return false;
  }

  const statusPayload = await getAssessmentStatus(assessmentInstanceId);
  const rawCategories = extractCategoriesFromAssessmentStatus(statusPayload);
  const nutritionCategory = rawCategories
    .map((category) => ({
      ...category,
      category_id: Number(category?.category_id || category?.id || 0),
      category_key: category?.category_key || category?.key || '',
      display_name: category?.display_name || category?.name || category?.category_name || '',
      assessment_instance_id: Number(
        category?.assessment_instance_id || category?.assessment_id || assessmentInstanceId,
      ),
    }))
    .find((category) => Number(category?.category_id || 0) > 0 && mapCategoryToRouteId(category) === 'nutrition-log');

  if (!nutritionCategory) {
    return false;
  }

  const categoryAssessmentInstanceId = Number(
    nutritionCategory.assessment_instance_id || assessmentInstanceId,
  );
  const categoryId = Number(nutritionCategory.category_id || 0);
  if (categoryAssessmentInstanceId <= 0 || categoryId <= 0) {
    return false;
  }

  const questionnairePayload = await getCategoryQuestionnaire(
    categoryAssessmentInstanceId,
    categoryId,
  );
  const questions = extractQuestionsFromCategoryPayload(questionnairePayload);
  const responses = extractResponsesFromCategoryPayload(questionnairePayload, questions);
  return responses.length > 0;
}

/**
 * True when the latest assessment has at least one saved nutrition-log response.
 * Used for B2B home “questionnaire progress” UX (same pattern as family-history draft check).
 */
export const hasNutritionLogQuestionnaireDraft = async (options = {}) => {
  const { forceRefresh = false } = options;

  if (!forceRefresh && Date.now() < nutritionDraftCache.expiresAt) {
    return nutritionDraftCache.value;
  }

  if (!forceRefresh && nutritionDraftInFlight) {
    return nutritionDraftInFlight;
  }

  const promise = fetchHasNutritionLogQuestionnaireDraftUncached()
    .then((result) => {
      nutritionDraftCache = {
        expiresAt: Date.now() + NUTRITION_DRAFT_CACHE_TTL_MS,
        value: result,
      };
      return result;
    })
    .finally(() => {
      nutritionDraftInFlight = null;
    });

  if (!forceRefresh) {
    nutritionDraftInFlight = promise;
  }

  return promise;
};

export const submitQuestionnaireResponses = (assessmentInstanceId, categoryId, responses = []) => {
  const normalizedResponses = Array.isArray(responses)
    ? responses.map(normalizeCategoryResponseItem).filter(Boolean)
    : [];

  if (normalizedResponses.length === 0) {
    return Promise.resolve(null);
  }

  return authorizedPut(`/questionnaire/${assessmentInstanceId}/category/${categoryId}/responses`, {
    responses: normalizedResponses,
  });
};

/** True when the GET questionnaire payload shows no answer for this question (draft catch-up). */
export const isQuestionnaireQuestionUnanswered = (question) => {
  if (!question || typeof question !== 'object') {
    return false;
  }
  if (question.is_read_only) {
    return false;
  }
  if (question.is_visible === false) {
    return false;
  }

  const answer = question?.answer
    ?? question?.response
    ?? question?.value
    ?? question?.selected_option
    ?? question?.selected_options
    ?? question?.user_answer
    ?? question?.user_response;

  return isEmptyAnswer(answer);
};

export const loadQuestionnaireContext = async () => {
  const assessmentsPayload = await listMyAssessments(1, 50);
  const assessments = extractAssessmentsFromListPayload(assessmentsPayload);
  const latestAssessment = pickLatestIncompleteActiveAssessment(assessments);

  const assessmentInstanceId = getAssessmentInstanceId(latestAssessment);

  if (!latestAssessment || assessmentInstanceId <= 0) {
    throw new Error('No active incomplete assessment is assigned to this user.');
  }

  const statusPayload = await getAssessmentStatus(assessmentInstanceId);
  const rawCategories = extractCategoriesFromAssessmentStatus(statusPayload);
  const categoriesWithRoute = rawCategories
    .map((category) => {
      const normalizedCategory = {
        ...category,
        category_id: Number(category?.category_id || category?.id || 0),
        category_key: category?.category_key || category?.key || '',
        display_name: category?.display_name || category?.name || category?.category_name || '',
        assessment_instance_id: Number(category?.assessment_instance_id || category?.assessment_id || assessmentInstanceId),
      };

      return {
        ...normalizedCategory,
        routeId: mapCategoryToRouteId(normalizedCategory),
        status: normalizeCategoryStatus(category?.status || category?.category_status),
      };
    })
    .filter((category) => Number(category?.category_id || 0) > 0);

  const categories = sortCategories(categoriesWithRoute);

  const questionEntries = await Promise.all(
    categories.map(async (category) => {
      const categoryAssessmentInstanceId = Number(category?.assessment_instance_id || assessmentInstanceId);
      const questionnairePayload = await getCategoryQuestionnaire(categoryAssessmentInstanceId, category.category_id);
      const questions = extractQuestionsFromCategoryPayload(questionnairePayload);
      const responses = extractResponsesFromCategoryPayload(questionnairePayload, questions);
      return [String(category.category_id), { questions, responses }];
    })
  );

  const questionsByCategoryId = {};
  const responsesByCategoryId = {};

  for (const [categoryId, entry] of questionEntries) {
    questionsByCategoryId[categoryId] = entry.questions;
    responsesByCategoryId[categoryId] = entry.responses;
  }

  return {
    assessments,
    assessment: latestAssessment,
    categories,
    questionsByCategoryId,
    responsesByCategoryId,
  };
};

/**
 * Same as {@link loadQuestionnaireContext} but for a specific assessment instance (e.g. completed Basic/Pro
 * when filling gaps before FitPrint).
 */
export const loadQuestionnaireContextForAssessmentInstance = async (assessmentInstanceId) => {
  const id = Number(assessmentInstanceId);
  if (!Number.isFinite(id) || id <= 0) {
    throw new Error('Invalid assessment instance id.');
  }

  const assessmentsPayload = await listMyAssessments(1, 50);
  const assessments = extractAssessmentsFromListPayload(assessmentsPayload);
  const assessment = assessments.find((row) => getAssessmentInstanceId(row) === id) || {
    assessment_instance_id: id,
    assessment_id: id,
    id,
  };

  const statusPayload = await getAssessmentStatus(id);
  const rawCategories = extractCategoriesFromAssessmentStatus(statusPayload);
  const categoriesWithRoute = rawCategories
    .map((category) => {
      const normalizedCategory = {
        ...category,
        category_id: Number(category?.category_id || category?.id || 0),
        category_key: category?.category_key || category?.key || '',
        display_name: category?.display_name || category?.name || category?.category_name || '',
        assessment_instance_id: Number(category?.assessment_instance_id || category?.assessment_id || id),
      };

      return {
        ...normalizedCategory,
        routeId: mapCategoryToRouteId(normalizedCategory),
        status: normalizeCategoryStatus(category?.status || category?.category_status),
      };
    })
    .filter((category) => Number(category?.category_id || 0) > 0);

  const categories = sortCategories(categoriesWithRoute);

  const questionEntries = await Promise.all(
    categories.map(async (category) => {
      const categoryAssessmentInstanceId = Number(category?.assessment_instance_id || id);
      const questionnairePayload = await getCategoryQuestionnaire(categoryAssessmentInstanceId, category.category_id);
      const questions = extractQuestionsFromCategoryPayload(questionnairePayload);
      const responses = extractResponsesFromCategoryPayload(questionnairePayload, questions);
      return [String(category.category_id), { questions, responses }];
    })
  );

  const questionsByCategoryId = {};
  const responsesByCategoryId = {};

  for (const [categoryId, entry] of questionEntries) {
    questionsByCategoryId[categoryId] = entry.questions;
    responsesByCategoryId[categoryId] = entry.responses;
  }

  return {
    assessments,
    assessment,
    categories,
    questionsByCategoryId,
    responsesByCategoryId,
  };
};

/** Session flag: FitPrint-gap questionnaire was submitted; home shows “reports preparing” until HSI unlocks. */
export const FITPRINT_GAP_QUESTIONNAIRE_SUBMITTED_SESSION_KEY = 'ss_fitprint_gap_questionnaire_submitted';

export function markFitprintGapQuestionnaireSubmitted() {
  try {
    sessionStorage.setItem(FITPRINT_GAP_QUESTIONNAIRE_SUBMITTED_SESSION_KEY, '1');
  } catch {
    // private mode / disabled storage
  }
}

export function clearFitprintGapQuestionnaireSubmittedFlag() {
  try {
    sessionStorage.removeItem(FITPRINT_GAP_QUESTIONNAIRE_SUBMITTED_SESSION_KEY);
  } catch {
    // ignore
  }
}

export function isFitprintGapQuestionnaireSubmittedFlagSet() {
  try {
    return sessionStorage.getItem(FITPRINT_GAP_QUESTIONNAIRE_SUBMITTED_SESSION_KEY) === '1';
  } catch {
    return false;
  }
}
