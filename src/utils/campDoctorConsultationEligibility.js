import { peekMyAssessmentsRowsCached, resolveEngagementIdFromAssessmentId } from '../services/reportService';
import { getEngagementConsultation } from '../services/engagementsService';
import { getMyUpcomingSlot } from '../services/usersService';

const extractAssessmentInstanceIdFromRow = (row) => {
  if (!row || typeof row !== 'object') {
    return null;
  }

  const id = row.assessment_instance_id ?? row.assessment_id ?? row.id;
  const numericId = Number(id);
  return Number.isFinite(numericId) && numericId > 0 ? numericId : null;
};

/** Blood-test / camp day from GET /users/me/upcoming-slot (`slot.engagement_date`). */
export const extractBloodTestDateFromUpcomingSlot = (root) => {
  if (!root || typeof root !== 'object') {
    return '';
  }

  const slots = Array.isArray(root.slots) ? root.slots : [];
  const first = slots[0] || {};
  const slot = first.slot && typeof first.slot === 'object' ? first.slot : {};
  const engagement = first.engagement && typeof first.engagement === 'object'
    ? first.engagement
    : {};

  return String(
    slot.engagement_date
    || slot.blood_collection_date
    || slot.blood_test_date
    || engagement.blood_collection_date
    || engagement.engagement_date
    || first.engagement_date
    || '',
  ).trim();
};

const parseYmdLocalDate = (raw) => {
  const ymd = String(raw || '').slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) {
    return null;
  }
  const [year, month, day] = ymd.split('-').map((part) => Number(part));
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
    return null;
  }
  return new Date(year, month - 1, day);
};

/** True when blood-test day is strictly after local today. */
export const isBloodTestDateAfterToday = (rawDate) => {
  const bloodDate = parseYmdLocalDate(rawDate);
  if (!bloodDate) {
    return false;
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return bloodDate.getTime() > today.getTime();
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

const asTruthyConsultationFlag = (value) => (
  value === true
  || value === 'true'
  || value === 'True'
  || value === 1
  || value === '1'
);

/** Expert types offered on the engagement (`consultations.doctor`, `.nutritionist`, etc.). */
export const getOfferedConsultationTypes = (consultation) => {
  const map = consultation?.consultations;
  if (!map || typeof map !== 'object') {
    return [];
  }

  return Object.entries(map)
    .filter(([, value]) => asTruthyConsultationFlag(value))
    .map(([key]) => String(key).toLowerCase());
};

/**
 * True when any offered consultation type still needs a date/slot.
 * Empty my_consultations, or a missing entry for an offered type, counts as unfilled.
 */
export const isConsultationScheduleUnfilled = (consultation) => {
  const offeredTypes = getOfferedConsultationTypes(consultation);
  if (offeredTypes.length === 0) {
    return false;
  }

  const myConsultations = Array.isArray(consultation?.my_consultations)
    ? consultation.my_consultations
    : [];

  if (myConsultations.length === 0) {
    return true;
  }

  return offeredTypes.some((type) => {
    const entries = myConsultations.filter(
      (item) => String(item?.expert_type || '').toLowerCase() === type,
    );
    if (entries.length === 0) {
      return true;
    }
    return entries.some((item) => item?.date == null || item?.slot == null);
  });
};

/** @deprecated Use isConsultationScheduleUnfilled — kept for existing imports. */
export const isDoctorConsultationScheduleUnfilled = isConsultationScheduleUnfilled;

/**
 * Show home consultation popup when any consultations.* flag is true
 * and that offered type is still unfilled (not doctor-only).
 */
export const shouldShowDoctorConsultationPopup = (consultation, { bloodTestDate } = {}) => {
  if (isBloodTestDateAfterToday(bloodTestDate)) {
    return false;
  }

  if (!consultation || typeof consultation !== 'object') {
    return false;
  }

  if (getOfferedConsultationTypes(consultation).length === 0) {
    return false;
  }

  return isConsultationScheduleUnfilled(consultation);
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

  const [consultation, upcomingSlot] = await Promise.all([
    getEngagementConsultation(engagementId),
    getMyUpcomingSlot().catch(() => null),
  ]);
  const bloodTestDate = extractBloodTestDateFromUpcomingSlot(upcomingSlot);

  return {
    shouldShow: shouldShowDoctorConsultationPopup(consultation, { bloodTestDate }),
    engagementId,
    consultation,
    engagementCode: consultation?.engagement_code || null,
    consultationMode: consultation?.consultation_mode || null,
  };
};
