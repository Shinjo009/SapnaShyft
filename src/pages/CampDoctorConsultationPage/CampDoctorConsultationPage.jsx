import React, { useEffect, useMemo, useState } from 'react';
import './CampDoctorConsultationPage.css';
import appointmentIcon from '../../images/home-book-appointment.svg';
import closeIcon from '../../images/camp-doctor-close.svg';
import calendarIcon from '../../images/camp-doctor-calendar.svg';
import clockIcon from '../../images/camp-doctor-clock.svg';
import checkIcon from '../../images/camp-doctor-check.svg';
import dateCardIcon from '../../images/camp-doctor-date.svg';
import timeCardIcon from '../../images/camp-doctor-time.svg';
import sparkleIcon from '../../images/camp-doctor-sparkle.svg';

const TIME_SLOTS = [
  '09:00 AM', '09:15 AM', '09:30 AM', '09:45 AM',
  '10:00 AM', '10:15 AM', '10:30 AM', '10:45 AM',
  '11:00 AM', '11:15 AM', '11:30 AM', '11:45 AM',
  '12:00 PM', '12:15 PM', '12:30 PM', '12:45 PM',
  '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
  '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM',
  '06:00 PM', '06:30 PM',
];

const DAY_PARTS = [
  { id: 'morning', label: 'Morning', startHour: 9, endHour: 12 },
  { id: 'noon', label: 'Noon', startHour: 12, endHour: 14 },
  { id: 'afternoon', label: 'Afternoon', startHour: 14, endHour: 17 },
  { id: 'evening', label: 'Evening', startHour: 17, endHour: 19 },
];

const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const ordinal = (n) => {
  const v = n % 100;
  if (v >= 11 && v <= 13) {
    return `${n}th`;
  }
  switch (n % 10) {
    case 1:
      return `${n}st`;
    case 2:
      return `${n}nd`;
    case 3:
      return `${n}rd`;
    default:
      return `${n}th`;
  }
};

const buildUpcomingDates = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  return Array.from({ length: 4 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return {
      id: `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`,
      day: DAY_SHORT[date.getDay()],
      number: date.getDate(),
      month: MONTH_SHORT[date.getMonth()],
      year: date.getFullYear(),
    };
  });
};

const addMinutesToSlot = (slotLabel, minutes = 15) => {
  const match = String(slotLabel || '').match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) {
    return slotLabel;
  }
  let hours = Number(match[1]);
  const mins = Number(match[2]);
  const period = match[3].toUpperCase();
  if (period === 'PM' && hours !== 12) {
    hours += 12;
  }
  if (period === 'AM' && hours === 12) {
    hours = 0;
  }
  const total = hours * 60 + mins + minutes;
  const endHours24 = Math.floor(total / 60) % 24;
  const endMins = total % 60;
  const endPeriod = endHours24 >= 12 ? 'PM' : 'AM';
  const endHours12 = endHours24 % 12 === 0 ? 12 : endHours24 % 12;
  return `${endHours12}:${String(endMins).padStart(2, '0')} ${endPeriod}`;
};

