import { getHealthSpanIndexSourceStatus } from '../services/reportService';
import { isFitprintGapQuestionnaireFullyComplete } from './fitprintGapCatchupCompletion';

/**
 * True when the user has a Basic/Pro assessment on an engagement but no matching FitPrint row.
 */
export async function loadFitprintGapLockState({ ttlMs = 45000 } = {}) {
  try {
    const sourceStatus = await getHealthSpanIndexSourceStatus({ ttlMs });

    if (sourceStatus.status !== 'missing_fitprint') {
      return {
        isLocked: false,
        basicProAssessmentId: null,
        gapQuestionnaireComplete: false,
      };
    }

    const basicProId = Number(sourceStatus.basicOrProAssessmentId);
    const normalizedId = Number.isFinite(basicProId) && basicProId > 0 ? basicProId : null;

    let gapQuestionnaireComplete = false;
    if (normalizedId != null) {
      gapQuestionnaireComplete = await isFitprintGapQuestionnaireFullyComplete(normalizedId);
    }

    return {
      isLocked: true,
      basicProAssessmentId: normalizedId,
      gapQuestionnaireComplete: Boolean(gapQuestionnaireComplete),
    };
  } catch {
    return {
      isLocked: false,
      basicProAssessmentId: null,
      gapQuestionnaireComplete: false,
    };
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
