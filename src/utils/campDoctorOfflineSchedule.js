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

const isConsultationEntryForExpertType = (entry, expertType = 'doctor') => {
  const entryType = String(entry?.expert_type || 'doctor').toLowerCase();
  return entryType === String(expertType || 'doctor').toLowerCase();
};

export const parseDoctorOfflineSchedule = (engagementDetails, expertType = 'doctor') => {
  const consultationByDate = engagementDetails?.slot_detail?.consultation || {};
  const dateKeys = Object.keys(consultationByDate).sort();
  const dateOptions = dateKeys.map(parseApiDate);
  const cabinsByDate = {};
  const slotsByDate = {};
  let defaultSlotDuration = 30;

  dateKeys.forEach((dateKey) => {
    const entries = Array.isArray(consultationByDate[dateKey]) ? consultationByDate[dateKey] : [];
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

  return {
    dateOptions,
    cabinsByDate,
    slotsByDate,
    slotDurationMinutes: defaultSlotDuration,
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
