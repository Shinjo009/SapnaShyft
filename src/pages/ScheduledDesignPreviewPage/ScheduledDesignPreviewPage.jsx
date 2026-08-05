/**
 * Design-reference screens for the scheduled / analyzing UI, with sample data.
 * Opened from Profile → Settings → Screen 1 / Screen 2 / Screen 3.
 * These render the same components the live Home screens use.
 */
import React from 'react';
import '../HomePage/HomePage.css';
import Header from '../../components/HomePage/Header';
import NavBar from '../../components/NavBar';
import {
  SlotDetailsCard,
  PrepStepsDeck,
  StatusTimelineCard,
  WhatHappensNextCard,
  PREP_STEPS_B2C,
  PREP_STEPS_B2B,
} from '../../components/HomePage/ScheduledStatusUI';
import clockCircleSrc from '../../images/clock_circle.svg';
import clockHandsSrc from '../../images/clock_hands.svg';

const AnalysisHourglassIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="27" height="29" viewBox="0 0 27 29" fill="none" aria-hidden="true">
    <path d="M0 1H26.6667M4.84848 1V7.06061C4.84848 10.697 10.9091 10.9818 10.9091 14.3333C10.9091 17.6848 4.84848 17.9697 4.84848 21.6061V27.6667M21.8182 1V7.06061C21.8182 10.697 15.7576 10.9818 15.7576 14.3333C15.7576 17.6848 21.8182 17.9697 21.8182 21.6061V27.6667M0 27.6667H26.6667M10.9091 5.24242H15.7576V7.06061C15.7576 8.27273 13.3333 9.48485 13.3333 9.48485C13.3333 9.48485 10.9091 8.27273 10.9091 7.06061V5.24242ZM8.48485 25.2424C8.48485 22.8182 13.3333 20.3939 13.3333 20.3939C13.3333 20.3939 18.1818 22.8182 18.1818 25.2424V27.6667H8.48485V25.2424Z" stroke="white" strokeWidth="2" />
  </svg>
);

const SAMPLE_B2C_ROWS = [
  { id: 'window', icon: 'time', title: 'Sept 20, 2026  |  9:00 - 10:00 AM', sub: 'Collection Window' },
  { id: 'location', icon: 'location', title: '123 Marol Naka', sub: 'Mumbai, Maharashtra' },
];

const SAMPLE_B2B_ROWS = [
  { id: 'window', icon: 'time', title: '09:00 AM – 11:00 AM', sub: 'Testing Window' },
  { id: 'engagement-date', icon: 'calendar', title: 'Friday, 31 Jul', sub: 'Engagement Date' },
  {
    id: 'location',
    icon: 'location',
    title: 'Lotus Skygarden, Malad West',
    sub: 'Mumbai Coastal Road, Mumbai 400064',
  },
];

const SAMPLE_ANALYZING_TIMELINE = [
  { id: 'sample-collected', labelLines: ['Sample', 'Collected'], state: 'done' },
  { id: 'questionnaire-completed', labelLines: ['Questionnaire', 'Completion'], state: 'done' },
  { id: 'analysis-progress', labelLines: ['Analysis in', 'Progress'], state: 'active' },
  { id: 'reports-generated', labelLines: ['Reports', 'Generated'], state: 'pending' },
];

/**
 * @param {'test' | 'camp' | 'analyzing'} variant
 *   test       → Screen 1 — Your Test is Scheduled (B2C)
 *   camp       → Screen 2 — Your Health Camp is Scheduled (B2B)
 *   analyzing  → Screen 3 — Analyzing your Bio-Markers
 */
const ScheduledDesignPreviewPage = ({
  variant = 'test',
  userName = 'Alex',
  onBack,
}) => {
  if (variant === 'analyzing') {
    return (
      <div className="home-page home-page--no-data-analyzing">
        <Header name={userName} onMenuClick={onBack} />

        <section className="home-page-analyzing__hero">
          <div className="home-page-scheduled__clock-wrap" aria-hidden="true">
            <span className="home-page-scheduled__clock-glow" />
            <AnalysisHourglassIcon />
          </div>
          <div className="home-page-analyzing__copy">
            <h2>Analyzing your Bio-Markers</h2>
            <p className="home-page-analyzing__subtitle">
              We&rsquo;re preparing your Health Playbook. Report ready in 48-72 hours.
            </p>
          </div>
        </section>

        <div className="home-page-analyzing__card home-page-analyzing__card--status-wrap">
          <StatusTimelineCard steps={SAMPLE_ANALYZING_TIMELINE} />
        </div>

        <div className="home-page-analyzing__card home-page-analyzing__card--status-wrap">
          <WhatHappensNextCard />
        </div>

        <NavBar defaultActive="home" onNavigate={() => onBack?.()} />
      </div>
    );
  }

  const isCamp = variant === 'camp';
  const heroTitle = isCamp ? 'Your Health Camp is Scheduled' : 'Your Test is Scheduled';

  return (
    <div
      className={`home-page home-page--no-data-scheduled${
        isCamp ? ' home-page--b2b-camp' : ' home-page--b2c-scheduled'
      } home-page--camp-scheduled-cta`}
    >
      <Header name={userName} onMenuClick={onBack} />

      <section className="home-page-scheduled__hero">
        <div className="home-page-scheduled__hero-inner">
          <div
            className="home-page-scheduled__clock-wrap home-page-scheduled__clock-wrap--camp-hero"
            aria-hidden="true"
          >
            <span className="home-page-scheduled__clock-glow" />
            <div className="home-page-scheduled__clock-stack">
              <img
                src={clockCircleSrc}
                alt=""
                className="home-page-scheduled__clock-circle"
                width={105}
                height={105}
                decoding="async"
              />
              <img
                src={clockHandsSrc}
                alt=""
                className="home-page-scheduled__clock-hands"
                width={34}
                height={46}
                decoding="async"
              />
            </div>
          </div>
          <div className="home-page-scheduled__hero-copy">
            <h2>{heroTitle}</h2>
            {isCamp ? (
              <div className="home-page-b2b__organizer-pill">
                <p className="home-page-b2b__organizer">Organized for Acme Corp</p>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <div className="home-page-scheduled__card home-page-scheduled__card--home-collection-wrap">
        <SlotDetailsCard
          title={isCamp ? 'Your Assigned Slot' : 'Home Collection'}
          pill={isCamp ? 'Arrive 10 mins early' : null}
          rows={isCamp ? SAMPLE_B2B_ROWS : SAMPLE_B2C_ROWS}
          statusText={isCamp ? null : 'Your Health Companion is on the way'}
        />
      </div>

      <PrepStepsDeck steps={isCamp ? PREP_STEPS_B2B : PREP_STEPS_B2C} />

      <div className="home-page-b2b__cta-wrap home-page-b2b__cta-wrap--camp">
        <button type="button" className="home-page-b2b__cta" onClick={onBack}>
          Complete your Health Assessment
        </button>
      </div>

      <NavBar defaultActive="home" onNavigate={() => onBack?.()} />
    </div>
  );
};

export default ScheduledDesignPreviewPage;
