import React, { useEffect, useMemo, useState } from 'react';
import './ConsultationNotesPage.css';
import backIcon from '../../images/AllAppointments/back.svg';
import { fetchMyConsultationAppointments } from '../../utils/myConsultationsAppointments';

// Figma MCP asset URLs (expire ~7 days). Prefer local copies when re-exported.
const noteIcon = 'https://www.figma.com/api/mcp/asset/b6d612be-cebe-4093-bf0e-2815d5eba6d5.svg';
const chevronDownIcon = 'https://www.figma.com/api/mcp/asset/57d62485-f834-451c-80c9-bcf0fffc8ece.svg';
const downloadIcon = 'https://www.figma.com/api/mcp/asset/bf5a90e6-75af-4099-be80-96647a8413e9.svg';

const NOTE_TABS = [
  { key: 'doctor', label: 'Doctor Notes' },
  { key: 'nutritionist', label: 'Nutritionist Notes' },
];

const SAMPLE_NOTES = [
  {
    id: 'sample-doctor-note',
    expertType: 'doctor',
    expertName: 'Dr. Priya Nair',
    notesWhenLabel: '12 July 2026, 7:30 AM',
    consultationSummary:
      'Patient reports intermittent fatigue and mild joint pain over the past 3 weeks. Sleep cycle remains irregular due to late-night work shifts. Blood pressure was recorded at 128/84 mmHg during the session check-in.',
    attachments: [
      {
        id: 'sample-prescription',
        label: 'Prescription',
        fileType: 'PDF',
        sizeLabel: '2Mb',
        url: null,
      },
    ],
  },
];

