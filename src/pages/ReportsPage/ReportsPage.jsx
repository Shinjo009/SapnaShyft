import React, { useEffect, useMemo, useRef, useState } from 'react';
import './ReportsPage.css';
import backIcon from '../../images/reports/back-icon.svg';
import chevronIcon from '../../images/reports/chevron-icon.svg';
import docIcon from '../../images/reports/doc-icon.svg';
import downloadIcon from '../../images/reports/download-icon.svg';
import {
  getLatestHealthReportMeta,
  openBioAiHealthReport,
  openBloodHealthReport,
} from '../../utils/healthReportDownload';

const RANGE_OPTIONS = Object.freeze([
  { id: '1y', label: '1 Year', months: 12 },
  { id: '6m', label: '6 Months', months: 6 },
  { id: 'all', label: 'All Time', months: null },
]);

const REPORT_ITEMS = Object.freeze([
  {
    id: 'bio-ai',
    label: 'Bio-AI Health Report',
    openReport: openBioAiHealthReport,
  },
  {
    id: 'blood',
    label: 'Blood Report',
    openReport: openBloodHealthReport,
  },
]);

const MONTH_SHORT = Object.freeze([
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec',
]);

const formatReportDate = (raw) => {
  if (!raw) {
    return '';
  }
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) {
    return String(raw);
  }
  return `${date.getDate()} ${MONTH_SHORT[date.getMonth()]} ${date.getFullYear()}`;
};

const isWithinRange = (rawDate, months) => {
  if (months == null) {
    return true;
  }
  if (!rawDate) {
    return true;
  }
  const time = new Date(rawDate).getTime();
  if (!Number.isFinite(time)) {
    return true;
  }
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - months);
  return time >= cutoff.getTime();
};

/**
 * ReportsPage — Bio-AI and Blood report cards (Figma: my reports).
 */
const ReportsPage = ({ onBack }) => {
  const [loading, setLoading] = useState(true);
  const [reportDate, setReportDate] = useState(null);
  const [hasReports, setHasReports] = useState(false);
  const [openingReportId, setOpeningReportId] = useState(null);
  const [rangeId, setRangeId] = useState('1y');
  const [isRangeOpen, setIsRangeOpen] = useState(false);
  const rangeRef = useRef(null);

  const selectedRange = RANGE_OPTIONS.find((option) => option.id === rangeId) || RANGE_OPTIONS[0];

  useEffect(() => {
    let mounted = true;

    const loadReports = async () => {
      try {
        const meta = await getLatestHealthReportMeta();
        if (!mounted) {
          return;
        }
        if (meta?.assessmentId) {
          setHasReports(true);
          setReportDate(meta.date || null);
        } else {
          setHasReports(false);
          setReportDate(null);
        }
      } catch {
        if (mounted) {
          setHasReports(false);
          setReportDate(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadReports();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isRangeOpen) {
      return undefined;
    }

    const handlePointerDown = (event) => {
      if (rangeRef.current && !rangeRef.current.contains(event.target)) {
        setIsRangeOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [isRangeOpen]);

  const visibleReports = useMemo(() => {
    if (!hasReports) {
      return [];
    }
    if (!isWithinRange(reportDate, selectedRange.months)) {
      return [];
    }
    return REPORT_ITEMS.map((item) => ({
      ...item,
      dateLabel: formatReportDate(reportDate) || 'Available now',
    }));
  }, [hasReports, reportDate, selectedRange.months]);

  const handleOpenReport = async (reportItem) => {
    if (openingReportId !== null) {
      return;
    }

    setOpeningReportId(reportItem.id);

    try {
      await reportItem.openReport();
    } catch (error) {
      console.error(`Failed to open ${reportItem.label}:`, error);
      window.alert(error?.message || 'Failed to open report. Please try again.');
    } finally {
      setOpeningReportId(null);
    }
  };

  return (
    <div className="reports-page">
      <div className="reports-page__header">
        <div className="reports-page__header-left">
          <button
            className="reports-page__back-btn"
            onClick={onBack}
            aria-label="Go back"
            type="button"
          >
            <img src={backIcon} alt="" width={24} height={24} />
          </button>
          <h1 className="reports-page__title">Reports</h1>
        </div>

        <div className="reports-page__range" ref={rangeRef}>
          <button
            type="button"
            className="reports-page__range-btn"
            onClick={() => setIsRangeOpen((prev) => !prev)}
            aria-haspopup="listbox"
            aria-expanded={isRangeOpen}
          >
            <span>{selectedRange.label}</span>
            <img
              src={chevronIcon}
              alt=""
              className={`reports-page__range-chevron${isRangeOpen ? ' is-open' : ''}`}
              width={3}
              height={6}
              aria-hidden="true"
            />
          </button>

          {isRangeOpen ? (
            <ul className="reports-page__range-menu" role="listbox" aria-label="Report time range">
              {RANGE_OPTIONS.map((option) => (
                <li key={option.id}>
                  <button
                    type="button"
                    className={`reports-page__range-option${option.id === rangeId ? ' is-selected' : ''}`}
                    role="option"
                    aria-selected={option.id === rangeId}
                    onClick={() => {
                      setRangeId(option.id);
                      setIsRangeOpen(false);
                    }}
                  >
                    {option.label}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>

      {loading ? (
        <p className="reports-page__empty">Loading reports...</p>
      ) : null}

      {!loading && !hasReports ? (
        <p className="reports-page__empty">No reports yet. They will appear here when available.</p>
      ) : null}

      {!loading && hasReports && visibleReports.length === 0 ? (
        <p className="reports-page__empty">No reports in this time range.</p>
      ) : null}

      {!loading && visibleReports.length > 0 ? (
        <div className="reports-page__list">
          {visibleReports.map((reportItem) => {
            const isOpening = openingReportId === reportItem.id;
            const isBusy = openingReportId !== null;

            return (
              <button
                key={reportItem.id}
                type="button"
                className="reports-page__card"
                onClick={() => handleOpenReport(reportItem)}
                disabled={isBusy}
                aria-busy={isOpening}
              >
                <span className="reports-page__doc-wrap" aria-hidden="true">
                  <img src={docIcon} alt="" className="reports-page__doc-icon" width={24} height={30} />
                </span>
                <div className="reports-page__meta">
                  <p className="reports-page__name">
                    {isOpening ? 'Opening report...' : reportItem.label}
                  </p>
                  <p className="reports-page__date">{reportItem.dateLabel}</p>
                </div>
                <span className="reports-page__download-icon" aria-hidden="true">
                  <img src={downloadIcon} alt="" width={24} height={24} />
                </span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
};

export default ReportsPage;
