import { authorizedRequest } from './apiClient';

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
  if (!cabinKey) {
    throw new Error('Cabin is required.');
  }
  if (!bookingSlot) {
    throw new Error('Consultation slot is required.');
  }
  if (!type) {
    throw new Error('Expert type is required.');
  }

  const parsedBody = await authorizedRequest('/experts/consultations/book', {
    method: 'POST',
    payload: {
      engagement_id: engagement,
      expert_type: type,
      date: bookingDate,
      cabin: cabinKey,
      slot: bookingSlot,
    },
  });

  return parsedBody?.data ?? parsedBody;
};
