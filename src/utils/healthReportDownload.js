import { BACKEND_BASE_URL, BACKEND_ENABLED } from '../config/appConfig';
import { getAccessToken } from './authStorage';
import {
  getLatestMetsightsBasicOrProAssessmentIdCached,
  listMetsightsBasicOrProAssessmentsCached,
  peekMyAssessmentsRowsCached,
} from '../services/reportService';
import {
  getFixedBioAiReportPdfUrl,
  getFixedBloodReportPdfUrl,
} from './assessmentBloodMarkerSupplements';

const REPORT_KIND = Object.freeze({
  BIO_AI: 'bio-ai',
  BLOOD: 'blood',
});

const REPORT_KIND_ORDER = Object.freeze({
  [REPORT_KIND.BIO_AI]: 0,
  [REPORT_KIND.BLOOD]: 1,
});

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

const toTimestamp = (value) => {
  const timestamp = new Date(value || 0).getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
};

const resolveAssessmentId = async (assessmentIdArg) => {
  const fromArg = Number(assessmentIdArg);
  if (Number.isFinite(fromArg) && fromArg > 0) {
    return fromArg;
  }
  const assessmentId = await getLatestMetsightsBasicOrProAssessmentIdCached();
  if (!Number.isFinite(assessmentId) || assessmentId <= 0) {
    throw new Error('No Metsights Basic or Pro report available yet.');
  }
  return assessmentId;
};

const pdfPathForKind = (assessmentId, kind) => (
  kind === REPORT_KIND.BLOOD
    ? `/reports/${assessmentId}/blood-parameters/pdf`
    : `/reports/${assessmentId}/bio-ai/pdf`
);

const fixedPdfUrlForKind = (assessmentId, kind) => (
  kind === REPORT_KIND.BLOOD
    ? getFixedBloodReportPdfUrl(assessmentId)
    : getFixedBioAiReportPdfUrl(assessmentId)
);

const fetchReportPdfUrl = async (assessmentId, kind) => {
  const id = Number(assessmentId);
  if (!Number.isFinite(id) || id <= 0) {
    return null;
  }

  const fixedUrl = fixedPdfUrlForKind(id, kind);
  if (fixedUrl) {
    return fixedUrl;
  }

  if (!BACKEND_ENABLED) {
    return null;
  }

  const accessToken = getAccessToken();
  if (!accessToken) {
    return null;
  }

  try {
    const response = await fetch(`${BACKEND_BASE_URL}${pdfPathForKind(id, kind)}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const body = await parseResponseBody(response);
    if (!response.ok) {
      return null;
    }

    const reportUrl = body?.data?.report_url || body?.report_url;
    return typeof reportUrl === 'string' && reportUrl.trim() ? reportUrl : null;
  } catch {
    return null;
  }
};

const requireReportPdfUrl = async (assessmentId, kind) => {
  const id = await resolveAssessmentId(assessmentId);
  const fixedUrl = fixedPdfUrlForKind(id, kind);
  if (fixedUrl) {
    return fixedUrl;
  }

  if (!BACKEND_ENABLED) {
    throw new Error('Backend base URL is not configured.');
  }

  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new Error('You are not logged in.');
  }

  const response = await fetch(`${BACKEND_BASE_URL}${pdfPathForKind(id, kind)}`, {
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

  return reportUrl;
};

export const hasAvailableHealthReports = async () => {
  try {
    const reports = await listAvailableHealthReports();
    return reports.length > 0;
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

/**
 * Profile → Reports: every Basic/Pro assessment that has an available Bio-AI and/or Blood PDF.
 * Newest assessments first; Bio-AI is listed before Blood for the same assessment.
 */
export const listAvailableHealthReports = async () => {
  const assessments = await listMetsightsBasicOrProAssessmentsCached(45000);
  const reports = [];

  const batchSize = 4;
  for (let index = 0; index < assessments.length; index += batchSize) {
    const batch = assessments.slice(index, index + batchSize);
    const batchReports = await Promise.all(batch.map(async ({ assessmentId, row }) => {
      const date = pickAssessmentRowDate(row);
      const [bioAiUrl, bloodUrl] = await Promise.all([
        fetchReportPdfUrl(assessmentId, REPORT_KIND.BIO_AI),
        fetchReportPdfUrl(assessmentId, REPORT_KIND.BLOOD),
      ]);

      const items = [];
      if (bioAiUrl) {
        items.push({
          id: `${REPORT_KIND.BIO_AI}-${assessmentId}`,
          kind: REPORT_KIND.BIO_AI,
          label: 'Bio-AI Health Report',
          assessmentId,
          date,
          reportUrl: bioAiUrl,
        });
      }
      if (bloodUrl) {
        items.push({
          id: `${REPORT_KIND.BLOOD}-${assessmentId}`,
          kind: REPORT_KIND.BLOOD,
          label: 'Blood Report',
          assessmentId,
          date,
          reportUrl: bloodUrl,
        });
      }
      return items;
    }));

    batchReports.forEach((items) => {
      reports.push(...items);
    });
  }

  reports.sort((a, b) => {
    const dateDiff = toTimestamp(b.date) - toTimestamp(a.date);
    if (dateDiff !== 0) {
      return dateDiff;
    }
    if (a.assessmentId !== b.assessmentId) {
      return Number(b.assessmentId) - Number(a.assessmentId);
    }
    return (REPORT_KIND_ORDER[a.kind] ?? 99) - (REPORT_KIND_ORDER[b.kind] ?? 99);
  });

  return reports;
};

export const openBioAiHealthReport = async (assessmentId) => {
  const reportUrl = await requireReportPdfUrl(assessmentId, REPORT_KIND.BIO_AI);
  openReportUrl(reportUrl);
};

export const openBloodHealthReport = async (assessmentId) => {
  const reportUrl = await requireReportPdfUrl(assessmentId, REPORT_KIND.BLOOD);
  openReportUrl(reportUrl);
};

export const openListedHealthReport = async (reportItem) => {
  if (reportItem?.reportUrl && typeof reportItem.reportUrl === 'string') {
    openReportUrl(reportItem.reportUrl);
    return;
  }

  if (reportItem?.kind === REPORT_KIND.BLOOD) {
    await openBloodHealthReport(reportItem?.assessmentId);
    return;
  }

  await openBioAiHealthReport(reportItem?.assessmentId);
};
