/**
 * Shared card designs for the scheduled / sample-collected / analyzing Home screens.
 * Presentational only — callers own the data and the step-completion rules.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import './ScheduledStatusUI.css';
import cabinIconSrc from '../../../images/slot-passed/conference-room.svg';

/** Same 3 prep cards for B2B camp and B2C home collection. */
export const PREP_STEPS = [
  {
    step: 'STEP 01',
    title: 'Fasting Required (8-12 hours)',
    description: 'Water is allowed. Avoid high-fat or high-sugar foods before the test.',
    icon: 'fasting',
    tone: 'yellow',
  },
  {
    step: 'STEP 02',
    title: 'Avoid Alcoholic Drinks',
    description: 'Avoid drinking alcohol 24 hours before the test',
    icon: 'alcohol',
    tone: 'blue',
  },
  {
    step: 'STEP 03',
    title: 'Continue Ongoing Medication',
    description: 'Continue medication unless advised to discontinue by your Doctor.',
    icon: 'meds',
    tone: 'pink',
  },
];

export const PREP_STEPS_B2C = PREP_STEPS;
export const PREP_STEPS_B2B = PREP_STEPS;

const TimeRowIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <path d="M9 1.5C13.1423 1.5 16.5 4.85775 16.5 9C16.5 13.1423 13.1423 16.5 9 16.5C4.85775 16.5 1.5 13.1423 1.5 9C1.5 4.85775 4.85775 1.5 9 1.5ZM9 3C7.4087 3 5.88258 3.63214 4.75736 4.75736C3.63214 5.88258 3 7.4087 3 9C3 10.5913 3.63214 12.1174 4.75736 13.2426C5.88258 14.3679 7.4087 15 9 15C10.5913 15 12.1174 14.3679 13.2426 13.2426C14.3679 12.1174 15 10.5913 15 9C15 7.4087 14.3679 5.88258 13.2426 4.75736C12.1174 3.63214 10.5913 3 9 3ZM9 4.5C9.1837 4.50002 9.361 4.56747 9.49828 4.68954C9.63556 4.81161 9.72326 4.97981 9.74475 5.16225L9.75 5.25V8.6895L11.7802 10.7198C11.9148 10.8547 11.9929 11.0358 11.9987 11.2263C12.0045 11.4167 11.9376 11.6023 11.8116 11.7452C11.6855 11.8881 11.5098 11.9777 11.3201 11.9958C11.1305 12.0139 10.941 11.9591 10.7902 11.8425L10.7198 11.7802L8.46975 9.53025C8.35318 9.41358 8.27832 9.26175 8.25675 9.09825L8.25 9V5.25C8.25 5.05109 8.32902 4.86032 8.46967 4.71967C8.61032 4.57902 8.80109 4.5 9 4.5Z" fill="#90DF9E" />
  </svg>
);

const LocationRowIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <path
      d="M9 1.5C6.1005 1.5 3.75 3.8505 3.75 6.75C3.75 10.6875 9 16.5 9 16.5C9 16.5 14.25 10.6875 14.25 6.75C14.25 3.8505 11.8995 1.5 9 1.5ZM9 8.625C8.0055 8.625 7.125 7.7445 7.125 6.75C7.125 5.7555 8.0055 4.875 9 4.875C9.9945 4.875 10.875 5.7555 10.875 6.75C10.875 7.7445 9.9945 8.625 9 8.625Z"
      fill="#90DF9E"
    />
  </svg>
);

const SlotDateCalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path d="M6.66699 1.66602V4.99935M13.3337 1.66602V4.99935" stroke="#90DF9E" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M4.16667 3.33398H15.8333C16.7538 3.33398 17.5 4.08018 17.5 5.00065V16.6673C17.5 17.5878 16.7538 18.334 15.8333 18.334H4.16667C3.24619 18.334 2.5 17.5878 2.5 16.6673V5.00065C2.5 4.08018 3.24619 3.33398 4.16667 3.33398V3.33398" stroke="#90DF9E" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M2.5 8.33398H17.5" stroke="#90DF9E" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const HouseTrackIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="15" viewBox="0 0 14 15" fill="none" aria-hidden="true">
    <path d="M7 1.4L12.4 6.2V12.9C12.4 13.4 12 13.8 11.5 13.8H2.5C2 13.8 1.6 13.4 1.6 12.9V6.2L7 1.4Z" fill="white" />
    <path
      d="M5.2 13.8V8.2H8.8V13.8"
      stroke="#0B1F1C"
      strokeWidth="1.1"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CabinRowIcon = () => (
  <img
    src={cabinIconSrc}
    alt=""
    width={24}
    height={24}
    className="home-collection-card__cabin-icon"
    decoding="async"
  />
);

