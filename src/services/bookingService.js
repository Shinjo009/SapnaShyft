/**
 * Bio-AI batch booking (packages flow).
 * POST /book/bio-ai — override path with REACT_APP_BOOK_BIO_AI_PATH if needed.
 */

import { authorizedRequest } from './apiClient';

const BOOK_BIO_AI_PATH =
  process.env.REACT_APP_BOOK_BIO_AI_PATH || '/book/bio-ai';

/**
 * Convert UI slot like "06:00 AM" to API format "6:00" (24h, minutes zero-padded).
 */
export const formatBloodCollectionTimeSlot = (selectedTimeSlot) => {
  if (!selectedTimeSlot || typeof selectedTimeSlot !== 'string') {
    return '';
  }
  const trimmed = selectedTimeSlot.trim();
  const parts = trimmed.split(/\s+/);
  if (parts.length < 2) {
    return '';
  }
  const meridiem = String(parts[parts.length - 1] || '').toUpperCase();
  const timeValue = parts.slice(0, -1).join(' ');
  const [hourText, minuteRaw = '0'] = timeValue.split(':');
  let hour24 = Number(hourText);
  const minutes = Number(String(minuteRaw).replace(/\D/g, '') || '0');
  if (!Number.isFinite(hour24) || !Number.isFinite(minutes)) {
    return '';
  }
  if (meridiem === 'PM' && hour24 !== 12) {
    hour24 += 12;
  }
  if (meridiem === 'AM' && hour24 === 12) {
    hour24 = 0;
  }
  return `${hour24}:${String(minutes).padStart(2, '0')}`;
};

const assertBioAiMember = (member, index) => {
  const label = `Member ${index + 1}`;
  if (!Number.isInteger(member.user_id) || member.user_id <= 0) {
    throw new Error(`${label}: missing or invalid user_id for booking.`);
  }
  if (!Number.isInteger(member.diagnostic_package_id) || member.diagnostic_package_id <= 0) {
    throw new Error(`${label}: missing or invalid diagnostic_package_id for booking.`);
  }
  if (!member.blood_collection_date) {
    throw new Error(`${label}: collection date is required.`);
  }
  if (!member.blood_collection_time_slot) {
    throw new Error(`${label}: collection time slot is required.`);
  }
  if (!String(member.address || '').trim()) {
    throw new Error(`${label}: address is required.`);
  }
  if (!String(member.pincode || '').trim()) {
    throw new Error(`${label}: pincode is required.`);
  }
  if (!String(member.city || '').trim()) {
    throw new Error(`${label}: city is required.`);
  }
};

/**
 * Build POST /book/bio-ai body from overlay selection (shared address/collection slot for all members).
 *
 * @param {object} params
 * @param {Array} params.selectedPatients
 * @param {object} params.addressData — house, area, landmark, city, pincode
 * @param {string} params.bloodCollectionDate — YYYY-MM-DD
 * @param {string} params.bloodCollectionTimeSlot — e.g. "9:00", "14:30"
 * @param {(patientId: string) => object} params.getPackageForPatient
 * @param {(patient: object) => number|null} params.getNumericPatientUserId
 */
export const buildBookBioAiPayload = ({
  selectedPatients,
  addressData,
  bloodCollectionDate,
  bloodCollectionTimeSlot,
  getPackageForPatient,
  getNumericPatientUserId,
}) => {
  if (!Array.isArray(selectedPatients) || selectedPatients.length === 0) {
    throw new Error('Select at least one member to book.');
  }

  const pincode = String(addressData?.pincode || '').trim();
  const city = String(addressData?.city || '').trim();
  const addressParts = [addressData?.house, addressData?.area, addressData?.landmark]
    .map((s) => String(s || '').trim())
    .filter(Boolean);
  const address = addressParts.join(', ');

  const members = selectedPatients.map((patient) => {
    const user_id = getNumericPatientUserId(patient);
    const memberPackage = getPackageForPatient(patient.id);
    const diagnostic_package_id = Number(
      memberPackage?.apiData?.diagnostic_package_id
        ?? memberPackage?.apiData?.id
        ?? memberPackage?.id
        ?? 0,
    );

    return {
      user_id,
      address,
      pincode,
      city,
      blood_collection_date: bloodCollectionDate,
      blood_collection_time_slot: bloodCollectionTimeSlot,
      diagnostic_package_id,
    };
  });

  members.forEach(assertBioAiMember);

  return { members };
};

/**
 * @param {{ members: Array<object> }} payload
 * @returns {Promise<unknown>} Parsed JSON body from server
 */
export async function bookBioAiBatch(payload) {
  return authorizedRequest(BOOK_BIO_AI_PATH, {
    method: 'POST',
    payload,
    missingAuthMessage: 'Please log in to complete booking.',
  });
}
