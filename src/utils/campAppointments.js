const STORAGE_KEY = 'ss-camp-appointments';
const SLOT_DURATION_MS = 15 * 60 * 1000;

const parseList = (raw) => {
  try {
    const parsed = JSON.parse(raw || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const readCampAppointments = () => {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const fromLocal = window.localStorage.getItem(STORAGE_KEY);
    if (fromLocal) {
      return parseList(fromLocal);
    }

    const fromSession = window.sessionStorage.getItem(STORAGE_KEY);
    if (fromSession) {
      window.localStorage.setItem(STORAGE_KEY, fromSession);
      return parseList(fromSession);
    }
  } catch {
    return [];
  }

  return [];
};

export const saveCampAppointment = (appointment) => {
  if (!appointment || typeof appointment !== 'object') {
    return readCampAppointments();
  }

  const next = [
    appointment,
    ...readCampAppointments().filter((item) => item.id !== appointment.id),
  ];

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Ignore quota / private-mode failures; in-memory state still works for this session.
  }

  return next;
};

export const getAppointmentEndMs = (appointment) => {
  const endsAt = Number(appointment?.endsAt || 0);
  if (endsAt > 0) {
    return endsAt;
  }

  const startsAt = Number(appointment?.startsAt || 0);
  return startsAt > 0 ? startsAt + SLOT_DURATION_MS : 0;
};

export const getUpcomingCampAppointment = (appointments = [], nowMs = Date.now()) => {
  return (Array.isArray(appointments) ? appointments : []).find((item) => {
    if (!item || item.status !== 'scheduled') {
      return false;
    }

    const endMs = getAppointmentEndMs(item);
    if (!endMs) {
      return true;
    }

    return endMs > nowMs;
  }) || null;
};
