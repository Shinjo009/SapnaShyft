import { formatApiSlotTimeToDisplay } from '../services/bookingService';

const hasText = (value) => Boolean(String(value || '').trim());

export const extractEngagementPayload = (response) => (
  response?.data && typeof response.data === 'object' ? response.data : response
);

/**
 * Normalize GET /book/me/drafts into draft summary rows.
 * Supports `data.engagements[]` (current) and legacy `data.engagement_ids[]`.
 */
export const extractDraftEngagementSummaries = (response) => {
  const engagements = response?.data?.engagements ?? response?.engagements;
  if (Array.isArray(engagements) && engagements.length) {
    return engagements
      .map((row) => {
        const engagementId = Number(row?.engagement_id ?? row?.id);
        if (!Number.isInteger(engagementId) || engagementId <= 0) {
          return null;
        }
        return {
          engagement_id: engagementId,
          status: String(row?.status || 'draft').trim().toLowerCase() || 'draft',
          resume_step: String(row?.resume_step || '').trim(),
          address: String(row?.address || '').trim(),
        };
      })
      .filter(Boolean);
  }

  const engagementIds = response?.data?.engagement_ids ?? response?.engagement_ids ?? [];
  if (!Array.isArray(engagementIds) || engagementIds.length === 0) {
    return [];
  }

  return engagementIds
    .map((value) => Number(value))
    .filter((value) => Number.isInteger(value) && value > 0)
    .map((engagementId) => ({
      engagement_id: engagementId,
      status: 'draft',
      resume_step: '',
      address: '',
    }));
};

/** Latest unfinished draft summary (highest engagement_id), or null. */
export const getLatestDraftSummary = (response) => {
  const summaries = extractDraftEngagementSummaries(response)
    .filter((row) => !row.status || row.status === 'draft');
  if (!summaries.length) {
    return null;
  }

  return summaries.reduce((latest, row) => (
    !latest || row.engagement_id > latest.engagement_id ? row : latest
  ), null);
};

export const getLatestDraftEngagementId = (response) => {
  const latest = getLatestDraftSummary(response);
  return latest?.engagement_id ?? null;
};

/**
 * Map API resume_step → PatientSelectionOverlay view.
 * API only returns: `address` | `booking_date`
 * @returns {'address'|'schedule'|null}
 */
export const mapResumeStepToView = (resumeStep) => {
  const step = String(resumeStep || '').trim().toLowerCase();
  if (step === 'address') return 'address';
  if (step === 'booking_date') return 'schedule';
  return null;
};

export const isDraftEngagement = (engagement) => (
  String(engagement?.status || '').trim().toLowerCase() === 'draft'
);

export const parseEngagementAddressToForm = (engagement) => {
  const parts = String(engagement?.address || '')
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
  const landmark = String(engagement?.landmark || '').trim();

  return {
    house: parts[0] || '',
    area: String(engagement?.sub_locality || '').trim() || parts[1] || '',
    landmark: landmark && landmark !== '-' ? landmark : '',
    city: String(engagement?.city || '').trim(),
    pincode: String(engagement?.pincode || '').trim(),
  };
};

export const buildResolvedAddressFromEngagement = (engagement) => {
  const formAddress = parseEngagementAddressToForm(engagement);

  return {
    ...formAddress,
    sub_locality: String(engagement?.sub_locality || '').trim(),
    state: String(engagement?.state || '').trim(),
    country: String(engagement?.country || 'India').trim(),
    latitude: Number(engagement?.latitude),
    longitude: Number(engagement?.longitude),
    address: String(engagement?.address || '').trim(),
  };
};

export const engagementHasAddress = (engagement) => (
  hasText(engagement?.address)
  && Number.isFinite(Number(engagement?.latitude))
  && Number.isFinite(Number(engagement?.longitude))
);

export const engagementHasSchedule = (engagement) => {
  const collectionDate = engagement?.blood_collection_date || engagement?.engagement_date;
  const collectionTime = engagement?.blood_collection_time_slot
    || engagement?.slot_start_time
    || engagement?.blood_collection_time;

  return hasText(collectionDate) && hasText(collectionTime);
};

/**
 * @returns {'select'|'address'|'schedule'|'details'|'payment'}
 */
export const resolveDraftResumeView = (engagement) => {
  const fromResumeStep = mapResumeStepToView(engagement?.resume_step);
  if (fromResumeStep) {
    return fromResumeStep;
  }

  const hasPackage = Number(engagement?.diagnostic_package_id) > 0;
  const hasMembers = Number(engagement?.participant_count) > 0;

  if (!hasMembers || !hasPackage) {
    return 'select';
  }
  if (!engagementHasAddress(engagement)) {
    return 'address';
  }
  if (!engagementHasSchedule(engagement)) {
    return 'schedule';
  }
  return 'details';
};

export const buildServiceAvailabilityMapFromEngagement = (engagement, userIds = []) => {
  const engagementId = Number(engagement?.engagement_id);
  if (!Number.isInteger(engagementId) || engagementId <= 0) {
    return {};
  }

  const availabilityEntry = {
    engagement_id: engagementId,
    zone_id: engagement?.healthians_zone_id ?? engagement?.zone_id ?? null,
    status: 'serviceable',
    user_id: null,
  };

  const map = {};
  userIds.forEach((userId) => {
    if (Number.isInteger(userId) && userId > 0) {
      map[userId] = { ...availabilityEntry, user_id: userId };
    }
  });

  return map;
};

export const getDraftParticipantUserIds = (engagement) => {
  const fromParticipants = Array.isArray(engagement?.participants)
    ? engagement.participants
      .map((participant) => Number(participant?.user_id))
      .filter((userId) => Number.isInteger(userId) && userId > 0)
    : [];

  if (fromParticipants.length) {
    return fromParticipants;
  }

  const count = Number(engagement?.participant_count);
  if (Number.isInteger(count) && count > 0) {
    return { fallbackCount: count };
  }

  return { fallbackCount: 1 };
};

export const matchScheduleDateId = (scheduleDates, engagement) => {
  const collectionDate = String(
    engagement?.blood_collection_date || engagement?.engagement_date || '',
  ).trim();

  if (!collectionDate) {
    return '';
  }

  const matched = scheduleDates.find((item) => item.isoDate === collectionDate);
  return matched?.id || '';
};

export const getDraftScheduleTimeLabel = (engagement) => {
  const collectionTime = engagement?.blood_collection_time_slot
    || engagement?.slot_start_time
    || engagement?.blood_collection_time;

  return formatApiSlotTimeToDisplay(collectionTime);
};

export const findPackageCardByDiagnosticPackageId = (packages, diagnosticPackageId) => {
  const targetId = Number(diagnosticPackageId);
  if (!Number.isInteger(targetId) || targetId <= 0) {
    return null;
  }

  return (Array.isArray(packages) ? packages : []).find((pkg) => {
    const packageId = Number(
      pkg?.apiData?.diagnostic_package_id
      ?? pkg?.apiData?.id
      ?? pkg?.diagnostic_package_id
      ?? pkg?.id
      ?? 0,
    );
    return packageId === targetId;
  }) || null;
};
