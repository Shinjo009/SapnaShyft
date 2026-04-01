import React, { useMemo, useState } from 'react';
import './AllAppointmentsPage.css';

const FILTER_LABEL = '6 Months';

const TAB_KEYS = {
  UPCOMING: 'upcoming',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

const TABS = [
  { key: TAB_KEYS.UPCOMING, label: 'Upcoming' },
  { key: TAB_KEYS.COMPLETED, label: 'Completed' },
  { key: TAB_KEYS.CANCELLED, label: 'Cancelled' },
];

const APPOINTMENTS_BY_TAB = {
  [TAB_KEYS.UPCOMING]: [
    {
      id: 'u-1',
      category: 'Doctor Consultation',
      title: 'Dr. Sarah Jenkins',
      dateTime: 'Oct 24, 2023 • 10:00 AM',
      mode: 'Video Call',
      amount: 'Rs. 299/-',
      accent: 'green',
      action: 'Join Call',
      actionVariant: 'green',
      categoryIcon: 'doctor',
      actionIcon: 'video',
      showInfo: true,
      secondaryAction: 'Reschedule',
      secondaryActionVariant: 'green',
      secondaryActionIcon: 'clock',
    },
    {
      id: 'u-2',
      category: 'Blood Test',
      title: 'Complete Blood Count',
      dateTime: 'Oct 20, 2023 • 08:30 AM',
      mode: 'Home Collection',
      amount: 'Rs. 2,999',
      accent: 'green',
      action: 'Reschedule',
      actionVariant: 'green',
      categoryIcon: 'blood',
      actionIcon: 'clock',
      showInfo: true,
    },
  ],
  [TAB_KEYS.COMPLETED]: [
    {
      id: 'c-1',
      category: 'Doctor Consultation',
      title: 'Dr. Sarah Jenkins',
      dateTime: 'Oct 24, 2023 • 10:00 AM',
      mode: 'Video Call',
      amount: 'Rs. 299',
      accent: 'yellow',
      action: 'View Prescription',
      actionVariant: 'yellow',
      categoryIcon: 'doctor',
      actionIcon: 'document',
    },
    {
      id: 'c-2',
      category: 'Blood Test',
      title: 'Complete Blood Count',
      dateTime: 'Oct 20, 2023 • 08:30 AM',
      mode: 'Home Collection',
      amount: 'Rs. 2,999',
      accent: 'blue',
      action: 'View Report',
      actionVariant: 'blue',
      categoryIcon: 'blood',
      actionIcon: 'document',
      showInfo: true,
    },
  ],
  [TAB_KEYS.CANCELLED]: [
    {
      id: 'x-1',
      category: 'Doctor Consultation',
      title: 'Dr. Mark Davis',
      dateTime: 'Oct 15, 2023 • 04:00 PM',
      mode: 'Video Call',
      amount: 'Rs. 299',
      accent: 'red',
      action: 'View Details',
      actionVariant: 'grey',
      categoryIcon: 'doctor',
      actionIcon: 'info',
    },
  ],
};

const FilterArrowIcon = () => (
  <svg width="8" height="5" viewBox="0 0 8 5" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M0.75 0.75L3.75 3.75L6.75 0.75" stroke="#E4FFFE" strokeOpacity="0.5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const DoctorIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M7.33398 1.33337V2.66671M3.33398 1.33337V2.66671M3.33398 2.00004H2.66732C1.93143 2.00004 1.33398 2.59749 1.33398 3.33337V6.00004C1.33398 8.2077 3.12632 10 5.33398 10C7.54164 10 9.33398 8.2077 9.33398 6.00004V3.33337C9.33398 2.59749 8.73654 2.00004 8.00065 2.00004H7.33398" stroke="white" strokeOpacity="0.7" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M5.33398 10C5.33398 12.2077 7.12632 14 9.33398 14C11.5416 14 13.334 12.2077 13.334 10V8" stroke="white" strokeOpacity="0.7" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 6.66671C12 7.40259 12.5974 8.00004 13.3333 8.00004C14.0692 8.00004 14.6667 7.40259 14.6667 6.66671C14.6667 5.93082 14.0692 5.33337 13.3333 5.33337C12.5974 5.33337 12 5.93082 12 6.66671V6.66671" stroke="white" strokeOpacity="0.7" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const BloodTestIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M6 1.33325H10" stroke="white" strokeOpacity="0.7" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M7 1.33325V5.33325L3.31085 11.4818C2.50782 12.8202 3.47195 14.5333 5.03205 14.5333H10.9679C12.5281 14.5333 13.4922 12.8202 12.6891 11.4818L9 5.33325V1.33325" stroke="white" strokeOpacity="0.7" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M5.33398 1.33337V4.00004M10.6673 1.33337V4.00004" stroke="white" strokeOpacity="0.5" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3.33333 2.66663H12.6667C13.4026 2.66663 14 3.26407 14 3.99996V13.3333C14 14.0692 13.4026 14.6666 12.6667 14.6666H3.33333C2.59745 14.6666 2 14.0692 2 13.3333V3.99996C2 3.26407 2.59745 2.66663 3.33333 2.66663V2.66663" stroke="white" strokeOpacity="0.5" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M2 6.66663H14" stroke="white" strokeOpacity="0.5" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const VideoCallIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M10.668 8.66664L14.15 10.988C14.2522 11.056 14.3837 11.0623 14.492 11.0043C14.6003 10.9463 14.6679 10.8335 14.668 10.7106V5.24664C14.668 5.12726 14.6042 5.01697 14.5007 4.95751C14.3972 4.89804 14.2697 4.89847 14.1666 4.95864L10.668 6.99997" stroke="white" strokeOpacity="0.5" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M2.66732 4H9.33398C10.0699 4 10.6673 4.59745 10.6673 5.33333V10.6667C10.6673 11.4026 10.0699 12 9.33398 12H2.66732C1.93143 12 1.33398 11.4026 1.33398 10.6667V5.33333C1.33398 4.59745 1.93143 4 2.66732 4V4" stroke="white" strokeOpacity="0.5" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const HomeCollectionIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M2 7.00008L8 2.33325L14 7.00008" stroke="white" strokeOpacity="0.5" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3.33398 6.66675V13.3334C3.33398 13.7016 3.63246 14.0001 4.00065 14.0001H12.0007C12.3688 14.0001 12.6673 13.7016 12.6673 13.3334V6.66675" stroke="white" strokeOpacity="0.5" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6.66602 14V9.33325H9.33268V14" stroke="white" strokeOpacity="0.5" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const MoneyIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <g clipPath="url(#money-clip)">
      <path fillRule="evenodd" clipRule="evenodd" d="M11.5 14C13.99 14 16 13 16 11.5V2C16 1 14 0 11.5 0C9 0 7 1 7 2V5.5C8.17 5.99 9.17 6.81 9.88 7.85C10.37 7.946 10.91 7.999 11.5 7.999C12.81 7.999 13.9 7.738 14.68 7.313C14.7907 7.25214 14.8985 7.18606 15.003 7.115V8.495C15.003 8.73 14.816 9.095 14.201 9.431C13.605 9.756 12.691 9.995 11.501 9.995C11.263 9.995 11.0363 9.986 10.821 9.968C10.901 10.2967 10.9543 10.6333 10.981 10.978C11.1497 10.9873 11.323 10.992 11.501 10.992C12.811 10.992 13.901 10.731 14.681 10.306C14.7917 10.2451 14.8995 10.1791 15.004 10.108V11.488C15.004 11.724 14.855 12.074 14.213 12.42C13.581 12.76 12.633 12.988 11.503 12.988C11.273 12.988 11.0503 12.9787 10.835 12.96C10.7581 13.2924 10.6548 13.6181 10.526 13.934C10.8407 13.9693 11.166 13.987 11.502 13.987L11.5 14ZM14.2 6.44C14.815 6.104 15.002 5.739 15.002 5.504V4.124C14.8987 4.19467 14.791 4.26067 14.679 4.322C13.901 4.747 12.809 5.008 11.499 5.008C10.189 5.008 9.099 4.747 8.319 4.322C8.20827 4.26114 8.10048 4.19506 7.996 4.124V5.504C7.996 5.739 8.183 6.104 8.798 6.439C9.394 6.764 10.308 7.003 11.498 7.003C12.688 7.003 13.598 6.764 14.198 6.439L14.2 6.44ZM8 2.5C8 2.212 8.125 1.935 8.358 1.766C8.485 1.674 8.623 1.582 8.732 1.532C9.005 1.406 10.372 0.999 11.502 0.999C12.632 0.999 13.612 1.226 14.272 1.532C14.396 1.589 14.533 1.678 14.654 1.766C14.885 1.933 15.004 2.208 15.004 2.493V2.499C15.004 2.734 14.817 3.099 14.202 3.435C13.606 3.76 12.692 3.999 11.502 3.999C10.312 3.999 9.402 3.759 8.802 3.435C8.187 3.1 8 2.734 8 2.5Z" fill="white" fillOpacity="0.5" />
      <path fillRule="evenodd" clipRule="evenodd" d="M9 11.5C9 13.99 6.99 16 4.5 16C2.01 16 0 13.99 0 11.5C0 9.01 2.01 7 4.5 7C6.99 7 9 9.01 9 11.5ZM8 11.5C8 13.43 6.43 15 4.5 15C2.57 15 1 13.43 1 11.5C1 9.57 2.57 8 4.5 8C6.43 8 8 9.57 8 11.5Z" fill="white" fillOpacity="0.5" />
    </g>
    <defs>
      <clipPath id="money-clip">
        <rect width="16" height="16" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

const ActionVideoIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <g clipPath="url(#action-video-clip)">
      <path d="M12 9.74995L15.9172 12.3615C16.0323 12.438 16.1802 12.4451 16.302 12.3799C16.4238 12.3146 16.4999 12.1877 16.5 12.0495V5.90245C16.5 5.76815 16.4283 5.64408 16.3118 5.57718C16.1953 5.51028 16.052 5.51077 15.936 5.57845L12 7.87495" stroke="#34D399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 4.5H10.5C11.3279 4.5 12 5.17213 12 6V12C12 12.8279 11.3279 13.5 10.5 13.5H3C2.17213 13.5 1.5 12.8279 1.5 12V6C1.5 5.17213 2.17213 4.5 3 4.5V4.5" stroke="#34D399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </g>
    <defs>
      <clipPath id="action-video-clip">
        <rect width="18" height="18" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

const ActionClockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M9 16.5C13.1421 16.5 16.5 13.1421 16.5 9C16.5 4.85786 13.1421 1.5 9 1.5C4.85786 1.5 1.5 4.85786 1.5 9C1.5 13.1421 4.85786 16.5 9 16.5Z" stroke="#2DD4BF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9 5.5V9L11.5 10.5" stroke="#2DD4BF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ActionDocumentIcon = ({ color = '#60A5FA' }) => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M4.5 16.5C3.67213 16.5 3 15.8279 3 15V3C3 2.17213 3.67213 1.5 4.5 1.5H10.5C10.9795 1.49923 11.4395 1.68982 11.778 2.0295L14.469 4.7205C14.8096 5.05909 15.0008 5.51974 15 6V15C15 15.8279 14.3279 16.5 13.5 16.5H4.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M10.5 1.5V5.25C10.5 5.66394 10.8361 6 11.25 6H15M7.5 6.75H6M12 9.75H6M12 12.75H6" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ActionInfoIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <g clipPath="url(#action-info-clip)">
      <path d="M1.5 9C1.5 13.1394 4.86064 16.5 9 16.5C13.1394 16.5 16.5 13.1394 16.5 9C16.5 4.86064 13.1394 1.5 9 1.5C4.86064 1.5 1.5 4.86064 1.5 9V9" stroke="#E2E8F0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 12V9M9 6H9.0075" stroke="#E2E8F0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </g>
    <defs>
      <clipPath id="action-info-clip">
        <rect width="18" height="18" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

const CardInfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path d="M7 0C8.85652 0 10.637 0.737498 11.9497 2.05025C13.2625 3.36301 14 5.14348 14 7C14 8.85652 13.2625 10.637 11.9497 11.9497C10.637 13.2625 8.85652 14 7 14C5.14348 14 3.36301 13.2625 2.05025 11.9497C0.737498 10.637 0 8.85652 0 7C0 5.14348 0.737498 3.36301 2.05025 2.05025C3.36301 0.737498 5.14348 0 7 0ZM8.05 4.29688C8.57031 4.29688 8.99219 3.9375 8.99219 3.40156C8.99219 2.86563 8.57031 2.50625 8.05 2.50625C7.52969 2.50625 7.10938 2.86563 7.10938 3.40156C7.10938 3.9375 7.53125 4.29844 8.05 4.29844M8.23281 9.925C8.23281 9.81875 8.27031 9.54063 8.24844 9.38125L7.42656 10.3281C7.25625 10.5063 7.04375 10.6312 6.94375 10.5984C6.89862 10.5816 6.86096 10.5492 6.83749 10.5071C6.81403 10.4651 6.80627 10.416 6.81563 10.3687L8.18437 6.04063C8.29688 5.49062 7.98906 4.99062 7.33594 4.92656C6.64844 4.92656 5.63281 5.625 5.01562 6.5125C5.01562 6.61875 4.99531 6.88125 5.01562 7.04062L5.8375 6.09375C6.00938 5.91563 6.20625 5.79062 6.30625 5.825C6.35491 5.84336 6.39467 5.87968 6.41734 5.92648C6.44002 5.97328 6.44387 6.027 6.42812 6.07656L5.06875 10.3844C4.9125 10.8875 5.20937 11.3812 5.92969 11.4937C6.99062 11.4937 7.61719 10.8125 8.23438 9.925H8.23281Z" fill="white"/>
  </svg>
);

const InfoBubbleShape = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="226" height="73" viewBox="0 0 226 73" fill="none" aria-hidden="true">
    <path d="M0 21.2254C0 14.598 5.37258 9.22539 12 9.22539H200.979C200.979 9.22539 207.978 9.22539 212.978 9.22539C216.477 9.22539 218.977 6.21686 224.476 0.802322C224.981 0.305929 225.321 0.0825171 225.549 0.019497C226.257 -0.175756 225.844 1.14597 225.583 1.83194C224.719 4.09427 222.644 9.55775 221.477 12.8353C220.3 16.1388 219.977 27.2748 219.977 27.2748V61C219.977 67.6274 214.604 73 207.977 73H12C5.37257 73 0 67.6274 0 61V21.2254Z" fill="#063533"/>
    <path d="M219.477 27.2676V61C219.477 67.3513 214.328 72.5 207.977 72.5H12C5.64873 72.5 0.500002 67.3513 0.5 61V21.2256C0.5 14.8743 5.64873 9.72559 12 9.72559H212.978C214.894 9.72559 216.504 8.89272 218.293 7.43164C220.067 5.98311 222.098 3.84487 224.827 1.1582C225.08 0.909277 225.272 0.750719 225.412 0.651367C225.356 0.963272 225.23 1.35317 225.115 1.65332C224.252 3.9146 222.175 9.38423 221.006 12.668C220.692 13.5488 220.446 14.911 220.25 16.4209C220.053 17.9428 219.901 19.6556 219.787 21.2588C219.673 22.8628 219.595 24.3625 219.546 25.4609C219.521 26.0101 219.504 26.4593 219.493 26.7715C219.488 26.9276 219.484 27.0499 219.481 27.1328C219.48 27.1743 219.479 27.2061 219.479 27.2275C219.478 27.2382 219.478 27.2465 219.478 27.252V27.2598L219.977 27.2744L219.478 27.2607L219.477 27.2676Z" stroke="white" strokeOpacity="0.3"/>
  </svg>
);

