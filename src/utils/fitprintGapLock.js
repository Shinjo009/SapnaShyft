import {
  fetchHealthSpanIndexForPair,
  fetchLatestHealthSpanIndex,
  findLatestFitprintAssessmentIdFromRows,
  getHealthSpanIndexSourceStatus,
} from '../services/reportService';
import { isFitprintGapQuestionnaireFullyComplete } from './fitprintGapCatchupCompletion';

const UNLOCKED = Object.freeze({
  isLocked: false,
  basicProAssessmentId: null,
  gapQuestionnaireComplete: false,
});

const normalizeBasicProId = (sourceStatus) => {
  const id = Number(sourceStatus?.basicOrProAssessmentId);
  return Number.isFinite(id) && id > 0 ? id : null;
};

/** No published scores yet (null or all zero). */
export const areHealthSpanScoresPending = (scores) => {
  if (!scores || typeof scores !== 'object') {
    return true;
  }
  const values = [scores.fitnessScore, scores.nutritionScore, scores.lifestyleScore];
  return values.every((value) => value == null || (Number.isFinite(Number(value)) && Number(value) <= 0));
};

const tryUnlockFromReportScores = async (fetchScores) => {
  try {
    const result = await fetchScores();
    if (!areHealthSpanScoresPending(result?.scores)) {
      return UNLOCKED;
    }
  } catch {
    // Report not ready or pair invalid — fall through to questionnaire / lock flow.
  }
  return null;
};

/**
 * Lock Health Span Index when FitPrint is missing, gap questionnaire is incomplete,
 * or FitPrint exists but scores are not ready yet.
 *
 * When the report endpoint already returns scores (as in Postman), unlock immediately —
 * the API is the source of truth and must not be blocked by client-side questionnaire heuristics.
 */
export async function loadFitprintGapLockState({ ttlMs = 45000 } = {}) {
  try {
    const sourceStatus = await getHealthSpanIndexSourceStatus({ ttlMs });
    const status = sourceStatus?.status;

    if (status === 'fetch_error' || status === 'no_basic_or_pro') {
      return UNLOCKED;
    }

    const basicProId = normalizeBasicProId(sourceStatus);
    if (basicProId == null) {
      return UNLOCKED;
    }

    if (status === 'ready') {
      const unlocked = await tryUnlockFromReportScores(
        () => fetchLatestHealthSpanIndex({ includeDetails: false, ttlMs }),
      );
      if (unlocked) {
        return unlocked;
      }
    }

    if (status === 'missing_fitprint' || status === 'missing_engagement') {
      const fitprintId = findLatestFitprintAssessmentIdFromRows(sourceStatus?.rows || []);
      if (fitprintId) {
        const unlocked = await tryUnlockFromReportScores(
          () => fetchHealthSpanIndexForPair({
            fitprintAssessmentId: fitprintId,
            basicOrProAssessmentId: basicProId,
            includeDetails: false,
          }),
        );
        if (unlocked) {
          return unlocked;
        }
      }
    }

    let gapQuestionnaireComplete = false;
    try {
      gapQuestionnaireComplete = await isFitprintGapQuestionnaireFullyComplete(basicProId);
    } catch {
      gapQuestionnaireComplete = false;
    }

    const missingFitprint = status === 'missing_fitprint' || status === 'missing_engagement';

    if (missingFitprint || !gapQuestionnaireComplete) {
      return {
        isLocked: true,
        basicProAssessmentId: basicProId,
        gapQuestionnaireComplete,
      };
    }

    if (status === 'ready') {
      return {
        isLocked: true,
        basicProAssessmentId: basicProId,
        gapQuestionnaireComplete: true,
      };
    }

    return UNLOCKED;
  } catch {
    return UNLOCKED;
  }
}

/** Preload payload fragment for App home bootstrap when FitPrint is missing. */
export function fitprintGapPreloadExtras(lockState) {
  if (!lockState?.isLocked) {
    return {};
  }

  return {
    fitprintGapLockPreloaded: true,
    healthSpanLockedNoFitprint: true,
    healthSpanGapBasicProAssessmentId: lockState.basicProAssessmentId,
    fitprintGapQCompleteFromServer: lockState.gapQuestionnaireComplete,
  };
}
