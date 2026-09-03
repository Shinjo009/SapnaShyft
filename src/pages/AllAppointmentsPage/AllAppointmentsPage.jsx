import React, { useEffect, useMemo, useState } from 'react';
import './AllAppointmentsPage.css';
import { fetchMyConsultationAppointments } from '../../utils/myConsultationsAppointments';
import backIcon from '../../images/AllAppointments/back.svg';
import homeIcon from '../../images/AllAppointments/home.svg';
import videoIcon from '../../images/AllAppointments/video.svg';
import attachmentIcon from '../../images/AllAppointments/attachment.svg';
import prescriptionIcon from '../../images/AllAppointments/prescription.svg';
import chevronIcon from '../../images/AllAppointments/chevron.svg';
import cabinIcon from '../../images/AllAppointments/cabin.svg';

const STATUS_TABS = [
  { key: 'scheduled', label: 'Scheduled' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

const CATEGORY_CHIPS = [
  { key: 'all', label: 'All' },
  { key: 'doctor', label: 'Doctor' },
  { key: 'nutritionist', label: 'Nutritionist' },
  { key: 'blood', label: 'Blood test' },
];

const SCHEDULED_SAMPLE_APPOINTMENTS = [
  {
    id: 'scheduled-blood-sample',
    status: 'scheduled',
    category: 'blood',
    accent: 'blue',
    whenLabel: 'Tuesday, 7:30 AM',
    title: 'Blood Collection',
    subtitle: 'Complete Blood Count',
    cabinLabel: 'Cabin 10',
    showInfo: true,
  },
  {
    id: 'scheduled-nutrition-sample',
    status: 'scheduled',
    category: 'nutritionist',
    accent: 'teal',
    whenLabel: 'Wednesday, 10:00 AM',
    title: 'Nutrition Consultation',
    subtitle: 'Clinical Nutritionist',
    cabinLabel: 'Cabin 11',
    showInfo: true,
  },
];

const CANCELLED_SAMPLE_APPOINTMENTS = [
  {
    id: 'cancelled-blood-sample',
    status: 'cancelled',
    category: 'blood',
    accent: 'blue',
    cancelReason: 'Cancelled',
    whenLabel: 'Today, 7:30 AM',
    title: 'Blood Collection',
    subtitle: 'Complete Blood Count',
    mode: 'Home Collection',
    modeIcon: 'home',
    primaryAction: 'Book Again',
  },
  {
    id: 'cancelled-doctor-sample',
    status: 'cancelled',
    category: 'doctor',
    accent: 'teal',
    cancelReason: 'Missed',
    whenLabel: 'Today, 10:00 AM',
    title: 'Doctor Consultation',
    personName: 'Dr. Priya Nair',
    personRole: 'General Physician',
    mode: 'Video Consultation',
    modeIcon: 'video',
    primaryAction: 'Book Again',
    secondaryAction: 'Reschedule',
  },
  {
    id: 'cancelled-program-sample',
    status: 'cancelled',
    category: 'nutritionist',
    accent: 'amber',
    cancelReason: 'Incomplete',
    whenLabel: 'Today, 1:00 PM',
    kind: 'program',
    title: 'Nutrition Program',
    subtitle: 'Weekly Nutrition Coaching with Dr. Priya Nair',
    progressPercent: 25,
    primaryAction: 'Open Program',
    secondaryAction: 'Message',
  },
];

const COMPLETED_SAMPLE_APPOINTMENTS = [
  {
    id: 'completed-blood-sample',
    status: 'completed',
    category: 'blood',
    accent: 'blue',
    statusBadge: { label: '2 Attachments', icon: 'attachment' },
    title: 'Blood Collection',
    subtitle: 'Complete Blood Count',
    mode: 'Home Collection',
    modeIcon: 'home',
  },
  {
    id: 'completed-doctor-sample',
    status: 'completed',
    category: 'doctor',
    accent: 'teal',
    statusBadge: { label: 'Prescription Available', icon: 'prescription' },
    title: 'Doctor Consultation',
    personName: 'Dr. Priya Nair',
    personRole: 'General Physician',
    mode: 'Video Consultation',
    modeIcon: 'video',
  },
];

const getStatusBadgeIcon = (icon) => {
  if (icon === 'prescription') {
    return prescriptionIcon;
  }
  return attachmentIcon;
};

const getDetailIcon = (modeIcon) => {
  if (modeIcon === 'home') {
    return homeIcon;
  }
  if (modeIcon === 'video') {
    return videoIcon;
  }
  return cabinIcon;
};

const getDetailIconClass = (modeIcon) => {
  if (modeIcon === 'home') {
    return 'all-appointments-page__icon-box--home';
  }
  if (modeIcon === 'video') {
    return 'all-appointments-page__icon-box--video';
  }
  return 'all-appointments-page__icon-box--cabin';
};

const formatCabinLabel = (cabinId) => {
  const id = Number(cabinId);
  return id > 0 ? `Cabin ${id}` : undefined;
};

const normalizeScheduledAppointment = (item) => {
  const status = item?.status || 'scheduled';
  if (status !== 'scheduled') {
    return item;
  }

  const next = { ...item };
  delete next.primaryAction;
  delete next.secondaryAction;

  if (next.category === 'doctor') {
    delete next.pendingDetails;
    delete next.pendingDetailsText;
  }

  if (next.cabinId) {
    next.cabinLabel = formatCabinLabel(next.cabinId);
    delete next.mode;
    delete next.modeIcon;
    return next;
  }

  if (next.cabinLabel) {
    const cabinMatch = String(next.cabinLabel).match(/^Cabin(?:\s+No\.)?\s*(\d+)$/i);
    if (cabinMatch) {
      next.cabinId = Number(cabinMatch[1]);
      next.cabinLabel = formatCabinLabel(next.cabinId);
    } else if (next.cabinLabel === 'Cabin') {
      delete next.cabinLabel;
    }
    delete next.mode;
    delete next.modeIcon;
    return next;
  }

  if (next.category === 'doctor' && next.mode === 'Video Consultation') {
    delete next.mode;
    delete next.modeIcon;
  }

  return next;
};

const AllAppointmentsPage = ({ onBack, appointments = [] }) => {
  const [activeStatus, setActiveStatus] = useState('scheduled');
  const [activeCategory, setActiveCategory] = useState('all');
  const [consultationAppointments, setConsultationAppointments] = useState([]);
  const [isLoadingConsultations, setIsLoadingConsultations] = useState(true);
  const [hasLoadedConsultations, setHasLoadedConsultations] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadConsultations = async () => {
      setIsLoadingConsultations(true);
      try {
        const items = await fetchMyConsultationAppointments();
        if (!cancelled) {
          setConsultationAppointments(items);
        }
      } catch (error) {
        console.error('Failed to load consultation appointments:', error);
        if (!cancelled) {
          setConsultationAppointments([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingConsultations(false);
          setHasLoadedConsultations(true);
        }
      }
    };

    void loadConsultations();

    return () => {
      cancelled = true;
    };
  }, []);

  const mergedAppointments = useMemo(() => {
    const apiAppointments = consultationAppointments.map(normalizeScheduledAppointment);

    if (hasLoadedConsultations) {
      if (apiAppointments.length > 0) {
        return apiAppointments;
      }

      return appointments.map(normalizeScheduledAppointment);
    }

    let result = appointments.map(normalizeScheduledAppointment);
    if (!appointments.some((item) => (item.status || 'scheduled') === 'scheduled')) {
      result = [...result, ...SCHEDULED_SAMPLE_APPOINTMENTS];
    }
    if (!appointments.some((item) => item.status === 'completed')) {
      result = [...result, ...COMPLETED_SAMPLE_APPOINTMENTS];
    }
    if (!appointments.some((item) => item.status === 'cancelled')) {
      result = [...result, ...CANCELLED_SAMPLE_APPOINTMENTS];
    }
    return result;
  }, [appointments, consultationAppointments, hasLoadedConsultations]);

  const visibleAppointments = useMemo(() => {
    return mergedAppointments.filter((item) => {
      const matchesStatus = (item.status || 'scheduled') === activeStatus;
      const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
      return matchesStatus && matchesCategory;
    });
  }, [mergedAppointments, activeStatus, activeCategory]);

  const renderScheduledCard = (appointment, accent, kind) => {
    const detailLabel = appointment.cabinLabel || appointment.locationLabel;

    return (
      <>
        <div className="all-appointments-page__card-main">
          <div className="all-appointments-page__card-top">
            {kind === 'program' ? (
              <div className="all-appointments-page__badges">
                {appointment.weekLabel ? (
                  <span className="all-appointments-page__badge all-appointments-page__badge--amber">
                    {appointment.weekLabel}
                  </span>
                ) : null}
                {appointment.nextSessionLabel ? (
                  <span className="all-appointments-page__badge all-appointments-page__badge--muted">
                    {appointment.nextSessionLabel}
                  </span>
                ) : null}
              </div>
            ) : (
              <span className={`all-appointments-page__when all-appointments-page__when--${accent}`}>
                {appointment.whenLabel}
              </span>
            )}
          </div>

          <div className="all-appointments-page__card-copy">
            <h2 className="all-appointments-page__card-title all-appointments-page__card-title--scheduled">
              {appointment.title}
            </h2>

            {appointment.pendingDetails ? (
              <p className="all-appointments-page__subtitle">
                {appointment.pendingDetailsText || 'Doctor details will be shared soon.'}
              </p>
            ) : appointment.personName ? (
              <p className="all-appointments-page__person">
                <span>{appointment.personName}</span>
                {appointment.personRole ? (
                  <span className="all-appointments-page__person-role">({appointment.personRole})</span>
                ) : null}
              </p>
            ) : appointment.subtitle ? (
              <p className="all-appointments-page__subtitle">{appointment.subtitle}</p>
            ) : null}

            {detailLabel ? (
              <div className="all-appointments-page__detail-line all-appointments-page__detail-line--scheduled">
                <span className="all-appointments-page__icon-box all-appointments-page__icon-box--cabin">
                  <img src={cabinIcon} alt="" />
                </span>
                <span>{detailLabel}</span>
              </div>
            ) : null}
          </div>
        </div>

        {kind === 'program' && typeof appointment.progressPercent === 'number' ? (
          <div className="all-appointments-page__progress">
            <div className="all-appointments-page__progress-row">
              <span>CURRENT PROGRESS</span>
              <span className="all-appointments-page__progress-value">{appointment.progressPercent}%</span>
            </div>
            <div className="all-appointments-page__progress-track">
              <span
                className="all-appointments-page__progress-fill"
                style={{ width: `${Math.max(0, Math.min(100, appointment.progressPercent))}%` }}
              />
            </div>
          </div>
        ) : null}
      </>
    );
  };

  const renderCancelledCard = (appointment, accent, kind) => {
    const detailLabel = appointment.mode || appointment.locationLabel || appointment.cabinLabel;
    const actionCount = [appointment.primaryAction, appointment.secondaryAction].filter(Boolean).length;
    const primaryClass = `all-appointments-page__action all-appointments-page__action--${accent}`;
    const whenClass = `all-appointments-page__when all-appointments-page__when--${accent} all-appointments-page__when--faded${accent === 'amber' ? ' all-appointments-page__when--faded-amber' : ''}`;

    return (
      <>
        <div className="all-appointments-page__cancel-badges">
          {appointment.whenLabel ? (
            <span className={whenClass}>{appointment.whenLabel}</span>
          ) : null}
          {appointment.cancelReason ? (
            <span className="all-appointments-page__cancel-badge">{appointment.cancelReason}</span>
          ) : null}
        </div>

        <h2 className="all-appointments-page__card-title all-appointments-page__card-title--cancelled">
          {appointment.title}
        </h2>

        {appointment.personName ? (
          <p className="all-appointments-page__person">
            <span>{appointment.personName}</span>
            {appointment.personRole ? (
              <span className="all-appointments-page__person-role">({appointment.personRole})</span>
            ) : null}
          </p>
        ) : appointment.subtitle ? (
          <p className={`all-appointments-page__subtitle${kind === 'program' ? ' all-appointments-page__subtitle--program-cancelled' : ''}`}>
            {appointment.subtitle}
          </p>
        ) : null}

        {detailLabel ? (
          <div className="all-appointments-page__detail-line all-appointments-page__detail-line--cancelled">
            <span className={`all-appointments-page__icon-box ${getDetailIconClass(appointment.modeIcon)}`}>
              <img src={getDetailIcon(appointment.modeIcon)} alt="" />
            </span>
            <span>{detailLabel}</span>
          </div>
        ) : null}

        {kind === 'program' && typeof appointment.progressPercent === 'number' ? (
          <div className="all-appointments-page__progress all-appointments-page__progress--cancelled">
            <div className="all-appointments-page__progress-row">
              <span>CURRENT PROGRESS</span>
              <span className="all-appointments-page__progress-value">{appointment.progressPercent}%</span>
            </div>
            <div className="all-appointments-page__progress-track">
              <span
                className="all-appointments-page__progress-fill"
                style={{ width: `${Math.max(0, Math.min(100, appointment.progressPercent))}%` }}
              />
            </div>
          </div>
        ) : null}

        <div className={`all-appointments-page__actions all-appointments-page__actions--cancelled${kind === 'program' ? ' all-appointments-page__actions--program' : ''}${actionCount === 1 ? ' all-appointments-page__actions--single' : ''}`}>
          {appointment.primaryAction ? (
            <button className={primaryClass} type="button">
              {appointment.primaryAction}
            </button>
          ) : null}
          {appointment.secondaryAction ? (
            <button className="all-appointments-page__action all-appointments-page__action--ghost" type="button">
              {appointment.secondaryAction}
            </button>
          ) : null}
        </div>
      </>
    );
  };

  const renderCompletedCard = (appointment, accent) => {
    const badge = appointment.statusBadge;
    const detailLabel = appointment.mode || appointment.locationLabel || appointment.cabinLabel;

    return (
      <>
        <div className="all-appointments-page__card-body">
          {badge ? (
            <div className="all-appointments-page__card-top">
              <span className={`all-appointments-page__status-badge all-appointments-page__status-badge--${accent}`}>
                <img
                  src={getStatusBadgeIcon(badge.icon)}
                  alt=""
                  className={`all-appointments-page__status-badge-icon all-appointments-page__status-badge-icon--${badge.icon}`}
                />
                <span>{badge.label}</span>
              </span>
            </div>
          ) : null}

          <h2 className="all-appointments-page__card-title all-appointments-page__card-title--completed">
            {appointment.title}
          </h2>

          {appointment.personName ? (
            <p className="all-appointments-page__person">
              <span>{appointment.personName}</span>
              {appointment.personRole ? (
                <span className="all-appointments-page__person-role">({appointment.personRole})</span>
              ) : null}
            </p>
          ) : appointment.subtitle ? (
            <p className="all-appointments-page__subtitle">{appointment.subtitle}</p>
          ) : null}

          {detailLabel ? (
            <div className="all-appointments-page__detail-line all-appointments-page__detail-line--completed">
              <span className={`all-appointments-page__icon-box ${getDetailIconClass(appointment.modeIcon)}`}>
                <img src={getDetailIcon(appointment.modeIcon)} alt="" />
              </span>
              <span>{detailLabel}</span>
            </div>
          ) : null}
        </div>

        <button type="button" className="all-appointments-page__chevron-btn" aria-label="View appointment details">
          <img src={chevronIcon} alt="" className="all-appointments-page__chevron-img" />
        </button>
      </>
    );
  };

  return (
    <div className="all-appointments-page">
      <div className="all-appointments-page__header-row">
        <div className="all-appointments-page__header-left">
          <button
            className="all-appointments-page__back-btn"
            onClick={onBack}
            aria-label="Go back"
            type="button"
          >
            <img src={backIcon} alt="" className="all-appointments-page__back-img" />
          </button>
          <h1 className="all-appointments-page__title">All Appointments</h1>
        </div>
        <button className="all-appointments-page__range-btn" type="button" aria-label="Filter by last 6 months">
          <span>6 Months</span>
          <span className="all-appointments-page__range-caret" aria-hidden="true" />
        </button>
      </div>

      <div className="all-appointments-page__filters">
        <div className="all-appointments-page__status-wrap">
          <div className="all-appointments-page__tabs" role="tablist" aria-label="Appointment status tabs">
            {STATUS_TABS.map((tab) => {
              const isActive = tab.key === activeStatus;
              return (
                <button
                  key={tab.key}
                  className={`all-appointments-page__tab${isActive ? ' is-active' : ''}`}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => {
                    setActiveStatus(tab.key);
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="all-appointments-page__chips" role="tablist" aria-label="Appointment type filters">
          {CATEGORY_CHIPS.map((chip) => {
            const isActive = chip.key === activeCategory;
            return (
              <button
                key={chip.key}
                className={`all-appointments-page__chip${isActive ? ' is-active' : ''}`}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => {
                  setActiveCategory(chip.key);
                }}
              >
                {chip.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className={`all-appointments-page__list${visibleAppointments.length === 0 ? ' is-empty' : ''}`}>
        {isLoadingConsultations ? (
          <div className="all-appointments-page__empty" role="status">
            <p className="all-appointments-page__empty-title">Loading appointments...</p>
          </div>
        ) : null}

        {!isLoadingConsultations && visibleAppointments.length === 0 ? (
          <div className="all-appointments-page__empty" role="status">
            <p className="all-appointments-page__empty-title">No appointments yet.</p>
            <p className="all-appointments-page__empty-sub">They will appear here when booked</p>
          </div>
        ) : null}

        {!isLoadingConsultations ? visibleAppointments.map((appointment) => {
          const accent = appointment.accent || 'teal';
          const kind = appointment.kind || 'consult';
          const status = appointment.status || 'scheduled';
          const isCompleted = status === 'completed';
          const isCancelled = status === 'cancelled';

          let cardContent;
          if (isCompleted) {
            cardContent = renderCompletedCard(appointment, accent);
          } else if (isCancelled) {
            cardContent = renderCancelledCard(appointment, accent, kind);
          } else {
            cardContent = renderScheduledCard(appointment, accent, kind);
          }

          return (
            <div className="all-appointments-page__row" key={appointment.id}>
              <div className="all-appointments-page__rail" aria-hidden="true">
                <span className={`all-appointments-page__dot all-appointments-page__dot--${accent}`} />
              </div>

              <article className={`all-appointments-page__card${isCompleted ? ' all-appointments-page__card--completed' : ''}${isCancelled ? ' all-appointments-page__card--cancelled' : ''}${status === 'scheduled' ? ' all-appointments-page__card--scheduled' : ''}`}>
                {cardContent}
              </article>
            </div>
          );
        }) : null}
      </div>
    </div>
  );
};

export default AllAppointmentsPage;
