import { assignFitprintToEngagement } from '../services/engagementsService';
import {
  clearReportRequestCache,
  fetchHealthSpanIndexForPair,
  getHealthSpanIndexSourceStatus,
  listHealthSpanIndexPairsFromRows,
} from '../services/reportService';
import {
  clearFitprintGapQuestionnaireSubmittedFlag,
  isFitprintAssessmentSubmitConfirmed,
} from '../services/questionnaireService';
import { isFitprintGapQuestionnaireFullyComplete } from './fitprintGapCatchupCompletion';

/** No published scores yet (null or all zero). */
export const areHealthSpanScoresPending = (scores) => {
  if (!scores || typeof scores !== 'object') {
    return true;
  }
  const values = [scores.fitnessScore, scores.nutritionScore, scores.lifestyleScore];
  return values.every((value) => value == null || (Number.isFinite(Number(value)) && Number(value) <= 0));
};

/** Health Span Index card modes (resolved before home paints). */
export const HEALTH_SPAN_PHASE = Object.freeze({
  SHOW_SCORES: 'show_scores',
  LOCKED_QUESTIONNAIRE: 'locked_questionnaire',
  LOCKED_SUBMITTED: 'locked_submitted',
  NO_BASIC_PRO: 'no_basic_pro',
  /** Basic/Pro exists, but no FitPrint instance and no HSI report to show. */
  HIDDEN_NO_FITPRINT: 'hidden_no_fitprint',
});

const normalizeBasicProId = (resolved) => {
  const id = Number(resolved?.basicOrProAssessmentId);
  return Number.isFinite(id) && id > 0 ? id : null;
};

const normalizeEngagementId = (resolved) => {
  const fromResolved = String(resolved?.engagementId || '').trim();
  if (fromResolved) {
    return fromResolved;
  }
  const row = resolved?.latestBasicOrPro;
  if (!row) {
    return '';
  }
  return String(
    row.engagement_id
    || row.engagement?.engagement_id
    || row.engagement?.id
    || '',
  ).trim();
};

const tryFetchFitprintReportScores = async ({ fitprintAssessmentId, basicOrProAssessmentId, ttlMs }) => {
  if (!fitprintAssessmentId || !basicOrProAssessmentId) {
    return null;
  }
  try {
    const result = await fetchHealthSpanIndexForPair({
      fitprintAssessmentId,
      basicOrProAssessmentId,
      includeDetails: false,
    });
    if (!areHealthSpanScoresPending(result?.scores)) {
      return result.scores;
    }
  } catch {
    // Report not ready — continue to questionnaire / locked states.
  }
  return null;
};

const resolveSourcesWithOptionalAssign = async ({ ttlMs, assignFitprintIfMissing }) => {
  let resolved = await getHealthSpanIndexSourceStatus({ ttlMs });
  const basicProId = normalizeBasicProId(resolved);

  if (!basicProId) {
    return { resolved, basicProId: null, fitprintAssessmentId: null, engagementId: '' };
  }

  const engagementId = normalizeEngagementId(resolved);
  let fitprintAssessmentId = Number(resolved?.fitprintAssessmentId) || null;

  const needsFitprintOnEngagement = resolved.status === 'missing_fitprint'
    || resolved.status === 'missing_engagement';

  if (needsFitprintOnEngagement && assignFitprintIfMissing) {
    const engagementNumeric = Number(engagementId);
    if (Number.isFinite(engagementNumeric) && engagementNumeric > 0) {
      try {
        await assignFitprintToEngagement(engagementNumeric);
        clearReportRequestCache();
        resolved = await getHealthSpanIndexSourceStatus({ ttlMs: 0 });
        fitprintAssessmentId = Number(resolved?.fitprintAssessmentId) || null;
      } catch (error) {
        console.warn('[FitprintHealthSpanFlow] FitPrint assign failed:', error?.message || error);
      }
    }
  }

  if (resolved.status === 'ready' && fitprintAssessmentId) {
    return { resolved, basicProId, fitprintAssessmentId, engagementId: normalizeEngagementId(resolved) || engagementId };
  }

  return {
    resolved,
    basicProId,
    fitprintAssessmentId: fitprintAssessmentId > 0 ? fitprintAssessmentId : null,
    engagementId,
  };
};

/**
 * Newest FitPrint first (higher instance id). Used when several FitPrints exist
 * so Health Span Index always prefers the latest report with scores.
 */
