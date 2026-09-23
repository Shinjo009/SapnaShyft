/**
 * Frontend-only pincode ↔ city check via India Post public API.
 * GET https://api.postalpincode.in/pincode/{pincode}
 */

const INDIA_POST_PINCODE_URL = 'https://api.postalpincode.in/pincode';

const normalizePlace = (value) =>
  String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');

const collectPlaceLabels = (offices) => {
  const labels = new Set();
  (Array.isArray(offices) ? offices : []).forEach((office) => {
    if (!office || typeof office !== 'object') return;
    ['Name', 'District', 'Division', 'Region', 'Block', 'Circle'].forEach((key) => {
      const normalized = normalizePlace(office[key]);
      if (normalized) labels.add(normalized);
    });
  });
  return [...labels];
};

/**
 * @param {string} city
 * @param {string[]} placeLabels normalized labels from post offices
 */
export function cityMatchesPincodePlaces(city, placeLabels) {
  const needle = normalizePlace(city);
  if (!needle || needle.length < 2) return false;

  return placeLabels.some((label) => {
    if (!label) return false;
    if (label === needle) return true;
    // Allow "Mumbai" to match "Mumbai North West" / district names, etc.
    if (label.includes(needle) || needle.includes(label)) {
      return Math.min(label.length, needle.length) >= 3;
    }
    return false;
  });
}

/**
 * @param {string} pincode 6-digit Indian pincode
 * @returns {Promise<{ ok: true, places: string[] } | { ok: false, reason: 'invalid' | 'unavailable' }>}
 */
export async function lookupPincodePlaces(pincode) {
  const digits = String(pincode || '').replace(/\D/g, '').slice(0, 6);
  if (digits.length !== 6) {
    return { ok: false, reason: 'invalid' };
  }

  try {
    const response = await fetch(`${INDIA_POST_PINCODE_URL}/${digits}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) {
      return { ok: false, reason: 'unavailable' };
    }

    const payload = await response.json();
    const row = Array.isArray(payload) ? payload[0] : payload;
    const status = String(row?.Status || '').toLowerCase();
    const offices = row?.PostOffice;

    if (status !== 'success' || !Array.isArray(offices) || offices.length === 0) {
      return { ok: false, reason: 'invalid' };
    }

    return { ok: true, places: collectPlaceLabels(offices) };
  } catch {
    return { ok: false, reason: 'unavailable' };
  }
}

/**
 * @param {{ city?: string, pincode?: string }} data
 * @returns {Promise<null | { city?: string, pincode?: string }>}
 */
export async function validateCityMatchesPincode(data) {
  const city = String(data?.city || '').trim();
  const pincode = String(data?.pincode || '').trim();
  if (!city || !/^\d{6}$/.test(pincode)) {
    return null;
  }

  const result = await lookupPincodePlaces(pincode);
  if (!result.ok) {
    if (result.reason === 'invalid') {
      return { pincode: 'Invalid Format' };
    }
    return { pincode: 'Could not verify pincode. Try again.' };
  }

  if (!cityMatchesPincodePlaces(city, result.places)) {
    return { city: 'City does not match pincode' };
  }

  return null;
}
