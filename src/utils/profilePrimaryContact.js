const PRIMARY_CONTACT_STORAGE_PREFIX = 'supershyft_primary_contact_v1_';

export const normalizeProfilePhone = (value) => {
  const digits = String(value || '').replace(/\D/g, '');
  if (!digits) {
    return '';
  }
  return digits.length > 10 ? digits.slice(-10) : digits;
};

export const normalizeProfileEmail = (value) => String(value || '').trim().toLowerCase();

const extractContactPhone = (profile) => (
  profile?.phone
  ?? profile?.phone_number
  ?? profile?.mobile
  ?? profile?.mobile_number
  ?? ''
);

const extractContactEmail = (profile) => (
  profile?.email
  ?? profile?.email_address
  ?? ''
);

export const isSubAccountProfile = (profile) => {
  if (!profile || typeof profile !== 'object') {
    return false;
  }

  const parentId = Number(profile?.parent_id || 0);
  if (parentId > 0) {
    return true;
  }

  const relationship = String(profile?.relationship || '').trim().toLowerCase();
  if (!relationship) {
    return false;
  }

  return relationship !== 'self'
    && relationship !== 'primary'
    && relationship !== 'primary account';
};

export const isPrimaryAccountProfile = (profile, linkedProfiles = []) => {
  if (!profile) {
    return false;
  }

  if (isSubAccountProfile(profile)) {
    return false;
  }

  const currentUserId = Number(profile?.user_id || profile?.id || 0);
  if (currentUserId <= 0) {
    return false;
  }

  if (!Array.isArray(linkedProfiles) || linkedProfiles.length === 0) {
    return true;
  }

  return linkedProfiles.every(
    (item) => Number(item?.parent_id || 0) === currentUserId,
  );
};

export const resolvePrimaryLinkedProfile = (profile, linkedProfiles = []) => {
  if (!profile || !Array.isArray(linkedProfiles) || linkedProfiles.length === 0) {
    return null;
  }

  const currentUserId = Number(profile?.user_id || profile?.id || 0);
  const parentId = Number(profile?.parent_id || 0);

  if (parentId > 0) {
    const parentProfile = linkedProfiles.find(
      (item) => Number(item?.user_id || item?.id || 0) === parentId,
    );
    if (parentProfile) {
      return parentProfile;
    }
  }

  return linkedProfiles.find((item) => {
    const linkedUserId = Number(item?.user_id || item?.id || 0);
    if (linkedUserId <= 0 || linkedUserId === currentUserId) {
      return false;
    }

    const relationship = String(item?.relationship || '').trim().toLowerCase();
    return relationship === 'self' || relationship === 'primary' || relationship === 'primary account';
  }) || null;
};

export const savePrimaryAccountContact = (profile) => {
  const userId = Number(profile?.user_id || profile?.id || 0);
  if (userId <= 0) {
    return;
  }

  const phone = normalizeProfilePhone(extractContactPhone(profile));
  const email = normalizeProfileEmail(extractContactEmail(profile));
  if (!phone && !email) {
    return;
  }

  try {
    window.localStorage.setItem(
      `${PRIMARY_CONTACT_STORAGE_PREFIX}${userId}`,
      JSON.stringify({ userId, phone, email }),
    );
  } catch {
    /* ignore quota / private mode */
  }
};

export const loadPrimaryAccountContact = (userId) => {
  const parsedUserId = Number(userId || 0);
  if (parsedUserId <= 0) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(`${PRIMARY_CONTACT_STORAGE_PREFIX}${parsedUserId}`);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      return null;
    }

    return {
      userId: Number(parsed.userId || parsedUserId),
      phone: normalizeProfilePhone(parsed.phone),
      email: normalizeProfileEmail(parsed.email),
    };
  } catch {
    return null;
  }
};

export const resolvePrimaryContactDetails = (profile, linkedProfiles = []) => {
  if (!profile || !isSubAccountProfile(profile)) {
    return null;
  }

  const primaryProfile = resolvePrimaryLinkedProfile(profile, linkedProfiles);
  const primaryUserId = Number(
    primaryProfile?.user_id
    || primaryProfile?.id
    || profile?.parent_id
    || 0,
  );
  const cached = primaryUserId > 0 ? loadPrimaryAccountContact(primaryUserId) : null;

  return {
    userId: primaryUserId,
    phone: normalizeProfilePhone(extractContactPhone(primaryProfile)) || cached?.phone || '',
    email: normalizeProfileEmail(extractContactEmail(primaryProfile)) || cached?.email || '',
  };
};

export const shouldShowSubAccountPhone = (profile, linkedProfiles = []) => {
  const phone = normalizeProfilePhone(extractContactPhone(profile));
  if (!phone) {
    return false;
  }

  if (!isSubAccountProfile(profile)) {
    return true;
  }

  const primaryContact = resolvePrimaryContactDetails(profile, linkedProfiles);
  if (!primaryContact?.phone) {
    return true;
  }

  return phone !== primaryContact.phone;
};

export const shouldShowSubAccountEmail = (profile, linkedProfiles = []) => {
  const email = normalizeProfileEmail(extractContactEmail(profile));
  if (!email) {
    return false;
  }

  if (!isSubAccountProfile(profile)) {
    return true;
  }

  const primaryContact = resolvePrimaryContactDetails(profile, linkedProfiles);
  if (!primaryContact?.email) {
    return true;
  }

  return email !== primaryContact.email;
};
