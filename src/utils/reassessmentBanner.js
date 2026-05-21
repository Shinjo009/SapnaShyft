import {
  getStoredLatestReportAssessmentId,
  peekMyAssessmentsRowsCached,
  resolveReassessmentPromptFromRows,
} from '../services/reportService';

export async function loadReassessmentBannerState({
  ttlMs = 45000,
  reportAssessmentId = null,
} = {}) {
  try {
    const rows = await peekMyAssessmentsRowsCached(ttlMs);
    const reportId = reportAssessmentId ?? getStoredLatestReportAssessmentId();
    const resolved = resolveReassessmentPromptFromRows(rows, { reportAssessmentId: reportId });

    if (!resolved.shouldPrompt) {
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
