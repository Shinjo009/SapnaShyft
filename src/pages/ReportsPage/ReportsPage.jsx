import React, { useEffect, useState } from 'react';
import './ReportsPage.css';
import pdfIcon from '../../images/pdf.svg';
import {
  hasAvailableHealthReports,
  openBioAiHealthReport,
  openBloodHealthReport,
} from '../../utils/healthReportDownload';

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

const ReportEyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M22 12C22 12 17.522 18 12 18C6.478 18 2 12 2 12C2 12 6.478 6 12 6C17.522 6 22 12 22 12Z" stroke="white" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 15C12.7956 15 13.5587 14.6839 14.1213 14.1213C14.6839 13.5587 15 12.7956 15 12C15 11.2044 14.6839 10.4413 14.1213 9.87868C13.5587 9.31607 12.7956 9 12 9C11.2044 9 10.4413 9.31607 9.87868 9.87868C9.31607 10.4413 9 11.2044 9 12C9 12.7956 9.31607 13.5587 9.87868 14.1213C10.4413 14.6839 11.2044 15 12 15Z" stroke="white" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/**
 * ReportsPage — Bio-AI and Blood reports (same as home download menu).
 */
const ReportsPage = ({ onBack }) => {
  const [loading, setLoading] = useState(true);
  const [hasReports, setHasReports] = useState(false);
  const [openingReportId, setOpeningReportId] = useState(null);

  useEffect(() => {
    let mounted = true;

    const loadReportsAvailability = async () => {
      try {
        const available = await hasAvailableHealthReports();
        if (mounted) {
          setHasReports(available);
        }
      } catch {
        if (mounted) {
          setHasReports(false);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadReportsAvailability();

    return () => {
      mounted = false;
    };
  }, []);

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
        <button
          className="reports-page__back-btn"
          onClick={onBack}
          aria-label="Go back"
          type="button"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <h1 className="reports-page__title">Reports</h1>
      </div>

      {loading ? (
        <p className="reports-page__empty">Loading reports...</p>
      ) : null}

      {!loading && !hasReports ? (
        <p className="reports-page__empty">No reports yet. They will appear here when available.</p>
      ) : null}

      {!loading && hasReports ? (
        <div className="reports-page__list">
          {REPORT_ITEMS.map((reportItem) => {
            const isOpening = openingReportId === reportItem.id;
            const isBusy = openingReportId !== null;

            return (
              <button
                key={reportItem.id}
                type="button"
                className="reports-page__row reports-page__row-btn"
                onClick={() => handleOpenReport(reportItem)}
                disabled={isBusy}
                aria-busy={isOpening}
              >
                <img src={pdfIcon} alt="" aria-hidden="true" className="reports-page__pdf-icon" />
                <div className="reports-page__meta">
                  <p className="reports-page__name">
                    {isOpening ? 'Opening report...' : reportItem.label}
                  </p>
                  <p className="reports-page__date">Tap to view</p>
                </div>
                <span className="reports-page__open-icon" aria-hidden="true">
                  <ReportEyeIcon />
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
