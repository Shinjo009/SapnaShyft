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

/**
 * Consultation booking state for an engagement.
 * GET /engagements/{engagement_id}/consultation
 */
export const getEngagementConsultation = async (engagementId) => {
  const engagement = Number(engagementId);
  if (!Number.isFinite(engagement) || engagement <= 0) {
    throw new Error('Invalid engagement id.');
  }

  const parsedBody = await authorizedRequest(`/engagements/${engagement}/consultation`, {
    method: 'GET',
  });

  return parsedBody?.data ?? parsedBody;
};

/**
 * Engagement details by public code, including offline slot_detail.
 * GET /engagements/code/{engagement_code}
 */
export const getEngagementByCode = async (engagementCode) => {
  const code = String(engagementCode || '').trim();
  if (!code) {
    throw new Error('Engagement code is required.');
  }

  const parsedBody = await authorizedRequest(`/engagements/code/${encodeURIComponent(code)}`, {
    method: 'GET',
  });

  return parsedBody?.data ?? parsedBody;
};
