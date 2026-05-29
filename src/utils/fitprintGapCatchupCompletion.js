/**
 * FitPrint gap questionnaire completion (same rules as QuestionnaireNullCatchupPage initial load).
 * Used by HomePage to show "Submitted successfully" before the user opens the catch-up flow again.
 */
import {
  buildSelectionStateFromResponses,
  findFamilyHistoryCardKeys,
  findMappedOtherTextQuestion,
  isLikelyOtherTextQuestion,
  isNoneOptionLabel,
  toFamilyApiCards,
} from '../pages/HealthAssessmentPage/HealthAssessmentPage';
import {
  isEmptyAnswer,
  loadQuestionnaireContextForAssessmentInstance,
  mapCategoryToRouteId,
} from '../services/questionnaireService';

const SWIPE_ROUTE_ORDER = ['family-history', 'lifestyle-habits', 'nutrition-log', 'vitals'];

const buildQuestionsByRoute = (categories, questionsByCategoryId) => {
  const chunks = {};
  (Array.isArray(categories) ? categories : []).forEach((cat) => {
    const route = mapCategoryToRouteId(cat);
    if (!route) {
      return;
    }
    const cid = Number(cat.category_id || 0);
    if (cid <= 0) {
      return;
    }
    const list = questionsByCategoryId[String(cid)] || [];
    const tagged = list.map((q) => ({
      ...q,
      __catchupCategoryId: cid,
    }));
    if (!chunks[route]) {
      chunks[route] = [];
    }
    chunks[route].push(...tagged);
  });
  const out = {};
  Object.keys(chunks).forEach((route) => {
    const byId = new Map();
    (chunks[route] || []).forEach((q) => {
      const id = Number(q?.question_id || q?.id || 0);
      if (id > 0 && !byId.has(id)) {
        byId.set(id, q);
      }
    });
    out[route] = Array.from(byId.values());
  });
  return out;
};

const hasCategoriesForRoute = (categories, routeId) => (
  (Array.isArray(categories) ? categories : []).some((c) => mapCategoryToRouteId(c) === routeId)
);

const mergeResponsesForRoute = (categories, responsesByCategoryId, routeId) => {
  const byQid = new Map();
  (Array.isArray(categories) ? categories : []).forEach((cat) => {
    if (mapCategoryToRouteId(cat) !== routeId) {
      return;
    }
    const cid = String(cat.category_id || '');
    const rows = responsesByCategoryId[cid] || [];
    rows.forEach((row) => {
      const id = Number(row?.question_id || row?.questionId || 0);
      if (id > 0 && !byQid.has(id)) {
        byQid.set(id, row);
      }
    });
  });
  return Array.from(byQid.values());
};

const normalizeAnswerCandidate = (raw) => {
  if (raw == null) {
    return null;
  }
  if (typeof raw === 'string') {
    const t = raw.trim();
    if (t === '' || t === '[]' || t === '{}' || t.toLowerCase() === 'null') {
      return null;
    }
    if (t.startsWith('[') || (t.startsWith('{') && t.endsWith('}'))) {
      try {
        return JSON.parse(t);
      } catch {
        return raw;
      }
    }
  }
  return raw;
};

const getAnswerForQuestion = (question, rawResponses = []) => {
  const inline = question?.answer
    ?? question?.response
    ?? question?.value
    ?? question?.selected_option
    ?? question?.selected_options
    ?? question?.user_answer
    ?? question?.user_response
    ?? question?.answers;
  const nInline = normalizeAnswerCandidate(inline);
  if (!isEmptyAnswer(nInline)) {
    return nInline;
  }
  const qid = Number(question?.question_id || question?.id || 0);
  if (qid <= 0) {
    return null;
  }
  const row = rawResponses.find((r) => Number(r?.question_id || r?.questionId || 0) === qid);
  const ans = row?.answer
    ?? row?.response
    ?? row?.value
    ?? row?.selected_option
    ?? row?.selected_options
    ?? row?.answers;
  return normalizeAnswerCandidate(ans);
};

/** Scale answers must include value + unit for Metsights fitness-parameters / physical-measurement. */
export const isMetsightsScaleAnswerComplete = (answer) => {
  if (answer == null || typeof answer !== 'object' || Array.isArray(answer)) {
    return false;
  }
  const rawValue = answer.value ?? answer.numeric ?? answer.amount;
  if (rawValue == null || rawValue === '') {
    return false;
  }
  const unit = answer.unit ?? answer.unit_code ?? answer.unitCode;
  return unit != null && String(unit).trim() !== '';
};

const questionIsUnfilled = (question, rawResponses) => {
  if (!question || typeof question !== 'object') {
    return false;
  }
  if (question.is_read_only || question.is_visible === false) {
    return false;
  }
  return isEmptyAnswer(getAnswerForQuestion(question, rawResponses));
};

