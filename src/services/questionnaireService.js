import { authorizedRequest } from './apiClient';

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

const authorizedPost = async (path, body) => {
  const parsedBody = await authorizedRequest(path, {
    method: 'POST',
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

const isEmptyAnswer = (value) => {
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

  if (isEmptyAnswer(answer)) {
    return null;
  }

  return {
    question_id: questionId,
    answer,
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
      return isActiveIncompleteAssessment(row);
    })
    .sort((a, b) => {
      const byAssigned = toTimestamp(b?.assigned_at) - toTimestamp(a?.assigned_at);
      if (byAssigned !== 0) {
        return byAssigned;
      }
      return getAssessmentInstanceId(b) - getAssessmentInstanceId(a);
    });

  return activeIncomplete[0] || null;
};

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

export const listMyAssessments = (page = 1, limit = 20) => authorizedGet('/assessments/me', { page, limit });

export const getAssessmentStatus = (assessmentInstanceId) => {
  return authorizedGet(`/assessments/${assessmentInstanceId}/status`);
};

export const getCategoryQuestionnaire = (assessmentInstanceId, categoryId) => {
  return authorizedGet(`/questionnaire/${assessmentInstanceId}/category/${categoryId}`);
};

export const submitQuestionnaireResponses = (assessmentInstanceId, categoryId, responses = []) => {
  return authorizedPut(`/questionnaire/${assessmentInstanceId}/category/${categoryId}/responses`, {
    responses: Array.isArray(responses) ? responses : [],
  });
};

export const submitAssessment = (assessmentInstanceId, sourceAssessmentInstanceIds = []) => {
  return authorizedPost(`/assessments/${assessmentInstanceId}/submit`, {
    source_assessment_instance_ids: Array.isArray(sourceAssessmentInstanceIds)
      ? sourceAssessmentInstanceIds
      : [],
  });
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