const SlotRowIcon = ({ type }) => {
  if (type === 'location') return <LocationRowIcon />;
  if (type === 'calendar') return <SlotDateCalendarIcon />;
  if (type === 'cabin') return <CabinRowIcon />;
  return <TimeRowIcon />;
};

/**
 * Slot summary card — "Home Collection" (B2C), "Your Assigned Slot" (B2B),
 * or "Collection Cabin" (slot passed / walk-in).
 * @param {{ id: string, icon?: 'time'|'location'|'calendar'|'cabin', title: string, sub?: string }[]} rows
 * @param {{ prefix: string, highlight: string, suffix?: string }} [walkInMessage]
 */
export const SlotDetailsCard = ({ title, pill, rows = [], statusText, walkInMessage = null }) => (
  <section className="home-collection-card" aria-label={title}>
    {pill ? (
      <div className="home-collection-card__head">
        <h3 className="home-collection-card__title">{title}</h3>
        <span className="home-collection-card__arrive-pill">{pill}</span>
      </div>
    ) : (
      <h3 className="home-collection-card__title">{title}</h3>
    )}

    <div className="home-collection-card__rows">
      {rows.map((row) => (
        <div key={row.id} className="home-collection-card__row">
          <div className="home-collection-card__icon-box" aria-hidden="true">
            <SlotRowIcon type={row.icon} />
          </div>
          <div className="home-collection-card__row-copy">
            <p className="home-collection-card__row-title">{row.title}</p>
            {row.sub ? <p className="home-collection-card__row-sub">{row.sub}</p> : null}
          </div>
        </div>
      ))}
    </div>

    {walkInMessage ? (
      <div className="home-collection-card__walk-in">
        <hr className="home-collection-card__divider" />
        <p className="home-collection-card__walk-in-text">
          {walkInMessage.prefix}
          <span className="home-collection-card__walk-in-highlight">{walkInMessage.highlight}</span>
          {walkInMessage.suffix || ''}
        </p>
      </div>
    ) : null}

    {statusText ? (
      <div className="home-collection-card__status">
        <hr className="home-collection-card__divider" />
        <div className="home-collection-card__status-row">
          <div className="home-collection-card__track" aria-hidden="true">
            <span className="home-collection-card__dot" />
            <span className="home-collection-card__track-line" />
            <span className="home-collection-card__dot home-collection-card__dot--mid" />
            <span className="home-collection-card__track-line home-collection-card__track-line--light" />
            <span className="home-collection-card__house">
              <HouseTrackIcon />
            </span>
          </div>
          <p className="home-collection-card__status-text">{statusText}</p>
        </div>
      </div>
    ) : null}
  </section>
);

const PrepIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <g clipPath="url(#clip0_scheduled_status_prep)">
      <path d="M3.75 2.625V19.875C3.75 20.082 3.918 20.25 4.125 20.25H8.88C9.17837 20.25 9.46452 20.3685 9.6755 20.5795C9.88647 20.7905 10.005 21.0766 10.005 21.375C10.005 21.6734 9.88647 21.9595 9.6755 22.1705C9.46452 22.3815 9.17837 22.5 8.88 22.5H4.125C3.42881 22.5 2.76113 22.2234 2.26884 21.7312C1.77656 21.2389 1.5 20.5712 1.5 19.875V2.625C1.5 1.176 2.676 0 4.125 0H16.875C18.324 0 19.5 1.176 19.5 2.625V14.229C19.5 14.5274 19.3815 14.8135 19.1705 15.0245C18.9595 15.2355 18.6734 15.354 18.375 15.354C18.0766 15.354 17.7905 15.2355 17.5795 15.0245C17.3685 14.8135 17.25 14.5274 17.25 14.229V2.625C17.25 2.52554 17.2105 2.43016 17.1402 2.35984C17.0698 2.28951 16.9745 2.25 16.875 2.25H4.125C4.02554 2.25 3.93016 2.28951 3.85984 2.35984C3.78951 2.43016 3.75 2.52554 3.75 2.625ZM23.661 16.9305L16.8255 23.6055C16.6133 23.8123 16.3281 23.927 16.0318 23.9248C15.7355 23.9225 15.452 23.8035 15.243 23.5935L12.3285 20.6685C12.1302 20.4549 12.0225 20.1726 12.0282 19.8811C12.0339 19.5897 12.1525 19.3118 12.359 19.1061C12.5655 18.9003 12.8438 18.7828 13.1353 18.7782C13.4267 18.7736 13.7086 18.8824 13.9215 19.0815L16.05 21.219L22.089 15.321C22.3026 15.1125 22.5903 14.9975 22.8888 15.0011C23.0366 15.003 23.1826 15.0339 23.3184 15.0921C23.4542 15.1503 23.5773 15.2347 23.6805 15.3405C23.7837 15.4463 23.8651 15.5714 23.92 15.7086C23.9749 15.8458 24.0022 15.9925 24.0004 16.1403C23.9985 16.2881 23.9676 16.4341 23.9094 16.5699C23.8512 16.7057 23.7668 16.8288 23.661 16.932M7.125 6H13.875C14.1734 6 14.4595 6.11853 14.6705 6.3295C14.8815 6.54048 15 6.82663 15 7.125C15 7.42337 14.8815 7.70952 14.6705 7.9205C14.4595 8.13147 14.1734 8.25 13.875 8.25H7.125C6.82663 8.25 6.54048 8.13147 6.3295 7.9205C6.11853 7.70952 6 7.42337 6 7.125C6 6.82663 6.11853 6.54048 6.3295 6.3295C6.54048 6.11853 6.82663 6 7.125 6ZM6 11.625C6 11.3266 6.11853 11.0405 6.3295 10.8295C6.54048 10.6185 6.82663 10.5 7.125 10.5H10.125C10.4234 10.5 10.7095 10.6185 10.9205 10.8295C11.1315 11.0405 11.25 11.3266 11.25 11.625C11.25 11.9234 11.1315 12.2095 10.9205 12.4205C10.7095 12.6315 10.4234 12.75 10.125 12.75H7.125C6.82663 12.75 6.54048 12.6315 6.3295 12.4205C6.11853 12.2095 6 11.9234 6 11.625Z" fill="white" />
    </g>
    <defs>
      <clipPath id="clip0_scheduled_status_prep">
        <rect width="24" height="24" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

const FastingStepIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="10.25" stroke="white" strokeWidth="1" />
    <path d="M8.2 8.1V12.4" stroke="white" strokeWidth="1.05" strokeLinecap="round" />
    <path d="M7.35 8.1V10.7C7.35 11.55 8.2 11.7 8.2 11.7V16.1" stroke="white" strokeWidth="1.05" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9.05 8.1V10.7C9.05 11.55 8.2 11.7 8.2 11.7" stroke="white" strokeWidth="1.05" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M15.85 8.1V16.1" stroke="white" strokeWidth="1.05" strokeLinecap="round" />
    <path d="M14.95 8.1H16.75" stroke="white" strokeWidth="1.05" strokeLinecap="round" />
    <ellipse cx="12" cy="17.15" rx="5.1" ry="1.15" stroke="white" strokeWidth="1" />
  </svg>
);

const AlcoholStepIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="10.25" stroke="white" strokeWidth="1" />
    <path
      d="M8 7.55H11.35L11 11.05C11 12.2 10.15 13.05 9.675 13.05C9.2 13.05 8.35 12.2 8.35 11.05L8 7.55Z"
      stroke="white"
      strokeWidth="1"
      strokeLinejoin="round"
    />
    <path d="M9.675 13.05V16.15M8.5 16.15H10.85" stroke="white" strokeWidth="1" strokeLinecap="round" />
    <path
      d="M13.85 7.55H16.4V8.85H16.95V16.2H13.3V8.85H13.85V7.55Z"
      stroke="white"
      strokeWidth="1"
      strokeLinejoin="round"
    />
    <path d="M13.3 8.85H16.95" stroke="white" strokeWidth="1" />
    <path d="M7.15 16.55L16.85 7.45" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

const MedsStepIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="10.25" stroke="white" strokeWidth="1" />
    <g transform="rotate(-35 12 12)">
      <rect x="7.4" y="10.15" width="9.2" height="3.7" rx="1.85" stroke="white" strokeWidth="1.05" />
      <path d="M12 10.15V13.85" stroke="white" strokeWidth="1.05" strokeLinecap="round" />
    </g>
  </svg>
);

const StepIcon = ({ type }) => {
  if (type === 'alcohol') return <AlcoholStepIcon />;
  if (type === 'meds') return <MedsStepIcon />;
  return <FastingStepIcon />;
};

const SNAP_DURATION_MS = 480;
const easeOutCubic = (t) => 1 - ((1 - t) ** 3);

/**
 * Stacked prep cards with page snap.
 * Drag freely; release past halfway (or with enough flick) and the deck
 * settles on the next/previous card by itself.
 */
export const PrepStepsDeck = ({ steps = PREP_STEPS }) => {
  const scrollerRef = useRef(null);
  const dragRef = useRef({
    active: false,
    pointerId: null,
    startX: 0,
    startScrollLeft: 0,
    lastX: 0,
    lastTime: 0,
    velocity: 0,
  });
  const snapTimeoutRef = useRef(null);
  const isSnappingRef = useRef(false);
  const snapAnimRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const stepCount = steps.length;
  const maxProgress = Math.max(stepCount - 1, 1);

  const cancelSnapAnimation = useCallback(() => {
    if (snapAnimRef.current != null) {
      window.cancelAnimationFrame(snapAnimRef.current);
      snapAnimRef.current = null;
    }
  }, []);

  const syncProgress = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const pageWidth = Math.max(el.clientWidth, 1);
    const next = el.scrollLeft / pageWidth;
    setProgress(Math.min(maxProgress, Math.max(0, next)));
  }, [maxProgress]);

  const snapToIndex = useCallback((index, { smooth = true } = {}) => {
    const el = scrollerRef.current;
    if (!el) return;
    const target = Math.min(stepCount - 1, Math.max(0, index));
    const pageWidth = Math.max(el.clientWidth, 1);
    const left = target * pageWidth;
    const startLeft = el.scrollLeft;
    const distance = left - startLeft;

    if (Math.abs(distance) < 1.5) {
      cancelSnapAnimation();
      isSnappingRef.current = false;
      el.scrollLeft = left;
      setProgress(target);
      return;
    }

    cancelSnapAnimation();
    isSnappingRef.current = true;

    if (!smooth) {
      el.scrollLeft = left;
      isSnappingRef.current = false;
      setProgress(target);
      return;
    }

    // Duration scales a bit with remaining distance so short snaps aren't sluggish.
    const duration = Math.min(
      SNAP_DURATION_MS,
      Math.max(280, Math.abs(distance / pageWidth) * SNAP_DURATION_MS),
    );
    const startTime = performance.now();

    const tick = (now) => {
      const elNow = scrollerRef.current;
      if (!elNow) {
        snapAnimRef.current = null;
        isSnappingRef.current = false;
        return;
      }

      const t = Math.min(1, (now - startTime) / duration);
      const eased = easeOutCubic(t);
      elNow.scrollLeft = startLeft + distance * eased;
      setProgress(Math.min(maxProgress, Math.max(0, elNow.scrollLeft / pageWidth)));

      if (t < 1) {
        snapAnimRef.current = window.requestAnimationFrame(tick);
        return;
      }

      elNow.scrollLeft = left;
      setProgress(target);
      snapAnimRef.current = null;
      isSnappingRef.current = false;
    };

    snapAnimRef.current = window.requestAnimationFrame(tick);
  }, [cancelSnapAnimation, maxProgress, stepCount]);

  const resolveSnapIndex = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return 0;
    const pageWidth = Math.max(el.clientWidth, 1);
    const raw = el.scrollLeft / pageWidth;
    const velocity = dragRef.current.velocity;
    // Flick: finish the card even if still short of halfway.
    if (velocity > 0.35) {
      return Math.min(stepCount - 1, Math.floor(raw) + 1);
    }
    if (velocity < -0.35) {
      return Math.max(0, Math.ceil(raw) - 1);
    }
    // Halfway threshold → nearest page.
    return Math.min(stepCount - 1, Math.max(0, Math.round(raw)));
  }, [stepCount]);

  const scheduleSnapAfterScroll = useCallback(() => {
    if (dragRef.current.active || isSnappingRef.current) return;
    if (snapTimeoutRef.current) {
      window.clearTimeout(snapTimeoutRef.current);
    }
    snapTimeoutRef.current = window.setTimeout(() => {
      snapTimeoutRef.current = null;
      if (dragRef.current.active || isSnappingRef.current) return;
      snapToIndex(resolveSnapIndex(), { smooth: true });
    }, 90);
  }, [resolveSnapIndex, snapToIndex]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return undefined;

    const onScroll = () => {
      if (isSnappingRef.current) {
        // Custom rAF snap already updates progress; avoid double work / re-snap.
        return;
      }
      syncProgress();
      if (!dragRef.current.active) {
        scheduleSnapAfterScroll();
      }
    };

    syncProgress();
    el.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', syncProgress);
    return () => {
      el.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', syncProgress);
      if (snapTimeoutRef.current) {
        window.clearTimeout(snapTimeoutRef.current);
      }
      cancelSnapAnimation();
    };
  }, [cancelSnapAnimation, scheduleSnapAfterScroll, syncProgress]);

  const onPointerDown = (event) => {
    const el = scrollerRef.current;
    if (!el || event.button !== 0) {
      return;
    }

    // Prefer custom drag for mouse; touch uses native pan + idle snap.
    if (event.pointerType !== 'mouse') {
      dragRef.current.velocity = 0;
      return;
    }

    if (snapTimeoutRef.current) {
      window.clearTimeout(snapTimeoutRef.current);
      snapTimeoutRef.current = null;
    }
    cancelSnapAnimation();
    isSnappingRef.current = false;

    const now = performance.now();
    dragRef.current = {
      active: true,
      pointerId: event.pointerId,
      startX: event.clientX,
      startScrollLeft: el.scrollLeft,
      lastX: event.clientX,
      lastTime: now,
      velocity: 0,
    };
    setIsDragging(true);

    try {
      el.setPointerCapture(event.pointerId);
    } catch {
      // ignore
    }
  };

  const onPointerMove = (event) => {
    const el = scrollerRef.current;
    const drag = dragRef.current;
    if (!el || !drag.active || drag.pointerId !== event.pointerId) {
      return;
    }

    const now = performance.now();
    const dt = Math.max(now - drag.lastTime, 1);
    const dx = event.clientX - drag.lastX;
    // Store as scroll direction: drag left → positive (toward next card).
    drag.velocity = -dx / dt;
    drag.lastX = event.clientX;
    drag.lastTime = now;

    const deltaX = event.clientX - drag.startX;
    el.scrollLeft = drag.startScrollLeft - deltaX;
    syncProgress();
  };

  const endPointerDrag = (event) => {
    const drag = dragRef.current;
    if (!drag.active || (event && drag.pointerId !== event.pointerId)) {
      return;
    }

    const el = scrollerRef.current;
    if (el && event?.pointerId != null) {
      try {
        el.releasePointerCapture(event.pointerId);
      } catch {
        // ignore
      }
    }

    dragRef.current.active = false;
    dragRef.current.pointerId = null;
    setIsDragging(false);

    snapToIndex(resolveSnapIndex(), { smooth: true });
    dragRef.current.velocity = 0;
  };

  const getCardStyle = (index) => {
    const offset = index - progress;
    if (offset < -1.15 || offset > 2.4) {
      return { opacity: 0, transform: 'translate3d(28px, -28px, 0) scale(0.94)', zIndex: 0 };
    }

    if (offset <= 0) {
      const t = Math.max(-1, offset);
      return {
        opacity: 1 + t * 0.25,
        transform: `translate3d(${t * 108}%, ${Math.abs(t) * -6}px, 0) scale(${1 + t * 0.03})`,
        zIndex: 30 + Math.round(t * 10),
      };
    }

    const depth = Math.min(offset, 2.2);
    return {
      opacity: Math.max(0.55, 1 - depth * 0.18),
      transform: `translate3d(${8 + depth * 18}px, ${-8 - depth * 12}px, 0) scale(${1 - depth * 0.02})`,
      zIndex: 20 - Math.round(depth * 5),
    };
  };

  return (
    <section className="prep-deck-section" aria-label="Preparation Checklist">
      <div className="prep-deck-section__head">
        <PrepIcon />
        <div className="prep-deck-section__head-copy">
          <h3>Preparation Checklist</h3>
          <p>Complete all</p>
        </div>
      </div>

      <div className="prep-deck">
        <div className="prep-deck__stage" aria-hidden="true">
          {steps.map((item, index) => (
            <article
              key={item.step}
              className={`prep-deck__card prep-deck__card--${item.tone}`}
              style={getCardStyle(index)}
            >
              <p className="prep-deck__step">{item.step}</p>
              <div className="prep-deck__title-row">
                <StepIcon type={item.icon} />
                <p className="prep-deck__title">{item.title}</p>
              </div>
              <p className="prep-deck__desc">{item.description}</p>
            </article>
          ))}
        </div>

        <div
          ref={scrollerRef}
          className={`prep-deck__scroller${isDragging ? ' is-dragging' : ''}`}
          role="region"
          aria-label="Swipe through preparation steps"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endPointerDrag}
          onPointerCancel={endPointerDrag}
          onLostPointerCapture={endPointerDrag}
        >
          {steps.map((item) => (
            <div key={item.step} className="prep-deck__snap-page" />
          ))}
        </div>
      </div>
    </section>
  );
};

const StatusTimelineIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <rect x="2.25" y="3" width="13.5" height="9" rx="1.5" stroke="white" strokeWidth="1.2" />
    <path d="M6.75 15H11.25" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M9 12V15" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
    <circle cx="6" cy="7.5" r="1" fill="white" />
    <path d="M7.2 7.5H11.5" stroke="white" strokeWidth="1" strokeLinecap="round" />
    <circle cx="12" cy="7.5" r="1" fill="white" />
  </svg>
);

const TimelineCheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 8 8" fill="none" aria-hidden="true">
    <path
      d="M1.5 4.1L3.1 5.7L6.5 2.3"
      stroke="white"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/** Callers pass 'done' | 'active' | 'current' | 'pending'; 'current' renders like 'active'. */
const normalizeTimelineState = (state) => {
  if (state === 'done') return 'done';
  if (state === 'active' || state === 'current') return 'active';
  return 'pending';
};

const resolveLabelLines = (item) => {
  if (Array.isArray(item.labelLines) && item.labelLines.length > 0) {
    return item.labelLines;
  }
  return [item.label ?? ''];
};

/**
 * Horizontal gold Status Timeline. A filled marker with a tick means the step is done,
 * a hollow ring means it is the step in progress, and pending steps have no marker.
 */
export const StatusTimelineCard = ({ steps = [] }) => (
  <section className="status-timeline-card" aria-label="Status Timeline">
    <div className="status-timeline-card__head">
      <div className="status-timeline-card__icon" aria-hidden="true">
        <StatusTimelineIcon />
      </div>
      <h3 className="status-timeline-card__title">Status Timeline</h3>
    </div>

    <div className="status-timeline-card__body">
      <div className="status-timeline-card__steps">
        <span className="status-timeline-card__rail" aria-hidden="true" />
        {steps.map((item) => {
          const state = normalizeTimelineState(item.state);
          return (
            <div
              key={item.id}
              className={`status-timeline-card__step status-timeline-card__step--${state}`}
            >
              <div className="status-timeline-card__pin" aria-hidden="true">
                {state !== 'pending' ? (
                  <>
                    <span className="status-timeline-card__marker">
                      {state === 'done' ? <TimelineCheckIcon /> : null}
                    </span>
                    <span className="status-timeline-card__stem" />
                  </>
                ) : null}
              </div>
              <p className="status-timeline-card__label">
                {resolveLabelLines(item).map((line, i) => (
                  <React.Fragment key={`${item.id}-${line}`}>
                    {i > 0 ? <br /> : null}
                    {line}
                  </React.Fragment>
                ))}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  </section>
);

const DropletNextIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path
      d="M8 1.75C8 1.75 3.75 6.4 3.75 9.6C3.75 11.95 5.65 13.85 8 13.85C10.35 13.85 12.25 11.95 12.25 9.6C12.25 6.4 8 1.75 8 1.75Z"
      stroke="#F79D1F"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const StethoscopeNextIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
    <path
      d="M3.5 1.5V5.5C3.5 7.985 5.515 10 8 10"
      stroke="#43AAFF"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M11.5 1.5V5.5C11.5 6.2 11.3 6.85 10.95 7.4"
      stroke="#43AAFF"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="3.5" cy="1.5" r="1" stroke="#43AAFF" strokeWidth="1.25" />
    <circle cx="11.5" cy="1.5" r="1" stroke="#43AAFF" strokeWidth="1.25" />
    <circle cx="11.25" cy="11.25" r="2.25" stroke="#43AAFF" strokeWidth="1.25" />
    <path d="M8 10V11.25" stroke="#43AAFF" strokeWidth="1.25" strokeLinecap="round" />
  </svg>
);

const LightbulbNextIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path
      d="M8 1.5V2.25M8 13.75V14.5M2.25 8H1.5M14.5 8H13.75M3.64 3.64L3.11 3.11M12.89 12.89L12.36 12.36M12.36 3.64L12.89 3.11M3.11 12.89L3.64 12.36"
      stroke="#FF91ED"
      strokeWidth="1.15"
      strokeLinecap="round"
    />
    <path
      d="M5.5 11.25H10.5M6.25 11.25V11.75C6.25 12.716 7.034 13.5 8 13.5C8.966 13.5 9.75 12.716 9.75 11.75V11.25"
      stroke="#FF91ED"
      strokeWidth="1.15"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M5.35 8.85C4.85 8.35 4.55 7.7 4.55 7C4.55 5.1 6.1 3.55 8 3.55C9.9 3.55 11.45 5.1 11.45 7C11.45 7.7 11.15 8.35 10.65 8.85L10.1 9.4C9.55 9.95 9.25 10.7 9.25 11.25H6.75C6.75 10.7 6.45 9.95 5.9 9.4L5.35 8.85Z"
      stroke="#FF91ED"
      strokeWidth="1.15"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const WHAT_HAPPENS_NEXT_ITEMS = [
  {
    id: 'biomarkers',
    icon: 'droplet',
    parts: [
      { text: 'Your detailed health analysis covers ', tone: 'muted' },
      { text: '88+ bio-markers', tone: 'emphasis' },
    ],
  },
  {
    id: 'consultation',
    icon: 'stethoscope',
    parts: [
      { text: '1:1 consultation', tone: 'emphasis' },
      { text: ' with qualified health professionals and get ', tone: 'muted' },
      { text: 'expert guidance', tone: 'emphasis' },
      { text: ' on your Health Playbook', tone: 'muted' },
    ],
  },
  {
    id: 'insights',
    icon: 'lightbulb',
    parts: [
      { text: 'Bio-AI powered analysis generates ', tone: 'muted' },
      { text: 'actionable insights', tone: 'emphasis' },
    ],
  },
];

const NextItemIcon = ({ type }) => {
  if (type === 'droplet') return <DropletNextIcon />;
  if (type === 'stethoscope') return <StethoscopeNextIcon />;
  return <LightbulbNextIcon />;
};

export const WhatHappensNextCard = () => (
  <section className="what-next-card" aria-label="What happens next?">
    <h3 className="what-next-card__title">What happens next?</h3>
    <ul className="what-next-card__list">
      {WHAT_HAPPENS_NEXT_ITEMS.map((item) => (
        <li key={item.id} className="what-next-card__row">
          <div className="what-next-card__icon-box" aria-hidden="true">
            <NextItemIcon type={item.icon} />
          </div>
          <p className="what-next-card__text">
            {item.parts.map((part) => (
              <span
                key={`${item.id}-${part.text}`}
                className={
                  part.tone === 'emphasis'
                    ? 'what-next-card__em'
                    : 'what-next-card__muted'
                }
              >
                {part.text}
              </span>
            ))}
          </p>
        </li>
      ))}
    </ul>
  </section>
);
