/**
 * Extra blood-parameter groups merged onto GET /reports/:assessmentId/blood-parameters
 * when the API response is incomplete for a known assessment instance.
 */
import {
  normalizeBloodParametersReportPayload,
  normalizeBloodParameterTestRow,
  pickBloodParameterGroupName,
} from './bloodParametersReportNormalize';

export const ASSESSMENT_ID_WITH_TUMOR_MARKERS_SUPPLEMENT = 7451;

/** Direct Bio-AI PDF URLs when GET /reports/:id/bio-ai/pdf should be bypassed. */
export const FIXED_BIO_AI_REPORT_PDF_BY_ASSESSMENT_ID = Object.freeze({
  [ASSESSMENT_ID_WITH_TUMOR_MARKERS_SUPPLEMENT]:
    'https://api.supershyft.com/media/bio-ai/bd33643d54074dea9f3016fd9d83c876.pdf',
});

export const getFixedBioAiReportPdfUrl = (assessmentId) => {
  const id = Number(assessmentId);
  return FIXED_BIO_AI_REPORT_PDF_BY_ASSESSMENT_ID[id] || null;
};

/** Direct blood-parameters PDF URLs when GET /reports/:id/blood-parameters/pdf should be bypassed. */
export const FIXED_BLOOD_REPORT_PDF_BY_ASSESSMENT_ID = Object.freeze({
  374: 'https://api.supershyft.com/media/blood-parameters/32a483610b4844f88978b01db3ea3d15.pdf',
  [ASSESSMENT_ID_WITH_TUMOR_MARKERS_SUPPLEMENT]:
    'https://api.supershyft.com/media/blood-parameters/7c3f88a577674babb574b26088514ad4.pdf',
});

export const getFixedBloodReportPdfUrl = (assessmentId) => {
  const id = Number(assessmentId);
  return FIXED_BLOOD_REPORT_PDF_BY_ASSESSMENT_ID[id] || null;
};

/** Same shape as backend blood-parameters groups (`group_name` + `tests[]`). */
const TUMOR_MARKERS_GROUP_ASSESSMENT_7451 = {
  group_name: 'Tumor markers',
  tests: [
    {
      test_name: 'AFP (Alpha-fetoprotein)',
      parameter_key: 'afp',
      value: 2.30,
      unit: 'ng/mL',
      reference_range: '0.00 - 7.32',
    },
    {
      test_name: 'CEA (Carcino Embryonic Antigen)',
      parameter_key: 'cea',
      value: 2.39,
      unit: 'ng/mL',
      reference_range: '0.00 - 5.00',
    },
    {
      test_name: 'CA15-3',
      parameter_key: 'ca15_3',
      value: 18.8,
      unit: 'U/mL',
      reference_range: '0.0 - 35.0',
    },
    {
      test_name: 'CA19-9',
      parameter_key: 'ca19_9',
      value: 5.7,
      unit: 'U/mL',
      reference_range: '0.0 - 37.0',
    },
    {
      test_name: 'PSA',
      parameter_key: 'psa',
      value: 0.473,
      unit: 'ng/mL',
      reference_range: '0.00 - 4.00',
    },
    {
      test_name: 'Ferritin',
      parameter_key: 'ferritin',
      value: 156.0,
      unit: 'ng/mL',
      reference_range: '24.0 - 425.0',
    },
  ],
};

const SUPPLEMENTAL_RAW_GROUPS_BY_ASSESSMENT_ID = Object.freeze({
  [ASSESSMENT_ID_WITH_TUMOR_MARKERS_SUPPLEMENT]: [TUMOR_MARKERS_GROUP_ASSESSMENT_7451],
});

const normalizeGroupKey = (name) => String(name || '').trim().toLowerCase();

const normalizeSupplementGroup = (group) => ({
  group_name: pickBloodParameterGroupName(group) || String(group?.group_name || '').trim() || 'Blood markers',
  tests: (Array.isArray(group?.tests) ? group.tests : []).map((test) => normalizeBloodParameterTestRow(test)),
});

/**
 * @param {number|string|null|undefined} assessmentId
 * @param {{ group_name: string, tests: object[] }[]} groups — normalized groups from the API
 */
export const mergeSupplementalBloodParameterGroups = (assessmentId, groups) => {
  const id = Number(assessmentId);
  const rawSupplements = SUPPLEMENTAL_RAW_GROUPS_BY_ASSESSMENT_ID[id];
  const base = Array.isArray(groups) ? [...groups] : [];

  if (!rawSupplements?.length) {
    return base;
  }

  const supplements = rawSupplements.map(normalizeSupplementGroup);

  supplements.forEach((suppGroup) => {
    const suppKey = normalizeGroupKey(suppGroup.group_name);
    const existingIndex = base.findIndex(
      (group) => normalizeGroupKey(group?.group_name || pickBloodParameterGroupName(group)) === suppKey,
    );

    if (existingIndex < 0) {
      base.push(suppGroup);
      return;
    }

    const existing = base[existingIndex];
    const existingKeys = new Set(
      (Array.isArray(existing.tests) ? existing.tests : []).map(
        (test) => String(test?.parameter_key || test?.test_name || '').trim().toLowerCase(),
      ),
    );

    const toAppend = (suppGroup.tests || []).filter((test) => {
      const key = String(test?.parameter_key || test?.test_name || '').trim().toLowerCase();
      return key && !existingKeys.has(key);
    });

    base[existingIndex] = {
      ...existing,
      tests: [...(Array.isArray(existing.tests) ? existing.tests : []), ...toAppend],
    };
  });

  return base;
};

/** Normalized groups for UI: API payload + assessment-specific supplements. */
export const buildBloodParametersGroupsForAssessment = (assessmentId, payload) => {
  const base = normalizeBloodParametersReportPayload(payload);
  return mergeSupplementalBloodParameterGroups(assessmentId, base);
};
