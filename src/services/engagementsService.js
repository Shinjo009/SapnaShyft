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

export const resolveConsultationIdForExpertType = (consultationData, expertType) => {
  const normalizedType = String(expertType || '').toLowerCase();
  if (!normalizedType) {
    return null;
  }

  const myConsultations = Array.isArray(consultationData?.my_consultations)
    ? consultationData.my_consultations
    : [];

  const matches = myConsultations.filter(
    (item) => String(item?.expert_type || '').toLowerCase() === normalizedType,
  );

  if (matches.length === 0) {
    return null;
  }

  const withId = matches.filter((item) => {
    const id = Number(item?.consultation_id);
    return Number.isFinite(id) && id > 0;
  });

  const target = withId[withId.length - 1] || matches[matches.length - 1];
  const consultationId = Number(target?.consultation_id);
  return Number.isFinite(consultationId) && consultationId > 0 ? consultationId : null;
};

/**
 * Record health-data sharing consent for a consultation.
 * POST /engagements/{engagement_id}/consultation/{consultation_id}/consent
 */
export const submitEngagementConsultationConsent = async ({
  engagementId,
  consultationId,
  bioAi = false,
  bloodReport = false,
  questionnaire = false,
}) => {
  const engagement = Number(engagementId);
  const consultation = Number(consultationId);

  if (!Number.isFinite(engagement) || engagement <= 0) {
    throw new Error('Invalid engagement id.');
  }
  if (!Number.isFinite(consultation) || consultation <= 0) {
    throw new Error('Invalid consultation id.');
  }

  const parsedBody = await authorizedRequest(
    `/engagements/${engagement}/consultation/${consultation}/consent`,
    {
      method: 'POST',
      payload: {
        bio_ai: Boolean(bioAi),
        blood_report: Boolean(bloodReport),
        questionnaire: Boolean(questionnaire),
      },
    },
  );

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