/** Stricter than `questionIsUnfilled` — catches draft scale values missing a unit. */
export const questionBlocksMetsightsSubmit = (question, rawResponses) => {
  if (!question || typeof question !== 'object') {
    return false;
  }
  if (question.is_read_only || question.is_visible === false) {
    return false;
  }

  const answer = getAnswerForQuestion(question, rawResponses);
  if (isEmptyAnswer(answer)) {
    return true;
  }

  const qtype = String(question?.question_type || question?.type || '').trim().toLowerCase();
  if (qtype === 'scale' || (typeof answer === 'object' && answer !== null && !Array.isArray(answer))) {
    return !isMetsightsScaleAnswerComplete(answer);
  }

  return false;
};

const expandCatchupQuestionsForCardBundles = (fullQs, rawResponses, unfilledPredicate) => {
  const list = Array.isArray(fullQs) ? fullQs : [];
  const unfilled = list.filter((q) => unfilledPredicate(q, list, rawResponses));
  if (unfilled.length === 0) {
    return list;
  }
  const byId = new Map(
    list
      .map((q) => [Number(q?.question_id || q?.id || 0), q])
      .filter(([id]) => id > 0),
  );
  const otherTextIdToParent = new Map();
  list.forEach((parent) => {
    const mapped = findMappedOtherTextQuestion(list, parent);
    const oid = Number(mapped?.question_id || mapped?.id || 0);
    if (oid > 0 && mapped) {
      otherTextIdToParent.set(oid, parent);
    }
  });
  const outIds = new Set();
  const addById = (id) => {
    if (id > 0 && byId.has(id)) {
      outIds.add(id);
    }
  };
  unfilled.forEach((q) => {
    const id = Number(q?.question_id || q?.id || 0);
    addById(id);
    const mapped = findMappedOtherTextQuestion(list, q);
    const mid = Number(mapped?.question_id || mapped?.id || 0);
    if (mid > 0) {
      addById(mid);
    }
    if (isLikelyOtherTextQuestion(q)) {
      const parent = otherTextIdToParent.get(id);
      if (parent) {
        const pid = Number(parent?.question_id || parent?.id || 0);
        addById(pid);
      }
    }
  });
  const ordered = list.filter((row) => outIds.has(Number(row?.question_id || row?.id || 0)));
  return ordered.length > 0 ? ordered : list;
};

const isAnthropometryPrimaryQuestion = (question) => {
  const k = String(question?.question_key || '').toLowerCase();
  const t = String(question?.question_text || '').toLowerCase();
  if (k.includes('hip') || k.includes('body_fat') || k.includes('fat_percent')) {
    return false;
  }
  if (t.includes('hip size') || t.includes('body fat') || t.includes('body-fat')) {
    return false;
  }
  return k.includes('height') || k.includes('weight') || k.includes('waist') || t.includes('waist');
};

const isAnthropometryFollowupQuestion = (question) => {
  const k = String(question?.question_key || '').toLowerCase();
  const t = String(question?.question_text || '').toLowerCase();
  return k.includes('hip') || k.includes('body_fat') || k.includes('fat_percent')
    || t.includes('hip size') || t.includes('body fat') || t.includes('body-fat');
};

export const anthropometryPrimaryHasUnfilled = (questions, rawResponses) => (
  questions.some((q) => isAnthropometryPrimaryQuestion(q) && questionBlocksMetsightsSubmit(q, rawResponses))
);

const findAnthropometryQuestionByKeyPart = (questions, keyPart) => (
  (Array.isArray(questions) ? questions : []).find((q) => {
    const key = String(q?.question_key || '').toLowerCase();
    const text = String(q?.question_text || '').toLowerCase();
    const part = String(keyPart || '').toLowerCase();
    return key.includes(part) || text.includes(part);
  }) || null
);

/** Metsights FitPrint submit requires height, weight, and waist_circumference with value + unit. */
export const getMissingMetsightsPhysicalMeasurements = (questions, rawResponses) => {
  const required = [
    { part: 'height', label: 'height' },
    { part: 'weight', label: 'body weight' },
    { part: 'waist', label: 'waist size' },
  ];
  const missing = [];

  required.forEach(({ part, label }) => {
    const question = findAnthropometryQuestionByKeyPart(questions, part);
    if (!question) {
      return;
    }
    if (questionBlocksMetsightsSubmit(question, rawResponses)) {
      missing.push(label);
    }
  });

  return missing;
};

export const assertMetsightsPhysicalMeasurementsForSubmit = (questions, rawResponses) => {
  const missing = getMissingMetsightsPhysicalMeasurements(questions, rawResponses);
  if (missing.length === 0) {
    return;
  }
  throw new Error(
    `Please complete your measurements (${missing.join(', ')}) before submitting. Waist size is required for FitPrint.`,
  );
};

const anthropometryFollowupHasUnfilled = (questions, rawResponses) => (
  questions.some((q) => isAnthropometryFollowupQuestion(q) && questionIsUnfilled(q, rawResponses))
);

const cardKeyForQuestion = (q) => String(q?.question_key || `question-${q?.question_id || q?.id || ''}`);

