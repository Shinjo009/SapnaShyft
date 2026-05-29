import {
  getStoredLatestReportAssessmentId,
  peekMyAssessmentsRowsCached,
  resolveEngagementIdFromAssessmentId,
  resolveReassessmentPromptFromRows,
} from '../services/reportService';
import { hasSubmittedHealthQuestionnaire } from '../services/questionnaireService';
import { isFitprintGapQuestionnaireFullyComplete } from './fitprintGapCatchupCompletion';

export async function loadReassessmentBannerState({
  ttlMs = 45000,
  reportAssessmentId = null,
  reportEngagementId = null,
} = {}) {
  try {
    const rows = await peekMyAssessmentsRowsCached(ttlMs);
    const reportId = reportAssessmentId ?? getStoredLatestReportAssessmentId();
    const reportEng = reportEngagementId
      || resolveEngagementIdFromAssessmentId(rows, reportId);

    const resolved = resolveReassessmentPromptFromRows(rows, {
      reportAssessmentId: reportId,
      reportEngagementId: reportEng,
    });

    if (!resolved.shouldPrompt || !resolved.latestBasicProAssessmentId) {
      return { shouldShow: false };
    }

    if (await hasSubmittedHealthQuestionnaire()) {
      return { shouldShow: false };
    }

    const gapQuestionnaireComplete = await isFitprintGapQuestionnaireFullyComplete(
      resolved.latestBasicProAssessmentId,
    );

    if (gapQuestionnaireComplete) {
      return { shouldShow: false };
    }

    return {
      shouldShow: true,
      latestEngagementId: resolved.latestEngagementId,
      latestBasicProAssessmentId: resolved.latestBasicProAssessmentId,
    };
  } catch {
    return { shouldShow: false };
  }
}
