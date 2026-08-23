import { peekMyAssessmentsRowsCached, resolveEngagementIdFromAssessmentId } from '../services/reportService';
import { getEngagementConsultation } from '../services/engagementsService';

const extractAssessmentInstanceIdFromRow = (row) => {
  if (!row || typeof row !== 'object') {
    return null;
  }

  const id = row.assessment_instance_id ?? row.assessment_id ?? row.id;
  const numericId = Number(id);
  return Number.isFinite(numericId) && numericId > 0 ? numericId : null;
};

export const resolveActiveEngagementIdFromAssessments = (rawRows) => {
  const rows = Array.isArray(rawRows) ? rawRows : [];
  if (rows.length === 0) {
    return null;
  }

  const activeRow = rows.find((row) => String(row?.status || '').toLowerCase() === 'active') || rows[0];
  const assessmentInstanceId = extractAssessmentInstanceIdFromRow(activeRow);
  if (!assessmentInstanceId) {
    return null;
  }

  const engagementKey = resolveEngagementIdFromAssessmentId(rows, assessmentInstanceId);
  const engagementId = Number(engagementKey);
  return Number.isFinite(engagementId) && engagementId > 0 ? engagementId : null;
};

export const isDoctorConsultationScheduleUnfilled = (consultation) => {
  const myConsultations = Array.isArray(consultation?.my_consultations)
    ? consultation.my_consultations
    : [];

  if (myConsultations.length === 0) {
    return true;
  }

  const doctorConsultations = myConsultations.filter(
    (item) => String(item?.expert_type || '').toLowerCase() === 'doctor',
  );

  if (doctorConsultations.length === 0) {
    return true;
  }

  return doctorConsultations.some((item) => item?.date == null || item?.slot == null);
};

export const shouldShowDoctorConsultationPopup = (consultation) => {
  if (!consultation || typeof consultation !== 'object') {
    return false;
  }

  if (!consultation.consultations?.doctor) {
    return false;
  }

  return isDoctorConsultationScheduleUnfilled(consultation);
};

export const fetchDoctorConsultationPopupEligibility = async ({ ttlMs = 45000 } = {}) => {
  const rows = await peekMyAssessmentsRowsCached(ttlMs).catch(() => []);
  const engagementId = resolveActiveEngagementIdFromAssessments(rows);

  if (!engagementId) {
    return {
      shouldShow: false,
      engagementId: null,
      consultation: null,
      engagementCode: null,
      consultationMode: null,
    };
  }

  const consultation = await getEngagementConsultation(engagementId);

  return {
    shouldShow: shouldShowDoctorConsultationPopup(consultation),
    engagementId,
    consultation,
    engagementCode: consultation?.engagement_code || null,
    consultationMode: consultation?.consultation_mode || null,
  };
};
