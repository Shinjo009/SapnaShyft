const normalizePart = (value) => String(value || '').trim();

export const formatProfileAddressDisplay = (profile) => {
  const addressText = normalizePart(profile?.address);
  const city = normalizePart(profile?.city);

  const parts = [];
  if (addressText) {
    parts.push(addressText);
  }
  if (city && !parts.includes(city)) {
    parts.push(city);
  }

  return parts.length > 0 ? parts.join(', ') : '-';
};