const formatSlotStart = (slotLabel) => {
  const match = String(slotLabel || '').match(/^0?(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) {
    return slotLabel;
  }
  return `${Number(match[1])}:${match[2]}`;
};

const formatSlotDisplay = (slotLabel) => {
  const match = String(slotLabel || '').match(/^0?(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) {
    return slotLabel;
  }
  return `${Number(match[1])}:${match[2]} ${match[3].toUpperCase()}`;
};

const SLOT_DURATION_MS = 15 * 60 * 1000;

const slotToMinutes = (slotLabel) => {
  const match = String(slotLabel || '').match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) {
    return 0;
  }
  let hours = Number(match[1]);
  const mins = Number(match[2]);
  const period = match[3].toUpperCase();
  if (period === 'PM' && hours !== 12) {
    hours += 12;
  }
  if (period === 'AM' && hours === 12) {
    hours = 0;
  }
  return hours * 60 + mins;
};

const toAppointmentStart = (date, slotLabel) => {
  const monthIndex = MONTH_SHORT.indexOf(date?.month);
  const start = new Date(
    date?.year || new Date().getFullYear(),
    monthIndex >= 0 ? monthIndex : new Date().getMonth(),
    date?.number || new Date().getDate(),
  );
  const minutes = slotToMinutes(slotLabel);
  start.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
  return start;
};

const formatWhenLabel = (date, slotLabel) => {
  const time = formatSlotDisplay(slotLabel);
  if (!date) {
    return time;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const booked = toAppointmentStart(date, '12:00 AM');
  booked.setHours(0, 0, 0, 0);
  const diffDays = Math.round((booked.getTime() - today.getTime()) / 86400000);

  if (diffDays === 0) {
    return `Today, ${time}`;
  }
  if (diffDays === 1) {
    return `Tomorrow, ${time}`;
  }
  return `${date.day}, ${time}`;
};

const formatReminderDate = (date) => {
  if (!date) {
    return '';
  }
  return `${date.day}, ${date.number} ${date.month}`;
};

const formatCabinLabel = (cabinId) => {
  const id = Number(cabinId);
  return id > 0 ? `Cabin ${id}` : undefined;
};

const buildCampDoctorAppointment = (date, slotLabel, cabinId) => {
  const start = toAppointmentStart(date, slotLabel);
  const startsAt = start.getTime();

  return {
    id: `camp-doctor-${date?.id || 'slot'}-${slotLabel}`,
    status: 'scheduled',
    category: 'doctor',
    kind: 'consult',
    accent: 'teal',
    whenLabel: formatWhenLabel(date, slotLabel),
    reminderTime: slotLabel,
    reminderDate: formatReminderDate(date),
    startsAt,
    endsAt: startsAt + SLOT_DURATION_MS,
    title: 'Doctor Consultation',
    cabinId,
    cabinLabel: formatCabinLabel(cabinId),
    showInfo: true,
  };
};

/**
 * Camp-only doctor booking card + Schedule Appointment sheet.
 * Enable/disable via CAMP_DOCTOR_CONSULTATION_ENABLED (or comment the App.js block).
 */
const CABINS = [
  { id: 1, label: 'Cabin 1', available: true },
  { id: 2, label: 'Cabin 2', available: false },
  { id: 3, label: 'Cabin 3', available: true },
  { id: 4, label: 'Cabin 4', available: true },
  { id: 5, label: 'Cabin 5', available: true },
  { id: 6, label: 'Cabin 6', available: true },
  { id: 7, label: 'Cabin 7', available: true },
  { id: 8, label: 'Cabin 8', available: true },
  { id: 9, label: 'Cabin 9', available: true },
];

const CampDoctorConsultationPage = ({
  onAppointmentBooked,
  onViewAppointment,
}) => {
  const dates = useMemo(() => buildUpcomingDates(), []);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isCabinOpen, setIsCabinOpen] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [selectedCabin, setSelectedCabin] = useState(1);
  const [nowMs, setNowMs] = useState(() => Date.now());

  const firstBookable = useMemo(() => {
    const now = new Date();
    for (const date of dates) {
      const slot = TIME_SLOTS.find((item) => toAppointmentStart(date, item).getTime() > now.getTime());
      if (slot) {
        return { dateId: date.id, slot };
      }
    }
    return { dateId: dates[0]?.id || '', slot: TIME_SLOTS[0] };
  }, [dates]);

  const [selectedDateId, setSelectedDateId] = useState(firstBookable.dateId);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(firstBookable.slot);
  const [selectedDayPart, setSelectedDayPart] = useState('morning');

  useEffect(() => {
    const timerId = window.setInterval(() => setNowMs(Date.now()), 30000);
    return () => window.clearInterval(timerId);
  }, []);

  const selectedDate = dates.find((item) => item.id === selectedDateId) || dates[0];
  const availableSlots = useMemo(() => {
    const part = DAY_PARTS.find((p) => p.id === selectedDayPart);
    return TIME_SLOTS.filter((slot) => {
      if (selectedDate && toAppointmentStart(selectedDate, slot).getTime() <= nowMs) {
        return false;
      }
      if (part) {
        const mins = slotToMinutes(slot);
        const hour = Math.floor(mins / 60);
        if (hour < part.startHour || hour >= part.endHour) {
          return false;
        }
      }
      return true;
    });
  }, [selectedDate, nowMs, selectedDayPart]);

  useEffect(() => {
    if (availableSlots.length > 0 && !availableSlots.includes(selectedTimeSlot)) {
      setSelectedTimeSlot(availableSlots[0]);
    }
  }, [availableSlots, selectedTimeSlot]);
  const slotSummary = selectedDate
    ? `${ordinal(selectedDate.number)} ${selectedDate.month}  |  ${formatSlotStart(selectedTimeSlot)} - ${addMinutesToSlot(selectedTimeSlot, 15)}`
    : '';
  const confirmedDateText = selectedDate
    ? `${selectedDate.month} ${selectedDate.number}, ${selectedDate.year}`
    : '';
  const confirmedTimeText = formatSlotDisplay(selectedTimeSlot);

  const closeSchedule = () => {
    setIsScheduleOpen(false);
    setIsCabinOpen(false);
    setIsConfirmed(false);
  };

  const persistAppointment = () => {
    const appointment = buildCampDoctorAppointment(selectedDate, selectedTimeSlot, selectedCabin);
    onAppointmentBooked?.(appointment);
    return appointment;
  };

  return (
    <>
      {!isScheduleOpen ? (
        <div className="camp-doctor-consult" role="dialog" aria-label="Camp doctor consultation">
          <section className="camp-doctor-consult__card">
            <div className="camp-doctor-consult__copy">
              <div className="camp-doctor-consult__headline">
                <span className="camp-doctor-consult__icon" aria-hidden="true">
                  <img src={appointmentIcon} alt="" className="camp-doctor-consult__icon-img" />
                </span>
                <div className="camp-doctor-consult__titles">
                  <h2 className="camp-doctor-consult__title">Book Your 1:1 Doctor</h2>
                  <p className="camp-doctor-consult__kicker">Complimentary Consultation</p>
                </div>
              </div>
              <p className="camp-doctor-consult__lede">
                Tailored nutrition, designed around your body and lifestyle
              </p>
            </div>
            <button type="button" className="camp-doctor-consult__cta" onClick={() => setIsScheduleOpen(true)}>
              Book Now
            </button>
          </section>
        </div>
      ) : null}

      {isCabinOpen ? (
        <div className="camp-doctor-schedule" role="dialog" aria-modal="true" aria-label={isConfirmed ? 'Appointment confirmed' : 'Select cabin'}>
          <button
            type="button"
            className="camp-doctor-schedule__backdrop"
            aria-label="Close"
            onClick={closeSchedule}
          />
          <div className="camp-doctor-schedule__stack">
            <button
              type="button"
              className="camp-doctor-schedule__close"
              aria-label="Close"
              onClick={closeSchedule}
            >
              <img src={closeIcon} alt="" className="camp-doctor-schedule__close-img" />
            </button>
            <div className={`camp-doctor-schedule__sheet${isConfirmed ? ' is-confirmed' : ''}`}>
              {isConfirmed ? (
                <div className="camp-doctor-confirm">
                  <div className="camp-doctor-confirm__hero">
                    <div className="camp-doctor-confirm__check" aria-hidden="true">
                      <img src={checkIcon} alt="" className="camp-doctor-confirm__check-img" />
                    </div>
                    <h2 className="camp-doctor-confirm__title">Appointment Confirmed</h2>
                    <p className="camp-doctor-confirm__lede">Doctor details will be shared soon.</p>
                  </div>

                  <div className="camp-doctor-confirm__details">
                    <div className="camp-doctor-confirm__meta">
                      <div className="camp-doctor-confirm__meta-card">
                        <span className="camp-doctor-confirm__meta-icon camp-doctor-confirm__meta-icon--date" aria-hidden="true">
                          <img src={dateCardIcon} alt="" />
                        </span>
                        <p className="camp-doctor-confirm__meta-label">Date</p>
                        <p className="camp-doctor-confirm__meta-value">{confirmedDateText}</p>
                      </div>
                      <div className="camp-doctor-confirm__meta-card">
                        <span className="camp-doctor-confirm__meta-icon camp-doctor-confirm__meta-icon--time" aria-hidden="true">
                          <img src={timeCardIcon} alt="" />
                        </span>
                        <p className="camp-doctor-confirm__meta-label">Time</p>
                        <p className="camp-doctor-confirm__meta-value">{confirmedTimeText}</p>
                      </div>
                    </div>
                    <div className="camp-doctor-confirm__banner">
                      <span className="camp-doctor-confirm__banner-icon" aria-hidden="true">
                        <img src={sparkleIcon} alt="" />
                      </span>
                      <p className="camp-doctor-confirm__banner-text">
                        You will be allotted the best match doctor.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="camp-doctor-confirm__cta"
                    onClick={() => {
                      persistAppointment();
                      closeSchedule();
                      onViewAppointment?.();
                    }}
                  >
                    View Appointment
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="camp-doctor-schedule__title">Select Cabin</h2>

                  <div className="camp-doctor-schedule__label">
                    <span className="camp-doctor-schedule__label-icon" aria-hidden="true">🚪</span>
                    <span>Available Cabins</span>
                  </div>

                  <div className="camp-doctor-cabin__grid">
                    {CABINS.map((cabin) => {
                      const isSelected = cabin.id === selectedCabin;
                      return (
                        <button
                          key={cabin.id}
                          type="button"
                          className={`camp-doctor-cabin__btn${isSelected ? ' is-selected' : ''}${!cabin.available ? ' is-disabled' : ''}`}
                          disabled={!cabin.available}
                          onClick={() => setSelectedCabin(cabin.id)}
                        >
                          {cabin.label}
                        </button>
                      );
                    })}
                  </div>

                  <div className="camp-doctor-schedule__footer">
                    <div className="camp-doctor-schedule__footer-copy">
                      <p className="camp-doctor-schedule__footer-label">Cabin selected</p>
                      <p className="camp-doctor-schedule__footer-value">Cabin {selectedCabin}</p>
                    </div>
                    <button
                      type="button"
                      className="camp-doctor-schedule__confirm"
                      onClick={() => {
                        persistAppointment();
                        setIsConfirmed(true);
                      }}
                    >
                      Confirm
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {isScheduleOpen ? (
        <div className="camp-doctor-schedule" role="dialog" aria-modal="true" aria-label="Schedule appointment">
          <button
            type="button"
            className="camp-doctor-schedule__backdrop"
            aria-label="Close schedule appointment"
            onClick={closeSchedule}
          />
          <div className="camp-doctor-schedule__stack">
            <button
              type="button"
              className="camp-doctor-schedule__close"
              aria-label="Close schedule appointment"
              onClick={closeSchedule}
            >
              <img src={closeIcon} alt="" className="camp-doctor-schedule__close-img" />
            </button>
            <div className="camp-doctor-schedule__sheet">
              <h2 className="camp-doctor-schedule__title">Schedule Appointment</h2>

              <div className="camp-doctor-schedule__label">
                <span className="camp-doctor-schedule__label-icon" aria-hidden="true">
                  <img src={calendarIcon} alt="" />
                </span>
                <span>Preferred Date</span>
              </div>
              <div className="camp-doctor-schedule__dates">
                {dates.map((item) => {
                  const isSelected = item.id === selectedDateId;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={`camp-doctor-schedule__date${isSelected ? ' is-selected' : ''}`}
                      onClick={() => {
                        setSelectedDateId(item.id);
                        const nextSlot = TIME_SLOTS.find((slot) => toAppointmentStart(item, slot).getTime() > nowMs);
                        if (nextSlot) {
                          setSelectedTimeSlot(nextSlot);
                        }
                      }}
                    >
                      <span className="camp-doctor-schedule__date-day">{item.day}</span>
                      <span className="camp-doctor-schedule__date-number">{item.number}</span>
                    </button>
                  );
                })}
              </div>

              <div className="camp-doctor-schedule__daypart">
                <div className="camp-doctor-schedule__label">
                  <span className="camp-doctor-schedule__label-icon camp-doctor-schedule__label-icon--sun" aria-hidden="true">☀</span>
                  <span>Select part of the day</span>
                </div>
                <div className="camp-doctor-schedule__daypart-grid">
                  {DAY_PARTS.map((part) => (
                    <button
                      key={part.id}
                      type="button"
                      className={`camp-doctor-schedule__daypart-btn${part.id === selectedDayPart ? ' is-selected' : ''}`}
                      onClick={() => setSelectedDayPart(part.id)}
                    >
                      {part.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="camp-doctor-schedule__time-head">
                <div className="camp-doctor-schedule__label">
                  <span className="camp-doctor-schedule__label-icon" aria-hidden="true">
                    <img src={clockIcon} alt="" />
                  </span>
                  <span>Preferred Time Slot</span>
                </div>
                <p className="camp-doctor-schedule__time-note">Each appointment is around 15-minutes</p>
              </div>

              <div className="camp-doctor-schedule__slots-wrap">
                <div className="camp-doctor-schedule__slots">
                  {availableSlots.map((slot) => {
                    const isSelected = slot === selectedTimeSlot;
                    return (
                      <button
                        key={slot}
                        type="button"
                        className={`camp-doctor-schedule__slot${isSelected ? ' is-selected' : ''}`}
                        onClick={() => setSelectedTimeSlot(slot)}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="camp-doctor-schedule__footer">
                <div className="camp-doctor-schedule__footer-copy">
                  <p className="camp-doctor-schedule__footer-label">Slot selected</p>
                  <p className="camp-doctor-schedule__footer-value">{slotSummary}</p>
                </div>
                <button
                  type="button"
                  className="camp-doctor-schedule__confirm"
                  onClick={() => {
                    setIsScheduleOpen(false);
                    setIsCabinOpen(true);
                  }}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default CampDoctorConsultationPage;
