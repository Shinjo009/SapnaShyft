import React, { useMemo, useState } from 'react';
import './ConsultationHealthDataConsentSheet.css';
import closeIcon from '../../images/camp-doctor-close.svg';
import bioAiIcon from '../../images/Cube/bio-ai.svg';
import bloodDropIcon from '../../images/blood-drop-optimal.svg';
import healthAssessmentIcon from '../../images/checklist.svg';
import { submitConsultationHealthDataConsent } from '../../services/expertsService';

const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="17" viewBox="0 0 13 17" fill="none" aria-hidden="true">
    <path
      d="M6.5 0.75C4.84315 0.75 3.5 2.09315 3.5 3.75V6.25H3C2.17157 6.25 1.5 6.92157 1.5 7.75V14.75C1.5 15.5784 2.17157 16.25 3 16.25H10C10.8284 16.25 11.5 15.5784 11.5 14.75V7.75C11.5 6.92157 10.8284 6.25 10 6.25H9.5V3.75C9.5 2.09315 8.15685 0.75 6.5 0.75ZM5 3.75C5 2.92157 5.67157 2.25 6.5 2.25C7.32843 2.25 8 2.92157 8 3.75V6.25H5V3.75Z"
      fill="white"
    />
  </svg>
);

const DATA_TILES = [
  {
    id: 'bio-ai',
    label: ['Bio-AI', 'Summary'],
    icon: bioAiIcon,
    tone: 'green',
  },
  {
    id: 'blood-test',
    label: ['Blood Test', 'Reports'],
    icon: bloodDropIcon,
    tone: 'blue',
  },
  {
    id: 'health-assessment',
    label: ['Health', 'Assessment'],
    icon: healthAssessmentIcon,
    tone: 'blue',
  },
];

const resolveExpertCopy = (expertType) => {
  const normalized = String(expertType || 'doctor').toLowerCase();
  if (normalized === 'nutritionist') {
    return {
      expertLabel: 'nutritionist',
      heading: 'YOUR NUTRITIONIST WILL BE ABLE TO VIEW',
    };
  }

  return {
    expertLabel: 'doctor',
    heading: 'YOUR DOCTOR WILL BE ABLE TO VIEW',
  };
};

const ConsultationHealthDataConsentSheet = ({
  open,
  engagementId,
  expertType = 'doctor',
  onClose,
  onContinue,
}) => {
  const [consentGranted, setConsentGranted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const copy = useMemo(() => resolveExpertCopy(expertType), [expertType]);

  if (!open) {
    return null;
  }

  const handleContinue = async () => {
    if (!consentGranted || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      await submitConsultationHealthDataConsent({
        engagementId,
        expertType,
        consentGranted: true,
      });

      onContinue?.({ consentGranted: true });
    } catch (error) {
      console.error('Failed to submit consultation health data consent:', error);
      setSubmitError('Unable to save your consent. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="consultation-consent" role="dialog" aria-modal="true" aria-label="Health data consent">
      <button
        type="button"
        className="consultation-consent__backdrop"
        aria-label="Close health data consent"
        onClick={() => onClose?.({ consentGranted: false })}
      />

      <div className="consultation-consent__stack">
        <button
          type="button"
          className="consultation-consent__close"
          aria-label="Close"
          onClick={() => onClose?.({ consentGranted: false })}
        >
          <img src={closeIcon} alt="" className="consultation-consent__close-img" />
        </button>

        <div className="consultation-consent__sheet">
          <section className="consultation-consent__toggle-card">
            <div className="consultation-consent__toggle-row">
              <div className="consultation-consent__toggle-copy">
                <div className="consultation-consent__toggle-title-row">
                  <span className="consultation-consent__lock-icon" aria-hidden="true">
                    <LockIcon />
                  </span>
                  <h2 className="consultation-consent__toggle-title">Allow Secure Health Data Access</h2>
                </div>
                <p className="consultation-consent__toggle-description">
                  I consent to securely share my health information with my assigned {copy.expertLabel} for this consultation only.
                </p>
              </div>

              <button
                type="button"
                className={`consultation-consent__switch${consentGranted ? ' is-on' : ''}`}
                role="switch"
                aria-checked={consentGranted}
                aria-label="Allow secure health data access"
                onClick={() => setConsentGranted((prev) => !prev)}
              >
                <span className="consultation-consent__switch-thumb" />
              </button>
            </div>
          </section>

          <section className="consultation-consent__summary">
            <h3 className="consultation-consent__summary-heading">{copy.heading}</h3>
            <div className="consultation-consent__tiles">
              {DATA_TILES.map((tile) => (
                <article key={tile.id} className="consultation-consent__tile">
                  <span className={`consultation-consent__tile-icon consultation-consent__tile-icon--${tile.tone}`}>
                    <img src={tile.icon} alt="" />
                  </span>
                  <p className="consultation-consent__tile-label">
                    {tile.label.map((line) => (
                      <span key={line}>{line}</span>
                    ))}
                  </p>
                </article>
              ))}
            </div>
          </section>

          {submitError ? (
            <p className="consultation-consent__error" role="alert">{submitError}</p>
          ) : null}

          <button
            type="button"
            className={`consultation-consent__continue${consentGranted ? ' is-enabled' : ''}`}
            disabled={!consentGranted || isSubmitting}
            onClick={() => {
              void handleContinue();
            }}
          >
            {isSubmitting ? 'Saving...' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConsultationHealthDataConsentSheet;
