const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const formatApiSlotToDisplay = (slot) => {
  const match = String(slot || '').match(/^(\d{1,2}):(\d{2})$/);
  if (!match) {
    return slot;
  }

  let hours = Number(match[1]);
  const mins = match[2];
  const period = hours >= 12 ? 'PM' : 'AM';
  if (hours === 0) {
    hours = 12;
  } else if (hours > 12) {
    hours -= 12;
  }
  return `${hours}:${mins} ${period}`;
};

export const formatDisplaySlotToApi = (slotLabel) => {
  const match = String(slotLabel || '').match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) {
    return slotLabel;
  }

  let hours = Number(match[1]);
  const mins = match[2];
  const period = match[3].toUpperCase();
  if (period === 'PM' && hours !== 12) {
    hours += 12;
  }
  if (period === 'AM' && hours === 12) {
    hours = 0;
  }
  return `${String(hours).padStart(2, '0')}:${mins}`;
};

const parseApiDate = (dateKey) => {
  const [year, month, day] = String(dateKey).split('-').map(Number);
  const date = new Date(year, (month || 1) - 1, day || 1);
  return {
    id: dateKey,
    apiDate: dateKey,
    day: DAY_SHORT[date.getDay()],
    number: day,
    month: MONTH_SHORT[(month || 1) - 1],
    year,
  };
};

/** Keep today and future calendar days; drop dates that are already gone. */
export const isConsultationDateKeyBookable = (dateKey, now = new Date()) => {
  const [year, month, day] = String(dateKey || '').split('-').map(Number);
  if (!year || !month || !day) {
    return false;
  }
  const dateStart = new Date(year, month - 1, day);
  dateStart.setHours(0, 0, 0, 0);
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  return dateStart.getTime() >= today.getTime();
};

const isConsultationEntryForExpertType = (entry, expertType = 'doctor') => {
  const entryType = String(entry?.expert_type || 'doctor').toLowerCase();
  return entryType === String(expertType || 'doctor').toLowerCase();
};

/**
 * Normalize per-date consultation payload.
 * Supports:
 * - Legacy: [ { cabin_key, available_slots, expert_type }, ... ]
 * - Current: { is_enable, cabins: [ ... ] }
 */
const extractConsultationCabinEntries = (datePayload) => {
  if (Array.isArray(datePayload)) {
    return datePayload;
  }

  if (!datePayload || typeof datePayload !== 'object') {
    return [];
  }

  if (datePayload.is_enable === false) {
    return [];
  }

  if (Array.isArray(datePayload.cabins)) {
    return datePayload.cabins;
  }

  return [];
};

export const parseDoctorOfflineSchedule = (engagementDetails, expertType = 'doctor') => {
  const consultationByDate = engagementDetails?.slot_detail?.consultation || {};
  const dateKeys = Object.keys(consultationByDate)
    .filter((dateKey) => isConsultationDateKeyBookable(dateKey))
    .sort();
  const cabinsByDate = {};
  const slotsByDate = {};
  let defaultSlotDuration = 30;

  dateKeys.forEach((dateKey) => {
    const entries = extractConsultationCabinEntries(consultationByDate[dateKey]);
    const doctorEntries = entries.filter((entry) => isConsultationEntryForExpertType(entry, expertType));

    cabinsByDate[dateKey] = doctorEntries.map((entry, index) => ({
      key: entry.cabin_key || `cabin-${index}`,
      label: entry.cabin_name || entry.cabin_key || `Cabin ${index + 1}`,
      slotDuration: Number(entry.slot_duration) > 0 ? Number(entry.slot_duration) : 30,
      availableSlots: (Array.isArray(entry.available_slots) ? entry.available_slots : [])
        .filter((slotItem) => (slotItem?.spot_left ?? 0) > 0)
        .map((slotItem) => ({
          apiSlot: slotItem.slot,
          displaySlot: formatApiSlotToDisplay(slotItem.slot),
          spotLeft: slotItem.spot_left,
        })),
    }));

    if (doctorEntries[0]?.slot_duration) {
      defaultSlotDuration = Number(doctorEntries[0].slot_duration) || defaultSlotDuration;
    }

    const slotMap = new Map();
    doctorEntries.forEach((entry) => {
      (Array.isArray(entry.available_slots) ? entry.available_slots : []).forEach((slotItem) => {
        if ((slotItem?.spot_left ?? 0) > 0 && slotItem?.slot) {
          slotMap.set(slotItem.slot, {
            apiSlot: slotItem.slot,
            displaySlot: formatApiSlotToDisplay(slotItem.slot),
            spotLeft: slotItem.spot_left,
          });
        }
      });
    });

    slotsByDate[dateKey] = Array.from(slotMap.values()).sort((a, b) => a.apiSlot.localeCompare(b.apiSlot));
  });

  const bookableDateKeys = dateKeys.filter((dateKey) => (slotsByDate[dateKey] || []).length > 0);
  const hasCabins = Object.values(cabinsByDate).some((cabins) => cabins.length > 0);

  return {
    dateOptions: bookableDateKeys.map(parseApiDate),
    cabinsByDate,
    slotsByDate,
    slotDurationMinutes: defaultSlotDuration,
    hasCabins,
  };
};

export const getOfflineCabinsForSelection = (schedule, selectedDate, selectedDisplaySlot) => {
  if (!schedule || !selectedDate?.apiDate || !selectedDisplaySlot) {
    return [];
  }

  const apiSlot = formatDisplaySlotToApi(selectedDisplaySlot);
  const cabins = schedule.cabinsByDate[selectedDate.apiDate] || [];

  return cabins
    .map((cabin) => {
      const matchingSlot = cabin.availableSlots.find((slotItem) => slotItem.apiSlot === apiSlot);
      return {
        ...cabin,
        available: Boolean(matchingSlot),
        spotLeft: matchingSlot?.spotLeft ?? 0,
      };
    })
    .filter((cabin) => cabin.available);
};

const normalizeOnlineSlotItem = (slotItem) => {
  if (typeof slotItem === 'string') {
    const apiSlot = slotItem.trim();
    if (!apiSlot) {
      return null;
    }
    return {
      apiSlot,
      displaySlot: formatApiSlotToDisplay(apiSlot),
      spotLeft: 1,
    };
  }

  if (!slotItem || typeof slotItem !== 'object') {
    return null;
  }

  const apiSlot = String(slotItem.slot || slotItem.time || slotItem.start_time || '').trim();
  if (!apiSlot) {
    return null;
  }

  const spotLeft = slotItem.spot_left
    ?? slotItem.spots_left
    ?? slotItem.available_spots
    ?? slotItem.available_slot;
  if (spotLeft != null && Number(spotLeft) <= 0) {
    return null;
  }
  if (slotItem.available === false) {
    return null;
  }

  const durationMinutes = Number(slotItem.duration || slotItem.slot_duration) > 0
    ? Number(slotItem.duration || slotItem.slot_duration)
    : null;

  return {
    apiSlot,
    displaySlot: formatApiSlotToDisplay(apiSlot),
    spotLeft: Number(spotLeft) > 0 ? Number(spotLeft) : 1,
    durationMinutes,
  };
};

