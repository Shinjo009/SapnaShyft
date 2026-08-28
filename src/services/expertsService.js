import {
  getEngagementConsultation,
  resolveConsultationIdForExpertType,
  submitEngagementConsultationConsent,
} from './engagementsService';
import { peekMyAssessmentsRowsCached } from './reportService';
import { resolveActiveEngagementIdFromAssessments } from '../utils/campDoctorConsultationEligibility';
import { authorizedRequest } from './apiClient';

/**
 * Available consultation slots for online bookings.
 * GET /experts/consultations/slots?expert_type=doctor
 */
export const getExpertConsultationSlots = async (expertType = 'doctor') => {
  const type = String(expertType || '').trim();
  if (!type) {
    throw new Error('Expert type is required.');
  }

  const parsedBody = await authorizedRequest('/experts/consultations/slots', {
    method: 'GET',
    query: { expert_type: type },
  });

  return parsedBody?.data ?? parsedBody;
};

/**
 * Book an expert consultation slot.
 * POST /experts/consultations/book
 */
export const bookExpertConsultation = async ({
  engagementId,
  expertType = 'doctor',
  date,
  cabin,
  slot,
}) => {
  const engagement = Number(engagementId);
  if (!Number.isFinite(engagement) || engagement <= 0) {
    throw new Error('Invalid engagement id.');
  }

  const bookingDate = String(date || '').trim();
  const cabinKey = String(cabin || '').trim();
  const bookingSlot = String(slot || '').trim();
  const type = String(expertType || '').trim();

  if (!bookingDate) {
    throw new Error('Consultation date is required.');
  }
  if (!bookingSlot) {
    throw new Error('Consultation slot is required.');
  }
  if (!type) {
    throw new Error('Expert type is required.');
  }

  const payload = {
    engagement_id: engagement,
    expert_type: type,
    date: bookingDate,
    slot: bookingSlot,
  };

  if (cabinKey) {
    payload.cabin = cabinKey;
  }

  const parsedBody = await authorizedRequest('/experts/consultations/book', {
    method: 'POST',
    payload,
  });

  return parsedBody?.data ?? parsedBody;
};

const resolveEngagementIdForConsent = async (engagementId) => {
  const direct = Number(engagementId);
  if (Number.isFinite(direct) && direct > 0) {
    return direct;
  }

  const rows = await peekMyAssessmentsRowsCached(45000);
  return resolveActiveEngagementIdFromAssessments(rows);
};

/**
 * Record health-data sharing consent for a booked consultation.
 * Resolves engagement_id from /assessments/me when omitted, consultation_id from
 * GET /engagements/{engagement_id}/consultation → my_consultations[].
 */
export const submitConsultationHealthDataConsent = async ({
  engagementId,
  expertType = 'doctor',
  consentGranted = false,
}) => {
  const engagement = await resolveEngagementIdForConsent(engagementId);
  if (!Number.isFinite(engagement) || engagement <= 0) {
    throw new Error('Unable to resolve engagement id.');
  }

  const type = String(expertType || '').trim();
  if (!type) {
    throw new Error('Expert type is required.');
  }

  const consultationData = await getEngagementConsultation(engagement);
  const consultationId = resolveConsultationIdForExpertType(consultationData, type);
  if (!consultationId) {
    throw new Error('Unable to resolve consultation id.');
  }

  const granted = Boolean(consentGranted);

  return submitEngagementConsultationConsent({
    engagementId: engagement,
    consultationId,
    bioAi: granted,
    bloodReport: granted,
    questionnaire: granted,
  });
};