const ConsultationNotesPage = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState('doctor');
  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [expandedNoteIds, setExpandedNoteIds] = useState({});

  useEffect(() => {
    let cancelled = false;

    const loadNotes = async () => {
      setIsLoading(true);
      try {
        const appointments = await fetchMyConsultationAppointments({ ttlMs: 0 });
        const mapped = appointments
          .filter((item) => item.status === 'completed' || item.consultationSummary || (item.attachments || []).length > 0)
          .map((item) => ({
            id: item.id,
            expertType: item.expertType || item.category,
            expertName: item.expertName || item.title,
            notesWhenLabel: item.notesWhenLabel || item.whenLabel,
            consultationSummary: item.consultationSummary || null,
            attachments: item.attachments || [],
          }));

        if (!cancelled) {
          setNotes(mapped);
        }
      } catch (error) {
        console.error('Failed to load consultation notes:', error);
        if (!cancelled) {
          setNotes([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
          setHasLoaded(true);
        }
      }
    };

    void loadNotes();

    return () => {
      cancelled = true;
    };
  }, []);

  const visibleNotes = useMemo(() => {
    const source = hasLoaded && notes.length === 0 ? SAMPLE_NOTES : notes;
    return source.filter((item) => String(item.expertType || '').toLowerCase() === activeTab);
  }, [activeTab, hasLoaded, notes]);

  const notesSectionLabel = activeTab === 'nutritionist' ? 'Nutritionist’s Notes' : 'Doctor’s Notes';

  const toggleNoteExpanded = (noteId) => {
    setExpandedNoteIds((prev) => ({
      ...prev,
      [noteId]: !prev[noteId],
    }));
  };

  const handleDownload = (attachment) => {
    if (!attachment?.url) {
      return;
    }
    window.open(attachment.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="consultation-notes-page">
      <div className="consultation-notes-page__header-row">
        <div className="consultation-notes-page__header-left">
          <button
            className="consultation-notes-page__back-btn"
            type="button"
            aria-label="Go back"
            onClick={onBack}
          >
            <span className="consultation-notes-page__icon-box consultation-notes-page__icon-box--back">
              <img src={backIcon} alt="" />
            </span>
          </button>
          <h1 className="consultation-notes-page__title">Consultation Notes</h1>
        </div>
      </div>

      <div className="consultation-notes-page__tabs-wrap">
        <div className="consultation-notes-page__tabs" role="tablist" aria-label="Consultation notes filters">
          {NOTE_TABS.map((tab) => {
            const isActive = tab.key === activeTab;
            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`consultation-notes-page__tab${isActive ? ' is-active' : ''}`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className={`consultation-notes-page__content${visibleNotes.length === 0 ? ' is-empty' : ''}`}>
        {isLoading ? (
          <div className="consultation-notes-page__empty" role="status">
            <p className="consultation-notes-page__empty-title">Loading notes...</p>
          </div>
        ) : null}

        {!isLoading && visibleNotes.length === 0 ? (
          <div className="consultation-notes-page__empty" role="status">
            <p className="consultation-notes-page__empty-title">No notes yet.</p>
            <p className="consultation-notes-page__empty-sub">
              {activeTab === 'nutritionist'
                ? 'Nutritionist consultation notes will appear here'
                : 'Doctor consultation notes will appear here'}
            </p>
          </div>
        ) : null}

        {!isLoading ? visibleNotes.map((note) => {
          const isExpanded = Boolean(expandedNoteIds[note.id]);
          const summary = note.consultationSummary || 'Notes will be shared after your consultation.';
          const prescription = (note.attachments || [])[0] || null;

          return (
            <article key={note.id} className="consultation-notes-page__card">
              <div className="consultation-notes-page__card-glow" aria-hidden="true" />

              <div className="consultation-notes-page__card-header">
                {note.notesWhenLabel ? (
                  <span className="consultation-notes-page__when">{note.notesWhenLabel}</span>
                ) : null}
                <h2 className="consultation-notes-page__doctor-name">{note.expertName}</h2>
              </div>

              <div className="consultation-notes-page__divider" aria-hidden="true" />

              <div className="consultation-notes-page__notes-block">
                <div className="consultation-notes-page__notes-heading">
                  <span className="consultation-notes-page__notes-icon-wrap">
                    <span className="consultation-notes-page__icon-box consultation-notes-page__icon-box--note">
                      <img src={noteIcon} alt="" />
                    </span>
                  </span>
                  <h3 className="consultation-notes-page__notes-label">{notesSectionLabel}</h3>
                </div>

                <div className="consultation-notes-page__notes-body">
                  <p className={`consultation-notes-page__notes-text${isExpanded ? ' is-expanded' : ''}`}>
                    {summary}
                  </p>
                  <button
                    type="button"
                    className="consultation-notes-page__read-btn"
                    onClick={() => toggleNoteExpanded(note.id)}
                    aria-expanded={isExpanded}
                  >
                    <span>{isExpanded ? 'HIDE NOTES' : 'READ NOTES'}</span>
                    <span className={`consultation-notes-page__read-chevron${isExpanded ? ' is-open' : ''}`}>
                      <span className="consultation-notes-page__icon-box consultation-notes-page__icon-box--chevron">
                        <img src={chevronDownIcon} alt="" />
                      </span>
                    </span>
                  </button>
                </div>
              </div>

              {prescription ? (
                <div className="consultation-notes-page__prescription">
                  <div className="consultation-notes-page__prescription-copy">
                    <p className="consultation-notes-page__prescription-title">{prescription.label || 'Prescription'}</p>
                    <div className="consultation-notes-page__prescription-meta">
                      <span>{prescription.fileType || 'PDF'}</span>
                      {prescription.sizeLabel ? (
                        <>
                          <span className="consultation-notes-page__prescription-dot" aria-hidden="true" />
                          <span>{prescription.sizeLabel}</span>
                        </>
                      ) : null}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="consultation-notes-page__download-btn"
                    aria-label="Download prescription"
                    onClick={() => handleDownload(prescription)}
                    disabled={!prescription.url}
                  >
                    <span className="consultation-notes-page__icon-box consultation-notes-page__icon-box--download">
                      <img src={downloadIcon} alt="" />
                    </span>
                  </button>
                </div>
              ) : null}
            </article>
          );
        }) : null}
      </div>
    </div>
  );
};

export default ConsultationNotesPage;