const isFamilyMedicationSkippedWhenDiagnosedNoneOnly = (fullQs, raw, q) => {
  const cards = toFamilyApiCards(fullQs);
  const { diagnosedKey, medicationKey } = findFamilyHistoryCardKeys(cards);
  if (!medicationKey || !diagnosedKey) {
    return false;
  }
  if (String(medicationKey) !== cardKeyForQuestion(q)) {
    return false;
  }
  const selections = buildSelectionStateFromResponses(fullQs, raw);
  const diagnosedSel = Array.isArray(selections[diagnosedKey]) ? selections[diagnosedKey] : [];
  return diagnosedSel.length > 0 && diagnosedSel.every((item) => isNoneOptionLabel(item));
};

const familyQuestionBlocksCatchup = (fullQs, raw, q) => (
  questionIsUnfilled(q, raw) && !isFamilyMedicationSkippedWhenDiagnosedNoneOnly(fullQs, raw, q)
);

const familyVisibleCardCount = (catchupQuestionSubset, selections) => {
  const cards = toFamilyApiCards(catchupQuestionSubset);
  if (cards.length === 0) {
    return 0;
  }
  const { diagnosedKey, medicationKey } = findFamilyHistoryCardKeys(cards);
  if (!medicationKey || !diagnosedKey) {
    return cards.length;
  }
  const diagnosedSel = Array.isArray(selections?.[diagnosedKey]) ? selections[diagnosedKey] : [];
  const diagnosedNoneOnly = diagnosedSel.length > 0 && diagnosedSel.every((item) => isNoneOptionLabel(item));
  if (!diagnosedNoneOnly) {
    return cards.length;
  }
  return cards.filter((c) => c.key !== medicationKey).length;
};

const routesWithAnyUnfilled = (categories, questionsByRoute, responsesByCategoryId) => (
  SWIPE_ROUTE_ORDER.filter((routeId) => {
    if (!hasCategoriesForRoute(categories, routeId)) {
      return false;
    }
    const qs = questionsByRoute[routeId] || [];
    const raw = mergeResponsesForRoute(categories, responsesByCategoryId, routeId);
    if (routeId === 'family-history') {
      return qs.some((q) => familyQuestionBlocksCatchup(qs, raw, q));
    }
    return qs.some((q) => questionIsUnfilled(q, raw));
  })
);

/**
 * @param {{ categories?: any[], questionsByCategoryId?: Record<string, any[]>, responsesByCategoryId?: Record<string, any[]> }} ctx
 * @returns {boolean}
 */
export function evaluateFitprintCatchupLoadedContext(ctx) {
  const cats = ctx?.categories || [];
  const qBy = ctx?.questionsByCategoryId || {};
  const rBy = ctx?.responsesByCategoryId || {};

  const qRoute = buildQuestionsByRoute(cats, qBy);
  const anthQ = qRoute.anthropometry || [];
  const anthRaw = mergeResponsesForRoute(cats, rBy, 'anthropometry');

  if (anthropometryPrimaryHasUnfilled(anthQ, anthRaw) || anthropometryFollowupHasUnfilled(anthQ, anthRaw)) {
    return false;
  }

  let swipe = [...routesWithAnyUnfilled(cats, qRoute, rBy)];
  while (swipe[0] === 'family-history' && hasCategoriesForRoute(cats, 'family-history')) {
    const qs = qRoute['family-history'] || [];
    const raw = mergeResponsesForRoute(cats, rBy, 'family-history');
    const nullQs = expandCatchupQuestionsForCardBundles(
      qs,
      raw,
      (q, list, r) => familyQuestionBlocksCatchup(list, r, q),
    );
    const initialSelections = buildSelectionStateFromResponses(qs, raw);
    if (familyVisibleCardCount(nullQs, initialSelections) > 0) {
      return false;
    }
    swipe = swipe.slice(1);
  }

  return swipe.length === 0;
}

/**
 * True when all FitPrint-gap questionnaire answers exist on this assessment (Basic/Pro instance).
 */
/**
 * Load Basic/Pro questionnaire and verify anthropometry is Metsights-ready before POST submit.
 */
export async function assertGapQuestionnaireReadyForMetsightsSubmit(basicProAssessmentInstanceId) {
  const id = Number(basicProAssessmentInstanceId);
  if (!Number.isFinite(id) || id <= 0) {
    throw new Error('Invalid assessment for questionnaire submit.');
  }

  const ctx = await loadQuestionnaireContextForAssessmentInstance(id);
  const categories = ctx?.categories || [];
  const responsesByCategoryId = ctx?.responsesByCategoryId || {};
  const qRoute = buildQuestionsByRoute(categories, ctx?.questionsByCategoryId || {});
  const anthQ = qRoute.anthropometry || [];
  const anthRaw = mergeResponsesForRoute(categories, responsesByCategoryId, 'anthropometry');
  assertMetsightsPhysicalMeasurementsForSubmit(anthQ, anthRaw);
}

export async function isFitprintGapQuestionnaireFullyComplete(assessmentInstanceId) {
  const id = Number(assessmentInstanceId);
  if (!Number.isFinite(id) || id <= 0) {
    return false;
  }
  try {
    const ctx = await loadQuestionnaireContextForAssessmentInstance(id);
    return evaluateFitprintCatchupLoadedContext(ctx);
  } catch {
    return false;
  }
}
