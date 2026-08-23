import { getEngagementConsultation } from '../services/engagementsService';
import { peekMyAssessmentsRowsCached } from '../services/reportService';
import { formatApiSlotToDisplay } from './campDoctorOfflineSchedule';
import { resolveActiveEngagementIdFromAssessments } from './campDoctorConsultationEligibility';

const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const EXPERT_META = {
  doctor: {
    title: 'Doctor Consultation',
    category: 'doctor',
    accent: 'teal',
    subtitle: null,
  },
  nutritionist: {
    title: 'Nutrition Consultation',
    category: 'nutritionist',
    accent: 'teal',
    subtitle: 'Clinical Nutritionist',
  },
};

const formatCabinDisplay = (cabin) => {
  const value = String(cabin || '').trim();
  if (!value) {
    return undefined;
  }
  if (/^cabin\s/i.test(value)) {
    return value;
  }
  if (/^\d+$/.test(value)) {
    return `Cabin ${value}`;
  }
  return value;
};

const formatWhenLabel = (dateStr, slotStr) => {
  if (!dateStr || !slotStr) {
    return '';
  }

  const [year, month, day] = String(dateStr).split('-').map(Number);
  if (!year || !month || !day) {
    return formatApiSlotToDisplay(slotStr);
  }

  const date = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  const diffDays = Math.round((date.getTime() - today.getTime()) / 86400000);
  const timeLabel = formatApiSlotToDisplay(slotStr);

  if (diffDays === 0) {
    return `Today, ${timeLabel}`;
  }
  if (diffDays === 1) {
    return `Tomorrow, ${timeLabel}`;
  }

  return `${DAY_SHORT[date.getDay()]}, ${timeLabel}`;
};

const MONTH_LONG = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const formatNotesWhenLabel = (dateStr, slotStr) => {
  if (!dateStr) {
    return formatApiSlotToDisplay(slotStr) || '';
  }

  const [year, month, day] = String(dateStr).split('-').map(Number);
  if (!year || !month || !day) {
    return formatApiSlotToDisplay(slotStr) || '';
  }

  const timeLabel = formatApiSlotToDisplay(slotStr);
  const dateLabel = `${day} ${MONTH_LONG[month - 1]} ${year}`;
  return timeLabel ? `${dateLabel}, ${timeLabel}` : dateLabel;
};

const resolveExpertName = (item, expertType) => {
  const name = item?.expert_name
    || item?.doctor_name
    || item?.nutritionist_name
    || item?.expert?.name
    || item?.expert?.full_name;

  if (name) {
    return String(name).trim();
  }

  if (expertType === 'nutritionist') {
    return 'Clinical Nutritionist';
  }

  return 'Doctor Consultation';
};

const normalizeAttachments = (attachments) => {
  if (!attachments) {
    return [];
  }

  if (Array.isArray(attachments)) {
    return attachments
      .map((item, index) => {
        if (!item) {
          return null;
        }
        if (typeof item === 'string') {
          return {
            id: `attachment-${index}`,
            label: 'Prescription',
            fileType: 'PDF',
            sizeLabel: null,
            url: item,
          };
        }

        const url = item.url || item.file_url || item.download_url || null;
        const sizeBytes = Number(item.size || item.file_size || 0);
        let sizeLabel = item.size_label || null;
        if (!sizeLabel && Number.isFinite(sizeBytes) && sizeBytes > 0) {
          const mb = sizeBytes / (1024 * 1024);
          sizeLabel = mb >= 1 ? `${mb.toFixed(0)}Mb` : `${Math.max(1, Math.round(sizeBytes / 1024))}Kb`;
        }

        return {
          id: item.id || `attachment-${index}`,
          label: item.label || item.name || item.file_name || 'Prescription',
          fileType: item.file_type || item.type || 'PDF',
          sizeLabel,
          url,
        };
      })
      .filter(Boolean);
  }

  if (typeof attachments === 'string') {
    return [{
      id: 'attachment-0',
      label: 'Prescription',
      fileType: 'PDF',
      sizeLabel: null,
      url: attachments,
    }];
  }

  return [];
};

const resolveCompletedBadge = (item) => {
  const attachments = normalizeAttachments(item?.attachments);
  if (attachments.length > 0) {
    return {
      label: `${attachments.length} Attachment${attachments.length === 1 ? '' : 's'}`,
      icon: 'attachment',
    };
  }

  if (item?.consultation_summary) {
    return {
      label: 'Prescription Available',
      icon: 'prescription',
    };
  }

  return null;
};

const resolveConsultationStatus = (item) => {
  if (item?.done === true) {
    return 'completed';
  }

  if (item?.date && item?.slot) {
    return 'scheduled';
  }

  return null;
};

export const mapMyConsultationsToAppointments = (myConsultations = []) => {
  return (Array.isArray(myConsultations) ? myConsultations : [])
    .map((item) => {
      const status = resolveConsultationStatus(item);
      if (!status) {
        return null;
      }

      const expertType = String(item?.expert_type || '').toLowerCase();
      const meta = EXPERT_META[expertType] || {
        title: 'Consultation',
        category: expertType || 'doctor',
        accent: 'teal',
        subtitle: null,
      };

      const appointment = {
        id: `consultation-${item.consultation_id}`,
        consultationId: item.consultation_id,
        status,
        category: meta.category,
        accent: meta.accent,
        expertType,
        expertName: resolveExpertName(item, expertType),
        whenLabel: formatWhenLabel(item.date, item.slot),
        notesWhenLabel: formatNotesWhenLabel(item.date, item.slot),
        title: meta.title,
        subtitle: meta.subtitle,
        cabinLabel: formatCabinDisplay(item.cabin),
        apiDate: item.date,
        apiSlot: item.slot,
        consultationSummary: item.consultation_summary || null,
        attachments: normalizeAttachments(item.attachments),
        showInfo: status === 'scheduled',
      };

      if (status === 'completed') {
        const statusBadge = resolveCompletedBadge(item);
        if (statusBadge) {
          appointment.statusBadge = statusBadge;
        }
      }

      return appointment;
    })
    .filter(Boolean)
    .sort((a, b) => {
      if (!a.apiDate || !b.apiDate) {
        return 0;
      }
      const dateCompare = a.apiDate.localeCompare(b.apiDate);
      if (dateCompare !== 0) {
        return dateCompare;
      }
      return String(a.apiSlot || '').localeCompare(String(b.apiSlot || ''));
    });
};

export const fetchMyConsultationAppointments = async ({ ttlMs = 45000 } = {}) => {
  const rows = await peekMyAssessmentsRowsCached(ttlMs).catch(() => []);
  const engagementId = resolveActiveEngagementIdFromAssessments(rows);

  if (!engagementId) {
    return [];
  }

  const consultation = await getEngagementConsultation(engagementId);
  return mapMyConsultationsToAppointments(consultation?.my_consultations);
};
