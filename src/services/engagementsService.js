import { authorizedRequest } from './apiClient';
import { clearReportRequestCache } from './reportService';

const FITPRINT_PACKAGE_CODE = 'MY_FITNESS_PRINT';

/**
 * Assign an assessment package to the current user on an engagement.
 * POST /engagements/{engagement_id}/assessment-packages
 */
export const assignEngagementAssessmentPackage = async (engagementId, packageCode = FITPRINT_PACKAGE_CODE) => {
  const engagement = Number(engagementId);
  if (!Number.isFinite(engagement) || engagement <= 0) {
    throw new Error('Invalid engagement id.');
  }

  const code = String(packageCode || '').trim();
  if (!code) {
    throw new Error('Package code is required.');
  }

  const parsedBody = await authorizedRequest(`/engagements/${engagement}/assessment-packages`, {
    method: 'POST',
    payload: { package_code: code },
  });

  clearReportRequestCache();
  return parsedBody?.data ?? parsedBody;
};

export const assignFitprintToEngagement = async (engagementId) => (
  assignEngagementAssessmentPackage(engagementId, FITPRINT_PACKAGE_CODE)
);