const getCategoryIcon = (type) => {
  if (type === 'blood') {
    return <BloodTestIcon />;
  }

  return <DoctorIcon />;
};

const getModeIcon = (mode) => {
  if (mode === 'Home Collection') {
    return <HomeCollectionIcon />;
  }

  return <VideoCallIcon />;
};

const getActionIcon = (actionIcon, actionVariant) => {
  if (actionIcon === 'clock') {
    return <ActionClockIcon />;
  }

  if (actionIcon === 'document') {
    return <ActionDocumentIcon color={actionVariant === 'yellow' ? '#DAC15A' : '#60A5FA'} />;
  }

  if (actionIcon === 'info') {
    return <ActionInfoIcon />;
  }

  return <ActionVideoIcon />;
};

const AllAppointmentsPage = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState(TAB_KEYS.UPCOMING);
  const [infoOpenAppointmentId, setInfoOpenAppointmentId] = useState(null);

  const visibleAppointments = useMemo(() => {
    return APPOINTMENTS_BY_TAB[activeTab] || [];
  }, [activeTab]);

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
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <h1 className="all-appointments-page__title">All Appointments</h1>
        </div>

        <button className="all-appointments-page__filter" type="button" aria-label="Filter by date range">
          <span>{FILTER_LABEL}</span>
          <FilterArrowIcon />
        </button>
      </div>

      <div className="all-appointments-page__tabs" role="tablist" aria-label="Appointment status tabs">
        {TABS.map((tab) => {
          const isActive = tab.key === activeTab;

          return (
            <button
              key={tab.key}
              className={`all-appointments-page__tab ${isActive ? 'all-appointments-page__tab--active' : ''}`}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => {
                setActiveTab(tab.key);
                setInfoOpenAppointmentId(null);
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="all-appointments-page__cards">
        {visibleAppointments.map((appointment) => {
          const canShowInfo = activeTab === TAB_KEYS.UPCOMING && appointment.showInfo;
          const isInfoOpen = canShowInfo && infoOpenAppointmentId === appointment.id;

          return (
          <article className={`all-appointments-page__card ${isInfoOpen ? 'all-appointments-page__card--info-open' : ''}`} key={appointment.id}>
            <span
              className={`all-appointments-page__card-accent all-appointments-page__card-accent--${appointment.accent}`}
              aria-hidden="true"
            />

            <div className="all-appointments-page__card-top-row">
              <div className="all-appointments-page__category">
                {getCategoryIcon(appointment.categoryIcon)}
                <span>{appointment.category}</span>
              </div>

              {canShowInfo ? (
                <button
                  type="button"
                  className="all-appointments-page__card-info-btn"
                  aria-label="Appointment details"
                  onClick={() => setInfoOpenAppointmentId((prev) => (prev === appointment.id ? null : appointment.id))}
                >
                  <CardInfoIcon />
                </button>
              ) : null}
            </div>

            {isInfoOpen ? (
              <div className="all-appointments-page__info-popup" role="status" aria-live="polite">
                <span className="all-appointments-page__info-popup-bg" aria-hidden="true">
                  <InfoBubbleShape />
                </span>
                <div className="all-appointments-page__info-popup-content">
                  <span className="all-appointments-page__info-popup-icon" aria-hidden="true">
                    <CardInfoIcon />
                  </span>
                  <p className="all-appointments-page__info-popup-text">
                    Rescheduling or cancellation is allowed till 4 hours before the appointment
                  </p>
                </div>
              </div>
            ) : null}

            <h2 className="all-appointments-page__doctor-name">{appointment.title}</h2>

            <div className="all-appointments-page__meta-row">
              <span className="all-appointments-page__meta-item">
                <CalendarIcon />
                <span>{appointment.dateTime}</span>
              </span>
            </div>

            <div className="all-appointments-page__meta-row all-appointments-page__meta-row--split">
              <span className="all-appointments-page__meta-item">
                {getModeIcon(appointment.mode)}
                <span>{appointment.mode}</span>
              </span>

              <span className="all-appointments-page__meta-item all-appointments-page__meta-item--amount">
                <MoneyIcon />
                <span>{appointment.amount}</span>
              </span>
            </div>

            <button
              className={`all-appointments-page__action-btn all-appointments-page__action-btn--${appointment.actionVariant}`}
              type="button"
            >
              {getActionIcon(appointment.actionIcon, appointment.actionVariant)}
              <span>{appointment.action}</span>
            </button>

            {appointment.secondaryAction ? (
              <button
                className={`all-appointments-page__action-btn all-appointments-page__action-btn--${appointment.secondaryActionVariant || 'green'}`}
                type="button"
              >
                {getActionIcon(appointment.secondaryActionIcon || 'clock', appointment.secondaryActionVariant || 'green')}
                <span>{appointment.secondaryAction}</span>
              </button>
            ) : null}
          </article>
        );})}
      </div>
    </div>
  );
};

export default AllAppointmentsPage;