const buildScheduleFromDateMap = (consultationByDate, slotDurationMinutes = 30) => {
  const dateKeys = Object.keys(consultationByDate || {})
    .filter((key) => /^\d{4}-\d{2}-\d{2}$/.test(key))
    .filter((key) => isConsultationDateKeyBookable(key))
    .sort();
  const slotsByDate = {};
  const cabinsByDate = {};
  let defaultSlotDuration = slotDurationMinutes;

  dateKeys.forEach((dateKey) => {
    const rawEntries = consultationByDate[dateKey];
    const slotList = Array.isArray(rawEntries) ? rawEntries : [];
    const slotMap = new Map();
    const cabinMap = new Map();

    slotList.forEach((entry) => {
      const normalized = normalizeOnlineSlotItem(entry);
      if (!normalized) {
        return;
      }

      if (normalized.durationMinutes) {
        defaultSlotDuration = normalized.durationMinutes;
      }

      slotMap.set(normalized.apiSlot, normalized);

      const cabinKey = entry?.cabin_key || entry?.cabin;
      if (cabinKey) {
        const cabinLabel = entry?.cabin_name || entry?.cabin_label || cabinKey;
        const cabinId = String(cabinKey);
        if (!cabinMap.has(cabinId)) {
          cabinMap.set(cabinId, {
            key: cabinId,
            label: String(cabinLabel),
            slotDuration: normalized.durationMinutes || defaultSlotDuration,
            availableSlots: [],
          });
        }
        cabinMap.get(cabinId).availableSlots.push(normalized);
      }
    });

    slotsByDate[dateKey] = Array.from(slotMap.values()).sort((a, b) => a.apiSlot.localeCompare(b.apiSlot));
    if (cabinMap.size > 0) {
      cabinsByDate[dateKey] = Array.from(cabinMap.values());
    }
  });

  const filteredDateKeys = dateKeys.filter((dateKey) => (slotsByDate[dateKey] || []).length > 0);
  const hasCabins = Object.values(cabinsByDate).some((cabins) => cabins.length > 0);

  return {
    dateOptions: filteredDateKeys.map(parseApiDate),
    cabinsByDate,
    slotsByDate,
    slotDurationMinutes: defaultSlotDuration,
    isOnline: true,
    hasCabins,
  };
};

const resolveExpertSlotsBlock = (root, expertType = 'doctor') => {
  const normalizedType = String(expertType || 'doctor').toLowerCase();
  const expertBlock = root?.[normalizedType];

  if (!expertBlock || typeof expertBlock !== 'object' || Array.isArray(expertBlock)) {
    return null;
  }

  const dateKeys = Object.keys(expertBlock).filter((key) => /^\d{4}-\d{2}-\d{2}$/.test(key));
  if (dateKeys.length === 0) {
    return null;
  }

  return expertBlock;
};

/** Parse GET /experts/consultations/slots into the shared schedule shape. */
export const parseOnlineConsultationSchedule = (slotsResponse, expertType = 'doctor') => {
  const root = slotsResponse?.data ?? slotsResponse ?? {};
  const expertBlock = resolveExpertSlotsBlock(root, expertType);

  if (expertBlock) {
    return buildScheduleFromDateMap(expertBlock);
  }

  const slotDurationMinutes = Number(
    root.slot_duration
    || root.slot_duration_minutes
    || root.default_slot_duration
    || 30,
  ) || 30;

  if (root?.slot_detail?.consultation) {
    const offline = parseDoctorOfflineSchedule({ slot_detail: root.slot_detail }, expertType);
    return {
      ...offline,
      isOnline: true,
      hasCabins: Object.values(offline.cabinsByDate || {}).some((cabins) => cabins.length > 0),
    };
  }

  const dateMapCandidate = [root.availability, root.slots, root.consultation, root.schedule]
    .find((candidate) => candidate && typeof candidate === 'object' && !Array.isArray(candidate));

  if (dateMapCandidate) {
    return buildScheduleFromDateMap(dateMapCandidate, slotDurationMinutes);
  }

  if (Array.isArray(root.dates)) {
    const consultationByDate = {};
    root.dates.forEach((entry) => {
      const dateKey = String(entry?.date || entry?.booking_date || '').slice(0, 10);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
        return;
      }
      consultationByDate[dateKey] = entry.available_slots || entry.slots || [];
    });
    return buildScheduleFromDateMap(consultationByDate, slotDurationMinutes);
  }

  const directDateMap = buildScheduleFromDateMap(root, slotDurationMinutes);
  if (directDateMap.dateOptions.length > 0) {
    return directDateMap;
  }

  return {
    dateOptions: [],
    cabinsByDate: {},
    slotsByDate: {},
    slotDurationMinutes,
    isOnline: true,
    hasCabins: false,
  };
};
