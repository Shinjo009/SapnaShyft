const normalizePart = (value) => String(value || '').trim();

export const MAX_USER_ADDRESSES = 3;

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

export const composeAddressString = ({ house, area, landmark, addressLine1, addressLine2 } = {}) => {
  const parts = [
    house || addressLine1,
    area || addressLine2,
    landmark,
  ].map((part) => normalizePart(part)).filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : null;
};

export const savedAddressToForm = (row) => ({
  house: normalizePart(row?.address_line1),
  area: normalizePart(row?.address_line2),
  landmark: normalizePart(row?.landmark),
  city: normalizePart(row?.city),
  state: normalizePart(row?.state),
  pincode: normalizePart(row?.pincode),
});

export const savedAddressToBookingForm = (row) => ({
  addressLine1: normalizePart(row?.address_line1),
  addressLine2: normalizePart(row?.address_line2),
  landmark: normalizePart(row?.landmark),
  city: normalizePart(row?.city),
  pincode: normalizePart(row?.pincode),
});

export const bookingFormToAddressPayload = (addressData) => ({
  address_line1: normalizePart(addressData?.addressLine1 || addressData?.house),
  address_line2: normalizePart(addressData?.addressLine2 || addressData?.area) || null,
  landmark: normalizePart(addressData?.landmark) || null,
  city: normalizePart(addressData?.city),
  state: normalizePart(addressData?.state) || null,
  pincode: normalizePart(addressData?.pincode),
});