const sortPairsLatestFitprintFirst = (pairs) => (
  [...pairs].sort((a, b) => Number(b.fitprintAssessmentId || 0) - Number(a.fitprintAssessmentId || 0))
);

/**
 * Newest FitPrint + Basic/Pro pair that already has HSI scores.
 * Walks every engagement pair, latest FitPrint first.
 */
const tryFetchLatestFilledHealthSpanScores = async ({ rows, ttlMs }) => {
  const pairs = sortPairsLatestFitprintFirst(listHealthSpanIndexPairsFromRows(rows));
  for (const pair of pairs) {
    const scores = await tryFetchFitprintReportScores({
      fitprintAssessmentId: pair.fitprintAssessmentId,
      basicOrProAssessmentId: pair.basicOrProAssessmentId,
      ttlMs,
    });
    if (scores) {
      return {
        scores,
        basicOrProAssessmentId: pair.basicOrProAssessmentId,
        fitprintAssessmentId: pair.fitprintAssessmentId,
        engagementId: pair.engagementId,
      };
    }
  }
  return null;
};

/**
 * Resolve Health Span Index UI from assessments + report + FitPrint submit state.
 *
 * 1. Latest FitPrint that already has scores → show_scores
 * 2. No FitPrint instance and no HSI report → hidden_no_fitprint
 *    (do not assign FitPrint or show locked HSI / Complete Assessment)
 * 3. FitPrint exists, fitness-parameters submitted, no scores yet → locked_submitted
 * 4. FitPrint assigned but not submitted → locked_questionnaire
 */
export async function loadFitprintHealthSpanIndexState({
  ttlMs = 45000,
  assignFitprintIfMissing = false,
} = {}) {
  const { resolved, basicProId, fitprintAssessmentId, engagementId } = await resolveSourcesWithOptionalAssign({
    ttlMs,
    assignFitprintIfMissing,
  });

  if (!basicProId || resolved.status === 'fetch_error' || resolved.status === 'no_basic_or_pro') {
    return {
      phase: HEALTH_SPAN_PHASE.NO_BASIC_PRO,
      isLocked: false,
      basicProAssessmentId: null,
      fitprintAssessmentId: null,
      engagementId: null,
      gapQuestionnaireComplete: false,
      hasFitprintReport: false,
      hasFitprintAssigned: false,
      scores: null,
    };
  }

  const filled = await tryFetchLatestFilledHealthSpanScores({
    rows: resolved?.rows || [],
    ttlMs,
  });
  if (filled?.scores) {
    clearFitprintGapQuestionnaireSubmittedFlag(filled.fitprintAssessmentId);
    return {
      phase: HEALTH_SPAN_PHASE.SHOW_SCORES,
      isLocked: false,
      basicProAssessmentId: filled.basicOrProAssessmentId,
      fitprintAssessmentId: filled.fitprintAssessmentId,
      engagementId: filled.engagementId || engagementId || null,
      gapQuestionnaireComplete: true,
      hasFitprintReport: true,
      hasFitprintAssigned: true,
      scores: filled.scores,
      scoresFromPriorCycle: Number(filled.fitprintAssessmentId) !== Number(fitprintAssessmentId),
    };
  }

  if (!fitprintAssessmentId) {
    return {
      phase: HEALTH_SPAN_PHASE.HIDDEN_NO_FITPRINT,
      isLocked: false,
      basicProAssessmentId: basicProId,
      fitprintAssessmentId: null,
      engagementId: engagementId || null,
      gapQuestionnaireComplete: false,
      hasFitprintReport: false,
      hasFitprintAssigned: false,
      scores: null,
    };
  }

  let fitprintSubmitConfirmed = false;
  try {
    fitprintSubmitConfirmed = await isFitprintAssessmentSubmitConfirmed(fitprintAssessmentId, {
      instanceStatus: resolved?.latestMatchingFitprint?.status,
    });
  } catch {
    fitprintSubmitConfirmed = false;
  }

  if (fitprintSubmitConfirmed) {
    return {
      phase: HEALTH_SPAN_PHASE.LOCKED_SUBMITTED,
      isLocked: true,
      basicProAssessmentId: basicProId,
      fitprintAssessmentId: fitprintAssessmentId || null,
      engagementId: engagementId || null,
      gapQuestionnaireComplete: true,
      hasFitprintReport: false,
      hasFitprintAssigned: Boolean(fitprintAssessmentId),
      scores: null,
    };
  }

  let gapQuestionnaireComplete = false;
  try {
    gapQuestionnaireComplete = await isFitprintGapQuestionnaireFullyComplete(basicProId);
  } catch {
    gapQuestionnaireComplete = false;
  }

  return {
    phase: HEALTH_SPAN_PHASE.LOCKED_QUESTIONNAIRE,
    isLocked: true,
    basicProAssessmentId: basicProId,
    fitprintAssessmentId: fitprintAssessmentId || null,
    engagementId: engagementId || null,
    gapQuestionnaireComplete,
    hasFitprintReport: false,
    hasFitprintAssigned: Boolean(fitprintAssessmentId),
    scores: null,
  };
}

