import {
  getStoredLatestReportAssessmentId,
  peekMyAssessmentsRowsCached,
  resolveEngagementIdFromAssessmentId,
  resolveReassessmentPromptFromRows,
} from '../services/reportService';
import {
  hasSubmittedHealthQuestionnaire,
  hasIncompleteNonVitalsQuestionnaireSection,
} from '../services/questionnaireService';
import { isFitprintGapQuestionnaireFullyComplete } from './fitprintGapCatchupCompletion';

/**
 * Returning user with a past report + new Basic/Pro (+ FitPrint) cycle.
 * shouldShow — show blood-collection sheet (even if questionnaire already done).
 * showUpdateCta — also show Update Health Assessment (questionnaire still needed).
 * For B2B, Update is hidden when only Vitals is incomplete (non-Vitals all complete).
 */
export async function loadReassessmentBannerState({
  ttlMs = 45000,
  reportAssessmentId = null,
  reportEngagementId = null,
  isB2b = false,
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
      return { shouldShow: false, showUpdateCta: false };
    }

    const questionnaireSubmitted = await hasSubmittedHealthQuestionnaire();
    const gapQuestionnaireComplete = await isFitprintGapQuestionnaireFullyComplete(
      resolved.latestBasicProAssessmentId,
    );

    let showUpdateCta = !questionnaireSubmitted && !gapQuestionnaireComplete;
    if (showUpdateCta && isB2b) {
      const hasIncompleteNonVitals = await hasIncompleteNonVitalsQuestionnaireSection(
        resolved.latestBasicProAssessmentId,
      );
      showUpdateCta = hasIncompleteNonVitals;
    }

    return {
      shouldShow: true,
      showUpdateCta,
      latestEngagementId: resolved.latestEngagementId,
      latestBasicProAssessmentId: resolved.latestBasicProAssessmentId,
    };
  } catch {
    return { shouldShow: false, showUpdateCta: false };
  }
}
