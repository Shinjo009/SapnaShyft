import { BACKEND_BASE_URL, BACKEND_ENABLED } from '../config/appConfig';
import { getAccessToken } from './authStorage';
import {
  getLatestMetsightsBasicOrProAssessmentIdCached,
  peekMyAssessmentsRowsCached,
} from '../services/reportService';
import {
  getFixedBioAiReportPdfUrl,
  getFixedBloodReportPdfUrl,
} from './assessmentBloodMarkerSupplements';

const parseResponseBody = async (response) => {
  const contentType = response?.headers?.get?.('content-type') || '';
  if (contentType.toLowerCase().includes('application/json')) {
    return response.json();
  }

  const text = await response.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return { message: text };
  }
};

const openReportUrl = (reportUrl) => {
  const link = document.createElement('a');
  link.href = reportUrl;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  document.body.appendChild(link);
  link.click();
  link.remove();
};

const pickAssessmentRowDate = (row) => {
  if (!row || typeof row !== 'object') {
    return null;
  }
  return (
    row.completed_at
    || row.completedAt
    || row.updated_at
    || row.updatedAt
    || row.created_at
    || row.createdAt
    || row.assigned_at
    || row.assignedAt
    || row.assessment?.completed_at
    || row.assessment?.updated_at
    || row.assessment?.created_at
    || row.assessment?.assigned_at
    || null
  );
};

const extractAssessmentIdFromRow = (row) => {
  if (!row || typeof row !== 'object') {
    return null;
  }
  return (
    row.assessment_instance_id
    || row.assessmentInstanceId
    || row.assessment_id
    || row.assessmentId
    || row.id
    || row.assessment?.assessment_instance_id
    || row.assessment?.id
    || null
  );
};

const resolveAssessmentId = async () => {
  const assessmentId = await getLatestMetsightsBasicOrProAssessmentIdCached();
  if (!Number.isFinite(assessmentId) || assessmentId <= 0) {
    throw new Error('No Metsights Basic or Pro report available yet.');
  }
  return assessmentId;
};

export const hasAvailableHealthReports = async () => {
  try {
    const assessmentId = await getLatestMetsightsBasicOrProAssessmentIdCached();
    return Number.isFinite(assessmentId) && assessmentId > 0;
  } catch {
    return false;
  }
};

/** Latest report meta for Reports page cards (id + date). */
export const getLatestHealthReportMeta = async () => {
  try {
    const assessmentId = await getLatestMetsightsBasicOrProAssessmentIdCached();
    if (!Number.isFinite(assessmentId) || assessmentId <= 0) {
      return null;
    }

    const rows = await peekMyAssessmentsRowsCached(45000);
    const matched = (Array.isArray(rows) ? rows : []).find((row) => {
      const id = Number(extractAssessmentIdFromRow(row));
      return id === assessmentId;
    }) || null;

    return {
      assessmentId,
      date: pickAssessmentRowDate(matched),
    };
  } catch {
    return null;
  }
};

export const openBioAiHealthReport = async () => {
  const assessmentId = await resolveAssessmentId();

  const fixedBioAiPdfUrl = getFixedBioAiReportPdfUrl(assessmentId);
  if (fixedBioAiPdfUrl) {
    openReportUrl(fixedBioAiPdfUrl);
    return;
  }

  if (!BACKEND_ENABLED) {
    throw new Error('Backend base URL is not configured.');
  }

  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new Error('You are not logged in.');
  }

  const response = await fetch(`${BACKEND_BASE_URL}/reports/${assessmentId}/bio-ai/pdf`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const body = await parseResponseBody(response);

  if (!response.ok) {
    throw new Error(body?.message || body?.detail || 'Failed to download report.');
  }

  const reportUrl = body?.data?.report_url || body?.report_url;
  if (!reportUrl || typeof reportUrl !== 'string') {
    throw new Error('Report URL is missing from API response.');
  }

  openReportUrl(reportUrl);
};

export const openBloodHealthReport = async () => {
  const assessmentId = await resolveAssessmentId();

  const fixedBloodPdfUrl = getFixedBloodReportPdfUrl(assessmentId);
  if (fixedBloodPdfUrl) {
    openReportUrl(fixedBloodPdfUrl);
    return;
  }

  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new Error('You are not logged in.');
  }

  if (!BACKEND_ENABLED) {
    throw new Error('Backend base URL is not configured.');
  }

  const response = await fetch(`${BACKEND_BASE_URL}/reports/${assessmentId}/blood-parameters/pdf`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const body = await parseResponseBody(response);

  if (!response.ok) {
    throw new Error(body?.message || body?.detail || 'Failed to download report.');
  }

  const reportUrl = body?.data?.report_url || body?.report_url;
  if (!reportUrl || typeof reportUrl !== 'string') {
    throw new Error('Report URL is missing from API response.');
  }

  openReportUrl(reportUrl);
};