/** Map flow state into home preload / lock helpers. */
export function fitprintHealthSpanPreloadExtras(state) {
  if (!state || state.phase === HEALTH_SPAN_PHASE.NO_BASIC_PRO || !state.isLocked) {
    if (state?.phase === HEALTH_SPAN_PHASE.SHOW_SCORES) {
      return {
        fitprintGapLockPreloaded: true,
        healthSpanLockedNoFitprint: false,
        healthSpanPhase: state.phase,
        healthSpanScores: state.scores,
        healthSpanGapBasicProAssessmentId: state.basicProAssessmentId,
        healthSpanGapEngagementId: state.engagementId,
        fitprintGapQCompleteFromServer: true,
      };
    }
    if (state?.phase === HEALTH_SPAN_PHASE.HIDDEN_NO_FITPRINT) {
      return {
        fitprintGapLockPreloaded: true,
        healthSpanLockedNoFitprint: false,
        healthSpanPhase: state.phase,
        healthSpanScores: null,
        healthSpanGapBasicProAssessmentId: state.basicProAssessmentId,
        healthSpanGapEngagementId: state.engagementId,
        fitprintGapQCompleteFromServer: false,
      };
    }
    return {};
  }

  return {
    fitprintGapLockPreloaded: true,
    healthSpanLockedNoFitprint: true,
    healthSpanPhase: state.phase,
    healthSpanGapBasicProAssessmentId: state.basicProAssessmentId,
    healthSpanGapEngagementId: state.engagementId,
    // Only true when FitPrint submit is confirmed — not when Pro alone has answers.
    fitprintGapQCompleteFromServer: state.phase === HEALTH_SPAN_PHASE.LOCKED_SUBMITTED,
    healthSpanScores: null,
  };
}

/** Back-compat wrapper for existing imports. */
export async function loadFitprintGapLockState(options = {}) {
  const state = await loadFitprintHealthSpanIndexState(options);
  if (
    state.phase === HEALTH_SPAN_PHASE.SHOW_SCORES
    || state.phase === HEALTH_SPAN_PHASE.NO_BASIC_PRO
    || state.phase === HEALTH_SPAN_PHASE.HIDDEN_NO_FITPRINT
  ) {
    return {
      isLocked: false,
      basicProAssessmentId: state.basicProAssessmentId,
      gapQuestionnaireComplete: state.gapQuestionnaireComplete,
    };
  }
  return {
    isLocked: true,
    basicProAssessmentId: state.basicProAssessmentId,
    gapQuestionnaireComplete: state.gapQuestionnaireComplete,
  };
}

/** Assign FitPrint on the engagement when missing; refreshes /assessments/me cache. */
export async function ensureFitprintAssignedForEngagement(engagementId) {
  const engagementNumeric = Number(engagementId);
  if (!Number.isFinite(engagementNumeric) || engagementNumeric <= 0) {
    return null;
  }

  const resolved = await getHealthSpanIndexSourceStatus({ ttlMs: 0 });
  if (resolved.status === 'ready' && resolved.fitprintAssessmentId) {
    return resolved;
  }

  await assignFitprintToEngagement(engagementNumeric);
  clearReportRequestCache();
  return getHealthSpanIndexSourceStatus({ ttlMs: 0 });
}

export function fitprintGapPreloadExtras(lockStateOrFlowState) {
  if (lockStateOrFlowState?.phase) {
    return fitprintHealthSpanPreloadExtras(lockStateOrFlowState);
  }
  if (!lockStateOrFlowState?.isLocked) {
    return {};
  }
  return {
    fitprintGapLockPreloaded: true,
    healthSpanLockedNoFitprint: true,
    healthSpanGapBasicProAssessmentId: lockStateOrFlowState.basicProAssessmentId,
    fitprintGapQCompleteFromServer: lockStateOrFlowState.gapQuestionnaireComplete,
  };
}
