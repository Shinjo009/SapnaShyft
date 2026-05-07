import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import './BloodMarkersPage.css';
import { BACKEND_BASE_URL, BACKEND_ENABLED } from '../../config/appConfig';
import { getAccessToken } from '../../utils/authStorage';
import { fetchLatestAssessmentReport } from '../../services/reportService';
import {
  extractBloodParameterGroupsArray,
  getBloodParameterTestsFromGroup,
  normalizeBloodParameterTestRow,
  pickBloodParameterGroupName,
  resolveBloodParameterNumericValue,
} from '../../utils/bloodParametersReportNormalize';
import haematologyIcon from '../../images/Haemotology.svg';
import liverIcon from '../../images/Liver.svg';
import kidneyIcon from '../../images/Kidney.svg';
import vitaminsIcon from '../../images/Vitamins.svg';
import lipidIcon from '../../images/Lipid.svg';
import ironIcon from '../../images/Iron.svg';
import thyroidIcon from '../../images/Thyroid.svg';
import diabetesIcon from '../../images/Diabetes.svg';
import inflammationIcon from '../../images/Inflammation.svg';
import sleepIcon from '../../images/Sleep.svg';
import hormonesIcon from '../../images/Hormones.svg';

const FILTERS = ['Optimal', 'Marginal', 'Critical'];

/** Same limit as homepage Blood Markers list (`RiskAnalysisSection`). */
const BLOOD_MARKERS_STACK_CARD_NAME_MAX = 14;

const truncateBloodMarkersStackCardName = (name) => {
  const s = String(name ?? '');
  if (s.length <= BLOOD_MARKERS_STACK_CARD_NAME_MAX) {
    return s;
  }
  return `${s.slice(0, BLOOD_MARKERS_STACK_CARD_NAME_MAX)}...`;
};

const ORGAN_ICON_BY_NAME = {
  haematology: haematologyIcon,
  liver: liverIcon,
  kidney: kidneyIcon,
  vitamins: vitaminsIcon,
  lipid: lipidIcon,
  iron: ironIcon,
  thyroid: thyroidIcon,
  diabetes: diabetesIcon,
  inflammation: inflammationIcon,
  sleep: sleepIcon,
  hormones: hormonesIcon,
};

const RISK_META = {
  low: {
    label: 'OPTIMAL',
    color: '#4ADE80',
  },
  moderate: {
    label: 'LOW RISK',
    color: '#DAC15A',
  },
  increased: {
    label: 'MODERATE RISK',
    color: '#E95D5C',
  },
  high: {
    label: 'HIGH RISK',
    color: '#E95D5C',
  },
};

const RISK_DOT_BACKGROUND = {
  low: 'linear-gradient(180deg, #90DF9E 0%, #4E7956 100%), #90DF9E',
  moderate: 'linear-gradient(180deg, #DAC15A 0%, #746730 100%), linear-gradient(90deg, #EE8B48 0%, #884F29 100%), #90DF9E',
  high: 'linear-gradient(180deg, #E95D5C 0%, #833434 100%)',
};

const METER_SEGMENTS = {
  low: [
    { background: '#4ADE80', boxShadow: '0 0 12px 0 rgba(144, 223, 158, 0.40)' },
    { background: '#4ADE80', boxShadow: '0 0 12px 0 rgba(144, 223, 158, 0.40)' },
    { background: 'rgba(74, 222, 128, 0.75)', boxShadow: '0 0 12px 0 rgba(144, 223, 158, 0.40)' },
    { background: 'rgba(74, 222, 128, 0.50)' },
    { background: 'rgba(74, 222, 128, 0.40)' },
    { background: 'rgba(74, 222, 128, 0.30)' },
    { background: 'rgba(74, 222, 128, 0.25)' },
    { background: 'rgba(74, 222, 128, 0.20)' },
    { background: 'rgba(74, 222, 128, 0.15)' },
    { background: 'rgba(74, 222, 128, 0.10)' },
  ],
  moderate: [
    { background: 'rgba(218, 193, 90, 0.10)' },
    { background: 'rgba(218, 193, 90, 0.25)' },
    { background: 'rgba(218, 193, 90, 0.30)' },
    { background: '#DAC15A', boxShadow: '0 0 12px 0 rgba(218, 193, 90, 0.40)' },
    { background: '#DAC15A', boxShadow: '0 0 12px 0 rgba(218, 193, 90, 0.40)' },
    { background: 'rgba(218, 193, 90, 0.75)', boxShadow: '0 0 12px 0 rgba(218, 193, 90, 0.40)' },
    { background: 'rgba(218, 193, 90, 0.50)' },
    { background: 'rgba(218, 193, 90, 0.40)' },
    { background: 'rgba(218, 193, 90, 0.20)' },
    { background: 'rgba(218, 193, 90, 0.15)' },
  ],
  increased: [
    { background: 'rgba(239, 68, 68, 0.10)' },
    { background: 'rgba(239, 68, 68, 0.15)' },
    { background: 'rgba(239, 68, 68, 0.20)' },
    { background: 'rgba(239, 68, 68, 0.25)' },
    { background: 'rgba(239, 68, 68, 0.30)' },
    { background: 'rgba(239, 68, 68, 0.40)' },
    { background: 'rgba(239, 68, 68, 0.50)' },
    { background: 'rgba(239, 68, 68, 0.75)', boxShadow: '0 0 12px 0 rgba(239, 68, 68, 0.40)' },
    { background: '#EF4444', boxShadow: '0 0 12px 0 rgba(239, 68, 68, 0.40)' },
    { background: '#EF4444', boxShadow: '0 0 12px 0 rgba(239, 68, 68, 0.40)' },
  ],
  high: [
    { background: 'rgba(239, 68, 68, 0.10)' },
    { background: 'rgba(239, 68, 68, 0.15)' },
    { background: 'rgba(239, 68, 68, 0.20)' },
    { background: 'rgba(239, 68, 68, 0.25)' },
    { background: 'rgba(239, 68, 68, 0.30)' },
    { background: 'rgba(239, 68, 68, 0.40)' },
    { background: 'rgba(239, 68, 68, 0.50)' },
    { background: 'rgba(239, 68, 68, 0.75)', boxShadow: '0 0 12px 0 rgba(239, 68, 68, 0.40)' },
    { background: '#EF4444', boxShadow: '0 0 12px 0 rgba(239, 68, 68, 0.40)' },
    { background: '#EF4444', boxShadow: '0 0 12px 0 rgba(239, 68, 68, 0.40)' },
  ],
};

const getRiskTypeFromBounds = (value, lowerRange, upperRange) => {
  const numericValue = Number(value);
  let lower = Number(lowerRange);
  let upper = Number(upperRange);

  if (!Number.isFinite(numericValue) || !Number.isFinite(lower) || !Number.isFinite(upper)) {
    return 'low';
  }

  if (lower > upper) {
    const swap = lower;
    lower = upper;
    upper = swap;
  }

  if (numericValue >= lower && numericValue <= upper) {
    return 'low';
  }

  const isBelowRange = numericValue < lower;
  const boundary = isBelowRange ? lower : upper;
  const deviation = isBelowRange ? (lower - numericValue) : (numericValue - upper);
  const deviationPercent = (deviation / Math.max(Math.abs(boundary), 1e-6)) * 100;

  if (deviationPercent <= 15) {
    return 'moderate';
  }

  return 'high';
};

const DETAIL_HIGH_RISK_DISPLAY_PADDING = 30;

const getDisplayRiskType = (type) => {
  if (type === 'increased') {
    return 'high';
  }

  return type;
};

const getRiskColorByType = (type) => {
  const displayType = getDisplayRiskType(type);
  return RISK_META[displayType]?.color || RISK_META.low.color;
};

const getOrganIcon = (organName) => {
  const key = String(organName || '').trim().toLowerCase();
  if (key.includes('hemogram')) {
    return haematologyIcon;
  }
  return ORGAN_ICON_BY_NAME[key] || liverIcon;
};

const parseResponseBody = async (response) => {
  const text = await response.text();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

const authorizedGet = async (path) => {
  if (!BACKEND_ENABLED) {
    throw new Error('Backend base URL is not configured.');
  }

  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new Error('You are not logged in.');
  }

  const response = await fetch(`${BACKEND_BASE_URL}${path}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  const body = await parseResponseBody(response);
  if (!response.ok) {
    throw new Error(body?.message || body?.detail || 'Request failed.');
  }

  return body;
};

const toOrganName = (groupName) => {
  const raw = String(groupName || '').trim();
  const normalized = raw.toLowerCase();

  const byKeyword = [
    ['haematology', 'Haematology'],
    ['hematology', 'Haematology'],
    ['liver', 'Liver'],
    ['kidney', 'Kidney'],
    ['vitamin', 'Vitamins'],
    ['lipid', 'Lipid'],
    ['iron', 'Iron'],
    ['thyroid', 'Thyroid'],
    ['diabetes', 'Diabetes'],
    ['inflammation', 'Inflammation'],
    ['sleep', 'Sleep'],
    ['hormone', 'Hormones'],
  ];

  for (const [keyword, label] of byKeyword) {
    if (normalized.includes(keyword)) {
      return label;
    }
  }

  const cleaned = raw.replace(/\s*profile\s*$/i, '').trim();
  return cleaned || 'Liver';
};

const formatValue = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return String(value ?? '');
  }

  return Number.isInteger(numeric) ? String(numeric) : numeric.toFixed(2).replace(/\.00$/, '');
};

/** Row from homepage `RiskAnalysisSection` blood markers → `BloodMarkerDetailView` marker shape */
const mapHomeBloodMarkerRowToDetailMarker = (row) => {
  if (!row || typeof row !== 'object') {
    return null;
  }
  const name = String(row.displayName || row.name || 'Test').trim();
  const markerUpper = name.toUpperCase();
  const numeric = Number(row.numericValue);
  const hasVal = Number.isFinite(numeric);
  const unit = String(row.unit || '').trim();
  const rk = row.riskKey;
  const riskType = rk === 'high' ? 'high' : rk === 'low' ? 'moderate' : 'low';
  const lower = row.normalMin;
  const higher = row.normalMax;

  return {
    id: String(row.id || `home-${markerUpper}`),
    marker: markerUpper,
    title: name,
    value: hasVal ? formatValue(numeric) : '--',
    unit,
    diagnosticTestId: row.diagnosticTestId ?? null,
    normalMin: Number.isFinite(Number(lower)) ? Number(lower) : null,
    normalMax: Number.isFinite(Number(higher)) ? Number(higher) : null,
    riskType,
    causes: [],
    effects: [],
  };
};

const toStringArray = (value) => {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === 'string') {
          return item.trim();
        }

        if (item && typeof item === 'object') {
          const text = item.text || item.label || item.title || item.description || item.value;
          return typeof text === 'string' ? text.trim() : '';
        }

        return '';
      })
      .filter(Boolean);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed ? [trimmed] : [];
  }

  return [];
};

const pickApiList = (obj, keys) => {
  for (const key of keys) {
    const values = toStringArray(obj?.[key]);
    if (values.length > 0) {
      return values;
    }
  }

  return [];
};

const pickFirstText = (obj, keys) => {
  for (const key of keys) {
    const value = obj?.[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return '';
};

const extractDiagnosticTestPayload = (payload) => {
  if (!payload) {
    return null;
  }

  if (payload.data && typeof payload.data === 'object') {
    return payload.data;
  }

  if (payload.result && typeof payload.result === 'object') {
    return payload.result;
  }

  if (payload.item && typeof payload.item === 'object') {
    return payload.item;
  }

  if (typeof payload === 'object') {
    return payload;
  }

  return null;
};

const getCategoryFromTests = (tests) => {
  const safeTests = Array.isArray(tests) ? tests : [];
  const riskReadyTests = safeTests.filter((test) => test.isClassifiable);

  const hasHigh = riskReadyTests.some((test) => test.riskType === 'high');
  if (hasHigh) {
    return 'Critical';
  }

  const hasMarginal = riskReadyTests.some((test) => test.riskType === 'moderate' || test.riskType === 'increased');
  if (hasMarginal) {
    return 'Marginal';
  }

  // Optimal section is strict: every parameter must be classifiable and in optimal range.
  if (safeTests.length > 0 && riskReadyTests.length === safeTests.length && riskReadyTests.every((test) => test.riskType === 'low')) {
    return 'Optimal';
  }

  // If we cannot prove high/marginal, keep it out of marginal/critical stacks.
  return 'Optimal';
};

const getPrimaryMarginalRiskType = (tests) => {
  const riskReadyTests = tests.filter((test) => test.isClassifiable);

  if (riskReadyTests.some((test) => test.riskType === 'increased')) {
    return 'increased';
  }

  return 'moderate';
};

const getRepresentativeTest = (tests, desiredType) => {
  const riskReadyTests = tests.filter((test) => test.isClassifiable);

  const direct = riskReadyTests.find((test) => test.riskType === desiredType);
  if (direct) {
    return direct;
  }

  if (desiredType === 'increased') {
    return riskReadyTests.find((test) => test.riskType === 'moderate') || null;
  }

  if (desiredType === 'moderate') {
    return riskReadyTests.find((test) => test.riskType === 'increased') || null;
  }

  if (desiredType === 'high') {
    return riskReadyTests.find((test) => test.riskType === 'moderate' || test.riskType === 'increased') || null;
  }

  return null;
};

const buildSectionsFromApi = (payloadOrGroups) => {
  const rawGroups = extractBloodParameterGroupsArray(payloadOrGroups);

  return rawGroups
    .map((group, groupIndex) => {
      const organ = toOrganName(pickBloodParameterGroupName(group));
      const key = organ.toLowerCase();
      const tests = getBloodParameterTestsFromGroup(group);

      const mappedTests = tests.map((test, index) => {
        const n = normalizeBloodParameterTestRow(test);
        const resolvedNumeric = resolveBloodParameterNumericValue(n, test);
        const valueRaw = resolvedNumeric !== undefined ? resolvedNumeric : null;
        const value = Number(valueRaw);
        const hasValue = valueRaw !== null && valueRaw !== undefined && Number.isFinite(value);

        const lowerRaw = n.lower_range;
        const higherRaw = n.higher_range;
        let lower = Number(lowerRaw);
        let higher = Number(higherRaw);
        const numericRangesOk = lowerRaw !== null && lowerRaw !== undefined
          && higherRaw !== null && higherRaw !== undefined
          && Number.isFinite(lower)
          && Number.isFinite(higher);
        if (numericRangesOk && lower > higher) {
          const swap = lower;
          lower = higher;
          higher = swap;
        }
        const hasRanges = numericRangesOk && lower <= higher;
        const isClassifiable = hasValue && hasRanges;

        return {
          id: `${key}-test-${groupIndex}-${index}`,
          marker: String(n.test_name || 'TEST').toUpperCase(),
          title: String(n.test_name || 'Test'),
          diagnosticTestId: n.diagnostic_test_id
            || n.test_id
            || test?.diagnostic_test_id
            || test?.diagnosticTestId
            || test?.test_id
            || test?.testId
            || test?.id
            || test?.diagnostic_test?.test_id
            || test?.diagnostic_test?.id
            || null,
          value: hasValue ? formatValue(value) : '--',
          unit: String(n.unit || '').trim(),
          rawValue: hasValue ? value : null,
          normalMin: hasRanges ? lower : null,
          normalMax: hasRanges ? higher : null,
          isClassifiable,
          riskType: isClassifiable ? getRiskTypeFromBounds(value, lower, higher) : null,
          causes: pickApiList(test, ['causes', 'cause', 'possible_causes', 'reason', 'reasons']),
          effects: pickApiList(test, ['effects', 'effect', 'possible_effects', 'impact', 'impacts']),
        };
      }).filter((test) => test.rawValue !== null && Number.isFinite(test.rawValue));

      const noReferenceRangeHiddenCount = mappedTests.filter((test) => !test.isClassifiable).length;
      const visibleTests = mappedTests.filter((test) => test.isClassifiable);

      const classifiableTests = visibleTests;
      const highTests = visibleTests.filter((test) => test.riskType === 'high');
      const lowRiskTests = visibleTests.filter((test) => test.riskType === 'moderate' || test.riskType === 'increased');
      const optimalTests = visibleTests.filter((test) => test.riskType === 'low');

      const initialCategory = getCategoryFromTests(mappedTests);
      const primaryMarginalRiskType = getPrimaryMarginalRiskType(mappedTests);
      const marginalTest = getRepresentativeTest(mappedTests, primaryMarginalRiskType);
      const criticalTest = getRepresentativeTest(mappedTests, 'high');

      const category = initialCategory === 'Critical' && highTests.length === 0
        ? 'Marginal'
        : initialCategory === 'Marginal' && lowRiskTests.length === 0
          ? 'Optimal'
          : initialCategory;

      const riskTypes = category === 'Critical'
        ? ['high', primaryMarginalRiskType, 'low']
        : category === 'Marginal'
          ? [primaryMarginalRiskType, 'low']
          : ['low'];

      const primaryTheme = category === 'Critical'
        ? 'high'
        : category === 'Marginal'
          ? primaryMarginalRiskType
          : 'low';

      const visibleCount = visibleTests.length;
      const totalWithNumericValue = visibleCount + noReferenceRangeHiddenCount;
      const parametersLabel = totalWithNumericValue > 0
        ? `${totalWithNumericValue} parameter${totalWithNumericValue === 1 ? '' : 's'}`
        : '0 parameters';

      return {
        id: `api-${key}-${groupIndex}`,
        organ,
        parameters: parametersLabel,
        theme: primaryTheme,
        category,
        riskTypes,
        tests: visibleTests,
        noReferenceRangeHiddenCount,
        classifiableTests,
        highTests,
        lowRiskTests,
        optimalTests,
        primaryMarginalRiskType,
        marginalTest,
        criticalTest,
      };
    })
    .filter((section) => section.tests.length > 0 || section.noReferenceRangeHiddenCount > 0)
    .sort((a, b) => a.organ.localeCompare(b.organ));
};

const SwipeArrow = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M4 11.3334L7.33333 8.00008L4 4.66675M8.66667 11.3334L12 8.00008L8.66667 4.66675" stroke="#9A9A9A" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CardChevron = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="8" height="12" viewBox="0 0 8 12" fill="none" aria-hidden="true">
    <path d="M0.765298 10.7501L6.79252 5.74121L0.750564 0.750102" stroke="#CCCCCC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const DownChevron = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="8" viewBox="0 0 12 8" fill="none" aria-hidden="true">
    <path d="M1 1.5L6 6.5L11 1.5" stroke="#CCCCCC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const DotBullet = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="4" height="4" viewBox="0 0 4 4" fill="none" aria-hidden="true">
    <circle cx="2" cy="2" r="2" fill="#90DF9E"/>
  </svg>
);

const RiskTrendIcon = ({ type }) => {
  const color = getRiskColorByType(type);

  if (type === 'low') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="7" viewBox="0 0 12 7" fill="none" aria-hidden="true">
        <path d="M8.41504 6.26172L9.2627 5.41406L6.41895 2.57031L4.50488 4.48438C4.28613 4.73047 3.90332 4.73047 3.68457 4.48438L0.18457 0.984375C-0.0615234 0.765625 -0.0615234 0.382812 0.18457 0.164062C0.40332 -0.0546875 0.786133 -0.0546875 1.00488 0.164062L4.09473 3.25391L6.00879 1.33984C6.22754 1.09375 6.61035 1.09375 6.8291 1.33984L10.083 4.59375L10.9307 3.74609C11.1221 3.58203 11.4229 3.69141 11.4229 3.96484V6.45312C11.4229 6.61719 11.2861 6.75391 11.1221 6.75391H8.63379C8.3877 6.75391 8.25098 6.42578 8.41504 6.26172Z" fill={color}/>
      </svg>
    );
  }

  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="7" viewBox="0 0 12 7" fill="none" aria-hidden="true">
      <path d="M8.41504 0.492188L9.2627 1.33984L6.41895 4.18359L4.50488 2.26953C4.28613 2.02344 3.90332 2.02344 3.68457 2.26953L0.18457 5.76953C-0.0615234 5.98828 -0.0615234 6.37109 0.18457 6.58984C0.40332 6.80859 0.786133 6.80859 1.00488 6.58984L4.09473 3.5L6.00879 5.41406C6.22754 5.66016 6.61035 5.66016 6.8291 5.41406L10.083 2.16016L10.9307 3.00781C11.1221 3.17188 11.4229 3.0625 11.4229 2.78906V0.300781C11.4229 0.136719 11.3135 0 11.1494 0H8.63379C8.3877 0 8.25098 0.328125 8.41504 0.492188V0.492188" fill={color}/>
    </svg>
  );
};

const markerCards = (section) => {
  const cards = [];

  const pushTestCard = (test, riskType, indexKey) => {
    cards.push({
      id: `${section.id}-${riskType}-${indexKey}`,
      marker: test.marker,
      value: test.value,
      unit: test.unit,
      diagnosticTestId: test.diagnosticTestId,
      riskType,
      normalMin: test.normalMin,
      normalMax: test.normalMax,
      title: test.title,
      causes: test.causes,
      effects: test.effects,
    });
  };

  if (section.category === 'Critical') {
    (section.highTests || []).forEach((test, index) => pushTestCard(test, 'high', index));
    (section.lowRiskTests || []).forEach((test, index) => pushTestCard(test, test.riskType || 'moderate', `l-${index}`));
  } else if (section.category === 'Marginal') {
    (section.lowRiskTests || []).forEach((test, index) => pushTestCard(test, test.riskType || 'moderate', index));
  }

  if ((section.optimalTests || []).length > 0) {
    cards.push({
      id: `${section.id}-low-summary`,
      riskType: 'low',
      marker: 'OPTIMAL',
      value: '',
      unit: '',
      normalMin: null,
      normalMax: null,
    });
  }

  if (cards.length === 0 && section.category === 'Optimal') {
    cards.push({
      id: `${section.id}-low-only`,
      riskType: 'low',
      marker: 'OPTIMAL',
      value: '',
      unit: '',
      normalMin: null,
      normalMax: null,
    });
  }

  return cards;
};

const formatTestListValue = (test) => {
  if (test.rawValue === null || !Number.isFinite(test.rawValue)) {
    return '--';
  }
  return `${formatValue(test.rawValue)}${test.unit ? ` ${test.unit}` : ''}`;
};

const PARAMETER_BUCKET_LABELS = {
  optimal: 'IN OPTIMAL RANGE',
  marginal: 'MARGINAL RISK',
  critical: 'CRITICAL RISK',
};

const bucketTestForList = (test) => {
  if (!test.isClassifiable) {
    return 'no_ref';
  }
  if (test.riskType === 'low') {
    return 'optimal';
  }
  if (test.riskType === 'high') {
    return 'critical';
  }
  return 'marginal';
};

/** Optimal pills only list in-range (low) markers; +more = other visible markers on this organ + hidden no-ref. */
const getMorePillCountForOptimalRow = (section, optimalPillTests) => {
  const tests = Array.isArray(section.tests) ? section.tests : [];
  const optimalCount = Array.isArray(optimalPillTests) ? optimalPillTests.length : 0;
  const hiddenNoRef = section.noReferenceRangeHiddenCount ?? 0;
  return Math.max(0, tests.length - optimalCount) + hiddenNoRef;
};

/** `optimal_only`: pill-group for in-range tests; `all`: segregated — optimal as pills (names only), other tiers as detail rows */
const buildSegregatedParameterRows = (section, mode) => {
  const rows = [];
  const tests = Array.isArray(section.tests) ? section.tests : [];

  const pushHeading = (key, label) => {
    rows.push({ type: 'heading', key, label });
  };

  const pushDetailItem = (test) => {
    const bucket = bucketTestForList(test);
    const valueStr = formatTestListValue(test);
    let suffix = '';
    if (bucket !== 'optimal') {
      suffix = bucket === 'critical' ? ' · Critical' : ' · Marginal';
    }
    rows.push({
      type: 'item',
      key: test.id,
      text: `${test.title}: ${valueStr}${suffix}`,
    });
  };

  if (mode === 'optimal_only') {
    const optimalList = tests.filter((t) => t.isClassifiable && t.riskType === 'low');
    rows.push({
      type: 'pill-group',
      key: 'optimal-pills',
      tests: optimalList,
      morePillCount: getMorePillCountForOptimalRow(section, optimalList),
    });
    return rows;
  }

  const order = ['optimal', 'marginal', 'critical'];
  const tiersPresent = order.filter((tier) => tests.some((t) => bucketTestForList(t) === tier));
  const onlyOptimalBucket = tiersPresent.length === 1 && tiersPresent[0] === 'optimal';

  for (const tier of order) {
    const inTier = tests.filter((t) => bucketTestForList(t) === tier);
    if (inTier.length === 0) {
      continue;
    }
    if (!(onlyOptimalBucket && tier === 'optimal')) {
      pushHeading(`heading-${tier}`, PARAMETER_BUCKET_LABELS[tier]);
    }
    if (tier === 'optimal') {
      rows.push({
        type: 'pill-group',
        key: `pills-${tier}`,
        tests: inTier,
        morePillCount: getMorePillCountForOptimalRow(section, inTier),
      });
    } else {
      inTier.forEach(pushDetailItem);
    }
  }

  const hiddenNoRef = section.noReferenceRangeHiddenCount ?? 0;
  if (mode === 'all' && hiddenNoRef > 0) {
    const hasOptimalPillRow = rows.some(
      (r) => r.type === 'pill-group' && String(r.key || '').includes('optimal'),
    );
    if (!hasOptimalPillRow) {
      rows.push({
        type: 'pill-group',
        key: 'pills-no-ref-more',
        tests: [],
        morePillCount: hiddenNoRef,
      });
    }
  }

  return rows;
};

const BloodMarkersParameterRows = ({ rows, keyPrefix = '' }) => {
  const out = [];
  let detailQueue = [];
  let detailKeyBase = '';

  const flushDetails = () => {
    if (detailQueue.length === 0) {
      return;
    }
    out.push(
      <div
        key={`${keyPrefix}${detailKeyBase}-detail-grid`}
        className="blood-markers-page__optimal-params-detail-grid"
      >
        {detailQueue}
      </div>,
    );
    detailQueue = [];
    detailKeyBase = '';
  };

  rows.forEach((row, rowIndex) => {
    const compositeKey = `${keyPrefix}${row.key}-${rowIndex}`;
    if (row.type === 'heading') {
      flushDetails();
      out.push(
        <div key={compositeKey} className="blood-markers-page__optimal-params-heading">
          {row.label}
        </div>,
      );
      return;
    }
    if (row.type === 'pill-group') {
      flushDetails();
      const morePillCount = row.morePillCount ?? 0;
      out.push(
        <div
          key={compositeKey}
          className="blood-markers-page__optimal-pills"
          role="list"
          aria-label="Parameters in optimal range"
        >
          {row.tests.map((test, pillIndex) => (
            <span key={`${compositeKey}-${test.id}-${pillIndex}`} className="blood-markers-page__optimal-pill" role="listitem">
              {test.title}
            </span>
          ))}
          {morePillCount > 0 ? (
            <span
              key={`${compositeKey}-more`}
              className="blood-markers-page__optimal-more-text"
              role="listitem"
              aria-label={`${morePillCount} additional parameter${morePillCount === 1 ? '' : 's'} not listed here`}
            >
              +more
            </span>
          ) : null}
        </div>,
      );
      return;
    }
    if (!detailKeyBase) {
      detailKeyBase = row.key || `row-${rowIndex}`;
    }
    detailQueue.push(
      <span key={compositeKey} className="blood-markers-page__optimal-param-chunk">
        <span className="blood-markers-page__optimal-param-dot" aria-hidden="true">
          <DotBullet />
        </span>
        <span className="blood-markers-page__optimal-param-item">{row.text}</span>
      </span>,
    );
  });

  flushDetails();

  return <>{out}</>;
};

const getOptimalSectionHeadline = (section) => {
  const tests = section.tests || [];
  const hiddenNoRef = section.noReferenceRangeHiddenCount ?? 0;
  const allVisibleLow = tests.length > 0 && tests.every((t) => t.riskType === 'low');

  if (tests.length === 0 && hiddenNoRef > 0) {
    return { prefix: 'PARAMETERS', title: 'OPTIMAL RANGE' };
  }
  if (allVisibleLow && hiddenNoRef === 0) {
    return { prefix: 'ALL PARAMETERS ARE IN', title: 'OPTIMAL RANGE' };
  }
  if (allVisibleLow && hiddenNoRef > 0) {
    return { prefix: 'ALL SCORED PARAMETERS ARE IN', title: 'OPTIMAL RANGE' };
  }
  return { prefix: 'PARAMETERS', title: 'OPTIMAL RANGE' };
};

/** Copy for the green “optimal” summary card inside swipe stacks (never “overview”). */
const getOptimalLowCardHeadline = (section) => {
  const n = section.optimalTests?.length ?? 0;
  const hiddenNoRef = section.noReferenceRangeHiddenCount ?? 0;
  if (n === 0 && hiddenNoRef > 0) {
    return { prefix: 'PARAMETERS', title: 'OPTIMAL RANGE' };
  }
  return { prefix: `${n} PARAMETERS ARE IN`, title: 'OPTIMAL RANGE' };
};

const BLOOD_MARKER_DETAIL_CONTENT = {
  ALBUMIN: {
    title: 'Albumin',
    description: 'Measure of the main protein in blood that maintains fluid balance and transports substances.',
    defaultValue: 23.5,
    unit: 'mg/dL',
    normalMin: 7,
    normalMax: 12,
  }
};

const BLOOD_DOT_GAP = 2;
const BLOOD_ZONE_COUNT = 3;
const BLOOD_MIN_DOTS_PER_ZONE = 12;
const getDotSizeForMarker = (index, markerIndex) => {
  const distanceFromMarker = Math.abs(index - markerIndex);
  if (distanceFromMarker === 0) return 12;
  return Math.max(4, 11 - distanceFromMarker);
};

const getDotBandByIndex = (index, totalDots) => {
  const safeTotal = Math.max(1, totalDots);
  const positionPercent = ((index + 0.5) / safeTotal) * 100;

  if (positionPercent >= 40 && positionPercent < 60) {
    return 'low';
  }

  if ((positionPercent >= 20 && positionPercent < 40) || (positionPercent >= 60 && positionPercent < 80)) {
    return 'moderate';
  }

  return 'high';
};

const getSymmetricDotBackground = (index, totalDots) => {
  const band = getDotBandByIndex(index, totalDots);
  return RISK_DOT_BACKGROUND[band] || RISK_DOT_BACKGROUND.low;
};

const getMarkerPercentForValue = (value, normalMin, normalMax) => {
  if (value >= normalMin && value <= normalMax) {
    const normalSpan = Math.max(1e-6, normalMax - normalMin);
    const ratio = (value - normalMin) / normalSpan;
    return 40 + (ratio * 20);
  }

  if (value < normalMin) {
    const deviation = normalMin - value;
    const deviationPercent = (deviation / Math.max(Math.abs(normalMin), 1e-6)) * 100;

    if (deviationPercent <= 15) {
      const ratio = deviationPercent / 15;
      return 40 - (ratio * 20);
    }

    const ratio = Math.min((deviationPercent - 15) / 35, 1);
    return 20 - (ratio * 20);
  }

  const deviation = value - normalMax;
  const deviationPercent = (deviation / Math.max(Math.abs(normalMax), 1e-6)) * 100;

  if (deviationPercent <= 15) {
    const ratio = deviationPercent / 15;
    return 60 + (ratio * 20);
  }

  const ratio = Math.min((deviationPercent - 15) / 35, 1);
  return 80 + (ratio * 20);
};

const BloodMarkerDetailView = ({ marker, onBack }) => {
  const riskStripRef = useRef(null);
  const indicatorRef = useRef(null);
  const [diagnosticDetail, setDiagnosticDetail] = useState(null);
  const [isDiagnosticLoading, setIsDiagnosticLoading] = useState(Boolean(marker?.diagnosticTestId));
  const [expandedPill, setExpandedPill] = useState(null);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  useEffect(() => {
    let isActive = true;

    const loadDiagnosticDetail = async () => {
      if (isActive) {
        setDiagnosticDetail(null);
      }

      if (!marker?.diagnosticTestId) {
        if (isActive) {
          setIsDiagnosticLoading(false);
          setDiagnosticDetail(null);
        }
        return;
      }

      if (isActive) {
        setIsDiagnosticLoading(true);
      }

      try {
        const response = await authorizedGet(`/diagnostics/health-parameters/${marker.diagnosticTestId}`);
        const detailPayload = extractDiagnosticTestPayload(response);

        if (isActive) {
          setDiagnosticDetail(detailPayload);
          setIsDiagnosticLoading(false);
        }
      } catch (error) {
        if (isActive) {
          setDiagnosticDetail(null);
          setIsDiagnosticLoading(false);
        }
      }
    };

    loadDiagnosticDetail();

    return () => {
      isActive = false;
    };
  }, [marker?.diagnosticTestId]);

  useEffect(() => {
    setIsDescriptionExpanded(false);
  }, [marker?.marker, marker?.diagnosticTestId]);

  const baseDetail = BLOOD_MARKER_DETAIL_CONTENT[marker?.marker] || BLOOD_MARKER_DETAIL_CONTENT.ALBUMIN;
  const shouldWaitForDiagnosticData = Boolean(marker?.diagnosticTestId);
  const diagnosticDescription = pickFirstText(diagnosticDetail, [
    'meaning',
    'top_one_liner',
    'topOneLiner',
    'one_liner',
    'oneLiner',
    'description',
    'summary',
    'overview',
  ]);
  const diagnosticCauses = pickApiList(diagnosticDetail, ['causes', 'cause', 'possible_causes', 'reason', 'reasons']);
  const diagnosticEffects = pickApiList(diagnosticDetail, ['effects', 'effect', 'possible_effects', 'impact', 'impacts']);

  const detail = {
    ...baseDetail,
    title: marker?.marker ? String(marker.marker).charAt(0) + String(marker.marker).slice(1).toLowerCase() : baseDetail.title,
    description: shouldWaitForDiagnosticData
      ? (isDiagnosticLoading ? '' : (diagnosticDescription || 'No details provided in report.'))
      : baseDetail.description,
    normalMin: Number.isFinite(Number(marker?.normalMin)) ? Number(marker.normalMin) : baseDetail.normalMin,
    normalMax: Number.isFinite(Number(marker?.normalMax)) ? Number(marker.normalMax) : baseDetail.normalMax,
    causes: [],
    effects: [],
  };

  const markerValue = Number.parseFloat(marker?.value);
  const activeValue = Number.isFinite(markerValue) ? markerValue : detail.defaultValue;
  const deviationSide = activeValue < detail.normalMin
    ? 'low'
    : activeValue > detail.normalMax
      ? 'high'
      : 'normal';

  const sideCauses = deviationSide === 'high'
    ? toStringArray(diagnosticDetail?.causes_when_high)
    : deviationSide === 'low'
      ? toStringArray(diagnosticDetail?.causes_when_low)
      : [];

  const sideEffects = deviationSide === 'high'
    ? toStringArray(diagnosticDetail?.effects_when_high)
    : deviationSide === 'low'
      ? toStringArray(diagnosticDetail?.effects_when_low)
      : [];

  detail.causes = sideCauses.length > 0
    ? sideCauses
    : diagnosticCauses;

  detail.effects = sideEffects.length > 0
    ? sideEffects
    : diagnosticEffects;
  const [riskStripWidth, setRiskStripWidth] = useState(0);
  const [dotsAnimated, setDotsAnimated] = useState(false);
  const [animatedMarkerLeftPercent, setAnimatedMarkerLeftPercent] = useState(0);
  const [indicatorWidth, setIndicatorWidth] = useState(0);
  const minScale = detail.normalMin - DETAIL_HIGH_RISK_DISPLAY_PADDING;
  const maxScale = detail.normalMax + DETAIL_HIGH_RISK_DISPLAY_PADDING;
  const clampedValue = Math.max(minScale, Math.min(maxScale, activeValue));
  const markerPercent = getMarkerPercentForValue(clampedValue, detail.normalMin, detail.normalMax);
  const dotsPerZone = useMemo(() => {
    if (!riskStripWidth) return BLOOD_MIN_DOTS_PER_ZONE;
    return Math.max(BLOOD_MIN_DOTS_PER_ZONE, Math.round((riskStripWidth / BLOOD_ZONE_COUNT) / 7.4));
  }, [riskStripWidth]);
  const bloodTotalDots = dotsPerZone * BLOOD_ZONE_COUNT;
  const selectedIndex = Math.round((markerPercent / 100) * (bloodTotalDots - 1));
  const currentRiskType = getRiskTypeFromBounds(clampedValue, detail.normalMin, detail.normalMax);
  const riskText = RISK_META[getDisplayRiskType(currentRiskType)]?.label || RISK_META.low.label;
  const riskColor = getRiskColorByType(currentRiskType);

  const riskLayout = useMemo(() => {
    const buildLayoutForMarker = (candidateMarkerIndex) => {
      const rawDotSizes = Array.from({ length: bloodTotalDots }, (_, index) =>
        getDotSizeForMarker(index, candidateMarkerIndex)
      );

      const totalRawDotWidth = rawDotSizes.reduce((sum, size) => sum + size, 0);
      const totalGapWidth = BLOOD_DOT_GAP * (bloodTotalDots - 1);
      const availableDotWidth = riskStripWidth ? Math.max(0, riskStripWidth - totalGapWidth) : totalRawDotWidth;
      const dotSizeScale = totalRawDotWidth > 0 ? (availableDotWidth / totalRawDotWidth) : 1;
      const adjustedDotSizes = rawDotSizes.map((size) => size * dotSizeScale);
      const dotsTrackWidth = adjustedDotSizes.reduce((sum, size) => sum + size, 0) + totalGapWidth;

      const dotCenterPercents = [];
      let runningX = 0;
      for (let index = 0; index < bloodTotalDots; index += 1) {
        const dotSize = adjustedDotSizes[index];
        const centerPx = runningX + dotSize / 2;
        dotCenterPercents.push(dotsTrackWidth > 0 ? (centerPx / dotsTrackWidth) * 100 : 0);
        runningX += dotSize + BLOOD_DOT_GAP;
      }

      return { adjustedDotSizes, dotsTrackWidth, dotCenterPercents };
    };

    let candidateMarkerIndex = selectedIndex;
    let layout = buildLayoutForMarker(candidateMarkerIndex);

    const nearestIndex = layout.dotCenterPercents.reduce((closestIndex, _, index) => {
      const currentDistance = Math.abs(layout.dotCenterPercents[index] - markerPercent);
      const closestDistance = Math.abs(layout.dotCenterPercents[closestIndex] - markerPercent);
      return currentDistance < closestDistance ? index : closestIndex;
    }, 0);

    if (nearestIndex !== candidateMarkerIndex) {
      candidateMarkerIndex = nearestIndex;
      layout = buildLayoutForMarker(candidateMarkerIndex);
    }

    return {
      markerIndex: candidateMarkerIndex,
      markerLeftPercent: layout.dotCenterPercents[candidateMarkerIndex] ?? markerPercent,
      adjustedDotSizes: layout.adjustedDotSizes,
      dotsTrackWidth: layout.dotsTrackWidth,
      dotCenterPercents: layout.dotCenterPercents
    };
  }, [markerPercent, riskStripWidth, selectedIndex, bloodTotalDots]);

  const { markerLeftPercent, adjustedDotSizes, dotsTrackWidth, dotCenterPercents } = riskLayout;
  const dividerPercents = useMemo(() => {
    const greenIndexes = [];

    for (let index = 0; index < bloodTotalDots; index += 1) {
      if (getDotBandByIndex(index, bloodTotalDots) === 'low') {
        greenIndexes.push(index);
      }
    }

    if (greenIndexes.length === 0) {
      return [40, 60];
    }

    const firstGreen = greenIndexes[0];
    const lastGreen = greenIndexes[greenIndexes.length - 1];
    const leftNeighbor = Math.max(0, firstGreen - 1);
    const rightNeighbor = Math.min(bloodTotalDots - 1, lastGreen + 1);

    const firstGreenCenter = dotCenterPercents[firstGreen] ?? 40;
    const lastGreenCenter = dotCenterPercents[lastGreen] ?? 60;
    const leftNeighborCenter = dotCenterPercents[leftNeighbor] ?? firstGreenCenter;
    const rightNeighborCenter = dotCenterPercents[rightNeighbor] ?? lastGreenCenter;

    const leftDivider = firstGreen === 0
      ? firstGreenCenter
      : (leftNeighborCenter + firstGreenCenter) / 2;
    const rightDivider = lastGreen === bloodTotalDots - 1
      ? lastGreenCenter
      : (lastGreenCenter + rightNeighborCenter) / 2;

    return [leftDivider, rightDivider];
  }, [bloodTotalDots, dotCenterPercents]);
  const zoneCenterPercents = useMemo(() => {
    const leftDivider = dividerPercents[0] ?? 40;
    const rightDivider = dividerPercents[1] ?? 60;
    return [
      leftDivider / 2,
      (leftDivider + rightDivider) / 2,
      (rightDivider + 100) / 2,
    ];
  }, [dividerPercents]);
  const markerDotSize = adjustedDotSizes[riskLayout.markerIndex] || 0;
  const markerLineTop = 11 + (12 + markerDotSize) / 2;

  const markerLeftPx = riskStripWidth > 0 ? (animatedMarkerLeftPercent / 100) * riskStripWidth : 0;
  const indicatorSidePadding = 12;
  const indicatorHalfWidth = indicatorWidth / 2;
  const indicatorLeftPx = riskStripWidth > 0
    ? Math.min(
      Math.max(markerLeftPx, indicatorHalfWidth + indicatorSidePadding),
      Math.max(indicatorHalfWidth + indicatorSidePadding, riskStripWidth - indicatorHalfWidth - indicatorSidePadding)
    )
    : markerLeftPx;

  useEffect(() => {
    const element = riskStripRef.current;
    if (!element) return undefined;

    const updateWidth = () => {
      setRiskStripWidth(element.clientWidth);
    };

    updateWidth();
    const resizeObserver = new ResizeObserver(() => {
      updateWidth();
    });

    resizeObserver.observe(element);
    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    const element = indicatorRef.current;
    if (!element) return undefined;

    const updateWidth = () => {
      setIndicatorWidth(element.clientWidth);
    };

    updateWidth();
    const resizeObserver = new ResizeObserver(() => {
      updateWidth();
    });

    resizeObserver.observe(element);
    return () => {
      resizeObserver.disconnect();
    };
  }, [detail.value, detail.unit, riskText]);

  useEffect(() => {
    setDotsAnimated(false);
    setAnimatedMarkerLeftPercent(0);
    let markerTimeout;

    const animationFrame = requestAnimationFrame(() => {
      setDotsAnimated(true);
      markerTimeout = window.setTimeout(() => {
        setAnimatedMarkerLeftPercent(markerLeftPercent);
      }, 120);
    });

    return () => {
      cancelAnimationFrame(animationFrame);
      if (markerTimeout) {
        window.clearTimeout(markerTimeout);
      }
    };
  }, [markerLeftPercent]);

  return (
    <div className="blood-marker-detail">
      <header className="blood-marker-detail__header">
        <button type="button" className="blood-marker-detail__back-btn" onClick={onBack} aria-label="Go back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h1 className="blood-marker-detail__title">{detail.title}</h1>
      </header>

      {shouldWaitForDiagnosticData && isDiagnosticLoading ? (
        <p className="blood-marker-detail__description">Loading marker details...</p>
      ) : (
        <button
          type="button"
          className={`blood-marker-detail__description-toggle${isDescriptionExpanded ? ' is-expanded' : ''}`}
          onClick={() => setIsDescriptionExpanded((prev) => !prev)}
          aria-expanded={isDescriptionExpanded}
          aria-label={isDescriptionExpanded ? 'Collapse marker description' : 'Expand marker description'}
        >
          <span className="blood-marker-detail__description">{detail.description}</span>
        </button>
      )}

      <section className="blood-marker-detail__scale-section" aria-label="Blood marker range scale">
        <div className="blood-marker-detail__risk-strip" ref={riskStripRef}>
          <div className="blood-marker-detail__risk-scale-shell" style={{ width: `${dotsTrackWidth}px` }}>
            <div className="blood-marker-detail__labels-row">
              {[
                { title: 'Low', value: `<${detail.normalMin}` },
                { title: 'Normal', value: `${detail.normalMin}-${detail.normalMax}` },
                { title: 'High', value: `>${detail.normalMax}` },
              ].map((label, index) => (
                <div
                  key={`${label.title}-${label.value}`}
                  className={`blood-marker-detail__label-group ${index === 1 ? 'blood-marker-detail__label-group--normal' : ''}`}
                  style={{
                    left: `${zoneCenterPercents[index]}%`,
                    width: index === 1 ? `${Math.max(8, (dividerPercents[1] - dividerPercents[0]) - 2)}%` : undefined,
                  }}
                >
                  <span className="blood-marker-detail__label-title">{label.title}</span>
                  <span className="blood-marker-detail__label-value">{label.value}</span>
                </div>
              ))}
            </div>

            <div className="blood-marker-detail__risk-track-area">
              <span className="blood-marker-detail__zone-separator" style={{ left: `${dividerPercents[0]}%` }} />
              <span className="blood-marker-detail__zone-separator" style={{ left: `${dividerPercents[1]}%` }} />

              <div className="blood-marker-detail__risk-dots-track">
                {Array.from({ length: bloodTotalDots }, (_, index) => {
                  const dotBackground = getSymmetricDotBackground(index, bloodTotalDots);
                  const dotSize = adjustedDotSizes[index];

                  return (
                    <span
                      key={`detail-dot-${index}`}
                      className={`blood-marker-detail__risk-dot ${dotsAnimated ? 'animated' : ''}`}
                      style={{
                        background: dotBackground,
                        width: `${dotSize}px`,
                        height: `${dotSize}px`,
                        transitionDelay: `${index * 12}ms`
                      }}
                    />
                  );
                })}
              </div>

              <div className="blood-marker-detail__risk-marker-zone">
                <div
                  className="blood-marker-detail__risk-marker"
                  style={{
                    left: `${animatedMarkerLeftPercent}%`,
                    top: `${markerLineTop}px`
                  }}
                >
                  <span className="blood-marker-detail__risk-marker-line" style={{ borderLeftColor: riskColor }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div ref={indicatorRef} className="blood-marker-detail__value-row" style={{ left: `${indicatorLeftPx}px` }}>
          <div className="blood-marker-detail__value-main" style={{ color: riskColor }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M8.66792 5.21802V13.3327H7.33459V5.21802L3.75858 8.79401L2.81592 7.85135L8.00125 2.66602L13.1866 7.85135L12.2439 8.79401L8.66792 5.21802Z" fill={riskColor} />
            </svg>
            <span>{activeValue} {detail.unit}</span>
          </div>
          <div className="blood-marker-detail__risk-main">
            <span className="blood-marker-detail__risk-badge-dot" style={{ background: riskColor }} />
            <span>{riskText}</span>
          </div>
        </div>
      </section>

      <section className="blood-marker-detail__info-section">
        {[
          {
            key: 'causes',
            label: 'Causes',
            accentClass: 'blood-marker-detail__pill-accent--causes',
            items: shouldWaitForDiagnosticData && isDiagnosticLoading ? null : detail.causes,
            loading: shouldWaitForDiagnosticData && isDiagnosticLoading,
            emptyText: 'No causes provided in report.'
          },
          {
            key: 'effects',
            label: 'Effects',
            accentClass: 'blood-marker-detail__pill-accent--effects',
            items: shouldWaitForDiagnosticData && isDiagnosticLoading ? null : detail.effects,
            loading: shouldWaitForDiagnosticData && isDiagnosticLoading,
            emptyText: 'No effects provided in report.'
          }
        ].map(({ key, label, accentClass, items, loading, emptyText }) => {
          const bodyText = loading
            ? `Loading ${key}...`
            : items && items.length > 0
              ? items.join('. ') + '.'
              : emptyText;
          return (
            <button
              key={key}
              type="button"
              className="blood-marker-detail__pill"
              onClick={() => setExpandedPill(expandedPill === key ? null : key)}
              aria-expanded={expandedPill === key}
            >
              <div className="blood-marker-detail__pill-header">
                <span className={`blood-marker-detail__pill-accent ${accentClass}`} />
                <span className="blood-marker-detail__pill-title">{label}</span>
                <svg
                  className={`blood-marker-detail__pill-chevron${expandedPill === key ? ' blood-marker-detail__pill-chevron--open' : ''}`}
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  aria-hidden="true"
                >
                  <path d="M5 7.5L10 12.5L15 7.5" stroke="white" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              {expandedPill === key && (
                <p className="blood-marker-detail__pill-body">{bodyText}</p>
              )}
            </button>
          );
        })}
      </section>
    </div>
  );
};

const BloodMarkerStackSection = ({ section, onOpenDetail }) => {
  const isOptimalSection = section.theme === 'low';
  const [isOptimalExpanded, setIsOptimalExpanded] = useState(false);
  const [expandedLowCardIds, setExpandedLowCardIds] = useState({});
  const cards = markerCards(section);
  const cardCount = cards.length;
  const [activeIndex, setActiveIndex] = useState(isOptimalSection ? Math.max(cards.length - 1, 0) : 0);
  const [swipeDirection, setSwipeDirection] = useState('next');
  const [isAnimating, setIsAnimating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const stackRef = useRef(null);
  const touchStartXRef = useRef(null);
  const touchStartYRef = useRef(null);
  const isHorizontalSwipeRef = useRef(false);
  const pointerStartXRef = useRef(null);
  const pointerStartYRef = useRef(null);
  const pointerIsHorizontalSwipeRef = useRef(false);
  const activePointerIdRef = useRef(null);
  const latestDragXRef = useRef(0);
  const pendingDragXRef = useRef(0);
  const dragFrameRef = useRef(null);
  /** True after startAnimation until we settle once (left and/or transform both fire on the front card). */
  const stackSwapAwaitingSettleRef = useRef(false);
  const frontStackCardRef = useRef(null);

  const commitDragOffset = (value) => {
    latestDragXRef.current = value;
    if (stackRef.current) {
      stackRef.current.style.setProperty('--blood-markers-drag-x', `${value}px`);
    }
  };

  const resetDragOffset = () => {
    pendingDragXRef.current = 0;
    if (dragFrameRef.current !== null) {
      cancelAnimationFrame(dragFrameRef.current);
      dragFrameRef.current = null;
    }
    commitDragOffset(0);
  };

  const applyDragOffset = (value) => {
    pendingDragXRef.current = value;
    if (dragFrameRef.current !== null) {
      return;
    }

    dragFrameRef.current = requestAnimationFrame(() => {
      dragFrameRef.current = null;
      commitDragOffset(pendingDragXRef.current);
    });
  };

  useEffect(() => {
    return () => {
      if (dragFrameRef.current !== null) {
        cancelAnimationFrame(dragFrameRef.current);
      }
      stackSwapAwaitingSettleRef.current = false;
    };
  }, []);

  const startAnimation = (direction) => {
    if (cardCount <= 1) return;
    stackSwapAwaitingSettleRef.current = true;
    setIsDragging(false);
    resetDragOffset();
    setSwipeDirection(direction);
    setIsAnimating(true);
  };

  const goPrev = () => {
    if (isAnimating || cardCount <= 1) return;
    startAnimation('prev');
  };

  const goNext = () => {
    if (isAnimating || cardCount <= 1) return;
    startAnimation('next');
  };

  const handleTouchStart = (event) => {
    if (isAnimating) {
      return;
    }
    touchStartXRef.current = event.touches[0].clientX;
    touchStartYRef.current = event.touches[0].clientY;
    isHorizontalSwipeRef.current = false;
    setIsDragging(false);
    resetDragOffset();
  };

  const handleTouchMove = (event) => {
    if (touchStartXRef.current == null || touchStartYRef.current == null || isAnimating) {
      return;
    }

    const deltaX = event.touches[0].clientX - touchStartXRef.current;
    const deltaY = event.touches[0].clientY - touchStartYRef.current;

    if (!isHorizontalSwipeRef.current) {
      const hasEnoughMovement = Math.abs(deltaX) > 6 || Math.abs(deltaY) > 6;
      if (!hasEnoughMovement) {
        return;
      }

      isHorizontalSwipeRef.current = Math.abs(deltaX) > Math.abs(deltaY);
      if (!isHorizontalSwipeRef.current) {
        return;
      }

      setIsDragging(true);
    }

    event.preventDefault();

    const stackWidth = stackRef.current?.clientWidth || 260;
    const softLimit = Math.max(120, stackWidth * 0.55);
    const absDelta = Math.abs(deltaX);
    const direction = deltaX < 0 ? -1 : 1;

    const dragValue = absDelta <= softLimit
      ? deltaX
      : direction * (softLimit + (absDelta - softLimit) * 0.18);

    applyDragOffset(dragValue);
  };

  const handleTouchEnd = (event) => {
    if (touchStartXRef.current == null) {
      return;
    }

    if (!isHorizontalSwipeRef.current) {
      touchStartXRef.current = null;
      touchStartYRef.current = null;
      setIsDragging(false);
      resetDragOffset();
      return;
    }

    const stackWidth = stackRef.current?.clientWidth || 260;
    const swipeThreshold = Math.max(30, stackWidth * 0.14);
    const deltaX = event.changedTouches[0].clientX - touchStartXRef.current;
    if (Math.abs(deltaX) > swipeThreshold) {
      if (deltaX < 0) {
        goNext();
      } else {
        goPrev();
      }
    } else {
      setIsDragging(false);
      resetDragOffset();
    }

    touchStartXRef.current = null;
    touchStartYRef.current = null;
    isHorizontalSwipeRef.current = false;
  };

  const handleTouchCancel = () => {
    touchStartXRef.current = null;
    touchStartYRef.current = null;
    isHorizontalSwipeRef.current = false;
    setIsDragging(false);
    resetDragOffset();
  };

  const handlePointerDown = (event) => {
    if (isAnimating) {
      return;
    }

    if (event.pointerType === 'mouse' && event.button !== 0) {
      return;
    }

    pointerStartXRef.current = event.clientX;
    pointerStartYRef.current = event.clientY;
    pointerIsHorizontalSwipeRef.current = false;
    activePointerIdRef.current = event.pointerId;
    setIsDragging(false);
    resetDragOffset();

    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const handlePointerMove = (event) => {
    if (
      pointerStartXRef.current == null
      || pointerStartYRef.current == null
      || activePointerIdRef.current !== event.pointerId
      || isAnimating
    ) {
      return;
    }

    const deltaX = event.clientX - pointerStartXRef.current;
    const deltaY = event.clientY - pointerStartYRef.current;

    if (!pointerIsHorizontalSwipeRef.current) {
      const hasEnoughMovement = Math.abs(deltaX) > 6 || Math.abs(deltaY) > 6;
      if (!hasEnoughMovement) {
        return;
      }

      pointerIsHorizontalSwipeRef.current = Math.abs(deltaX) > Math.abs(deltaY);
      if (!pointerIsHorizontalSwipeRef.current) {
        return;
      }

      setIsDragging(true);
    }

    event.preventDefault();

    const stackWidth = stackRef.current?.clientWidth || 260;
    const softLimit = Math.max(120, stackWidth * 0.55);
    const absDelta = Math.abs(deltaX);
    const direction = deltaX < 0 ? -1 : 1;
    const dragValue = absDelta <= softLimit
      ? deltaX
      : direction * (softLimit + (absDelta - softLimit) * 0.18);

    applyDragOffset(dragValue);
  };

  const finishPointerDrag = (event) => {
    if (pointerStartXRef.current == null || activePointerIdRef.current !== event.pointerId) {
      return;
    }

    if (!pointerIsHorizontalSwipeRef.current) {
      pointerStartXRef.current = null;
      pointerStartYRef.current = null;
      pointerIsHorizontalSwipeRef.current = false;
      activePointerIdRef.current = null;
      setIsDragging(false);
      resetDragOffset();
      return;
    }

    const stackWidth = stackRef.current?.clientWidth || 260;
    const swipeThreshold = Math.max(30, stackWidth * 0.14);
    const deltaX = event.clientX - pointerStartXRef.current;
    if (Math.abs(deltaX) > swipeThreshold) {
      if (deltaX < 0) {
        goNext();
      } else {
        goPrev();
      }
    } else {
      setIsDragging(false);
      resetDragOffset();
    }

    pointerStartXRef.current = null;
    pointerStartYRef.current = null;
    pointerIsHorizontalSwipeRef.current = false;
    activePointerIdRef.current = null;

    if (event.currentTarget?.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handlePointerCancel = (event) => {
    if (activePointerIdRef.current !== event.pointerId) {
      return;
    }

    pointerStartXRef.current = null;
    pointerStartYRef.current = null;
    pointerIsHorizontalSwipeRef.current = false;
    activePointerIdRef.current = null;
    setIsDragging(false);
    resetDragOffset();

    if (event.currentTarget?.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handleStackTransitionEnd = (event) => {
    if (!stackSwapAwaitingSettleRef.current) return;
    if (!event.target.classList.contains('blood-markers-page__stack-card--front')) return;
    if (event.propertyName !== 'left' && event.propertyName !== 'transform') return;

    stackSwapAwaitingSettleRef.current = false;

    setIsResetting(true);
    setActiveIndex((prev) => (prev + 1) % cardCount);
    setIsAnimating(false);
    resetDragOffset();

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsResetting(false);
      });
    });
  };

  const organIcon = getOrganIcon(section.organ);

  useEffect(() => {
    setActiveIndex(isOptimalSection ? Math.max(cards.length - 1, 0) : 0);
  }, [cards.length, isOptimalSection, section.id]);

  const optimalInRangeRows = buildSegregatedParameterRows(section, 'optimal_only');
  const optimalLowCardHeadline = getOptimalLowCardHeadline(section);
  const activeFrontCard = cards[activeIndex];
  const isFrontOptimalAccordionExpanded = !isOptimalSection && Boolean(
    activeFrontCard?.riskType === 'low' && expandedLowCardIds[activeFrontCard?.id],
  );

  useLayoutEffect(() => {
    if (isOptimalSection) {
      return undefined;
    }

    const stack = stackRef.current;
    const card = frontStackCardRef.current;
    if (!stack) {
      return undefined;
    }

    const BASE_CARD_PX = 136;

    const syncStackHeight = () => {
      if (!isFrontOptimalAccordionExpanded || !card) {
        stack.style.removeProperty('--blood-markers-stack-front-height');
        return;
      }
      const measured = Math.ceil(card.getBoundingClientRect().height);
      const h = Math.max(measured, BASE_CARD_PX);
      stack.style.setProperty('--blood-markers-stack-front-height', `${h}px`);
    };

    syncStackHeight();
    const rafId = requestAnimationFrame(() => syncStackHeight());

    let ro = null;
    if (typeof ResizeObserver !== 'undefined' && card) {
      ro = new ResizeObserver(() => syncStackHeight());
      ro.observe(card);
    }

    return () => {
      cancelAnimationFrame(rafId);
      if (ro) {
        ro.disconnect();
      }
    };
  }, [isOptimalSection, isFrontOptimalAccordionExpanded, activeIndex, cardCount, section.id, expandedLowCardIds]);

  if (isOptimalSection) {
    const segments = METER_SEGMENTS.low;
    const parameterRows = buildSegregatedParameterRows(section, 'all');
    const optimalHeadline = getOptimalSectionHeadline(section);

    return (
      <section className="blood-markers-page__section">
        <div className="blood-markers-page__organ-header">
          <div className={`blood-markers-page__organ-icon-box blood-markers-page__organ-icon-box--${section.theme}`}>
            <img
              src={organIcon}
              alt=""
              aria-hidden="true"
              className={`blood-markers-page__organ-icon blood-markers-page__organ-icon--${getDisplayRiskType(section.theme)}`}
            />
          </div>
          <div className="blood-markers-page__organ-copy">
            <h2 className="blood-markers-page__organ-title">{section.organ}</h2>
            <p className="blood-markers-page__organ-subtitle">{section.parameters}</p>
          </div>
        </div>

        <article
          className="blood-markers-page__optimal-card"
          aria-label={`${section.organ} optimal summary`}
          aria-expanded={isOptimalExpanded}
          role="button"
          tabIndex={0}
          onClick={(event) => {
            if (event.target.closest('.blood-markers-page__optimal-params')) {
              return;
            }
            setIsOptimalExpanded((prev) => !prev);
          }}
          onKeyDown={(event) => {
            if (event.key !== 'Enter' && event.key !== ' ') {
              return;
            }
            if (event.target.closest('.blood-markers-page__optimal-params')) {
              return;
            }
            event.preventDefault();
            setIsOptimalExpanded((prev) => !prev);
          }}
        >
          <div className="blood-markers-page__card-top-row">
            <div className="blood-markers-page__marker-block">
              <span className="blood-markers-page__marker-line blood-markers-page__marker-line--low" />
              <div className="blood-markers-page__marker-copy">
                <span className="blood-markers-page__optimal-prefix">{optimalHeadline.prefix}</span>
                <span className="blood-markers-page__optimal-title">{optimalHeadline.title}</span>
              </div>
            </div>
          </div>

          <div className="blood-markers-page__card-bottom-row">
            <div className="blood-markers-page__meter" aria-hidden="true">
              {segments.map((segment, segmentIndex) => (
                <span
                  key={`${section.id}-optimal-seg-${segmentIndex}`}
                  className="blood-markers-page__meter-pill"
                  style={{ background: segment.background, boxShadow: segment.boxShadow || 'none' }}
                />
              ))}
            </div>

            <button
              type="button"
              className={`blood-markers-page__optimal-chevron ${isOptimalExpanded ? 'blood-markers-page__optimal-chevron--expanded' : ''}`}
              aria-label={isOptimalExpanded ? 'Hide parameters' : 'Show parameters'}
              onClick={(event) => {
                event.stopPropagation();
                setIsOptimalExpanded((prev) => !prev);
              }}
            >
              <DownChevron />
            </button>
          </div>

          <div
            className={`blood-markers-page__optimal-params ${isOptimalExpanded ? 'blood-markers-page__optimal-params--expanded' : 'blood-markers-page__optimal-params--collapsed'}`}
            aria-label="Parameters list"
            aria-hidden={!isOptimalExpanded}
          >
            <BloodMarkersParameterRows rows={parameterRows} keyPrefix={`${section.id}-`} />
          </div>
        </article>
      </section>
    );
  }

  return (
    <section className="blood-markers-page__section">
      <div className="blood-markers-page__organ-header">
        <div className={`blood-markers-page__organ-icon-box blood-markers-page__organ-icon-box--${section.theme}`}>
          <img
            src={organIcon}
            alt=""
            aria-hidden="true"
            className={`blood-markers-page__organ-icon blood-markers-page__organ-icon--${getDisplayRiskType(section.theme)}`}
          />
        </div>
        <div className="blood-markers-page__organ-copy">
          <h2 className="blood-markers-page__organ-title">{section.organ}</h2>
          <p className="blood-markers-page__organ-subtitle">{section.parameters}</p>
        </div>
      </div>

      <div
        ref={stackRef}
        className={`blood-markers-page__stack${isAnimating ? ` blood-markers-page__stack--moving-${swipeDirection}` : ''}`}
        style={cardCount === 2 ? {
          '--blood-markers-back-two-left': 'var(--blood-markers-back-one-left)',
          '--blood-markers-back-two-top': 'var(--blood-markers-back-one-top)',
          '--blood-markers-back-two-fade': 'var(--blood-markers-back-one-fade)',
        } : undefined}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchCancel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishPointerDrag}
        onPointerCancel={handlePointerCancel}
        onLostPointerCapture={handlePointerCancel}
        onTransitionEnd={handleStackTransitionEnd}
        data-dragging={isDragging ? 'true' : 'false'}
        data-resetting={isResetting ? 'true' : 'false'}
        data-card-count={cardCount}
        data-front-optimal-expanded={isFrontOptimalAccordionExpanded ? 'true' : 'false'}
      >
        {cards.map((card, index) => {
          const distance = (index - activeIndex + cards.length) % cards.length;
          const role = distance === 0
            ? 'front'
            : distance === 1
              ? 'back-one'
              : distance === 2
                ? 'back-two'
                : 'hidden';

          const riskMeta = RISK_META[getDisplayRiskType(card.riskType)] || RISK_META.low;
          const segments = METER_SEGMENTS[card.riskType];
          const isLowCard = card.riskType === 'low';
          const isLowCardExpanded = Boolean(expandedLowCardIds[card.id]);

          return (
            <article
              key={card.id}
              ref={(node) => {
                if (role === 'front') {
                  frontStackCardRef.current = node;
                }
              }}
              className={`blood-markers-page__stack-card blood-markers-page__stack-card--${role} blood-markers-page__stack-card--theme-${card.riskType}${isLowCard ? ' blood-markers-page__stack-card--optimal-in-stack' : ''}${isLowCard && isLowCardExpanded && role === 'front' ? ' blood-markers-page__stack-card--optimal-expanded' : ''}`}
              onClick={(event) => {
                if (card.riskType === 'low') {
                  if (event.target.closest('.blood-markers-page__optimal-params')) {
                    return;
                  }
                  setExpandedLowCardIds((prev) => ({ ...prev, [card.id]: !prev[card.id] }));
                  return;
                }
                onOpenDetail({ ...card, organ: section.organ, parameters: section.parameters });
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  if (card.riskType === 'low') {
                    if (event.target.closest('.blood-markers-page__optimal-params')) {
                      return;
                    }
                    setExpandedLowCardIds((prev) => ({ ...prev, [card.id]: !prev[card.id] }));
                    return;
                  }
                  onOpenDetail({ ...card, organ: section.organ, parameters: section.parameters });
                }
              }}
            >
              <div className="blood-markers-page__card-top-row">
                <div className="blood-markers-page__marker-block">
                  <span className={`blood-markers-page__marker-line blood-markers-page__marker-line--${isLowCard ? 'low' : card.riskType}`} />
                  <div className="blood-markers-page__marker-copy">
                    {isLowCard ? (
                      <>
                        <span className="blood-markers-page__optimal-prefix">{optimalLowCardHeadline.prefix}</span>
                        <span className="blood-markers-page__optimal-title">{optimalLowCardHeadline.title}</span>
                      </>
                    ) : (
                      <>
                        <span
                          className="blood-markers-page__marker-label"
                          title={
                            String(card.marker ?? '').length > BLOOD_MARKERS_STACK_CARD_NAME_MAX
                              ? String(card.marker)
                              : undefined
                          }
                        >
                          {truncateBloodMarkersStackCardName(card.marker)}
                        </span>
                        <div className="blood-markers-page__marker-value-row">
                          <span className="blood-markers-page__marker-value">{card.value}</span>
                          <span className="blood-markers-page__marker-unit">{card.unit}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {!isLowCard ? (
                  <span className="blood-markers-page__risk-chip">
                    <span className="blood-markers-page__risk-chip-text" style={{ color: riskMeta.color }}>{riskMeta.label}</span>
                    <RiskTrendIcon type={card.riskType} />
                  </span>
                ) : null}
              </div>

              <div className="blood-markers-page__card-bottom-row">
                <div className="blood-markers-page__meter" aria-hidden="true">
                  {segments.map((segment, segmentIndex) => (
                    <span
                      key={`${card.id}-seg-${segmentIndex}`}
                      className="blood-markers-page__meter-pill"
                      style={{ background: segment.background, boxShadow: segment.boxShadow || 'none' }}
                    />
                  ))}
                </div>
                {isLowCard ? (
                  <button
                    type="button"
                    className={`blood-markers-page__optimal-chevron ${isLowCardExpanded ? 'blood-markers-page__optimal-chevron--expanded' : ''}`}
                    aria-label={isLowCardExpanded ? 'Hide parameters' : 'Show parameters'}
                    onClick={(event) => {
                      event.stopPropagation();
                      setExpandedLowCardIds((prev) => ({ ...prev, [card.id]: !prev[card.id] }));
                    }}
                  >
                    <DownChevron />
                  </button>
                ) : (
                  <span className="blood-markers-page__card-chevron" aria-hidden="true">
                    <CardChevron />
                  </span>
                )}
              </div>

              {isLowCard ? (
                <div
                  className={`blood-markers-page__optimal-params ${isLowCardExpanded ? 'blood-markers-page__optimal-params--expanded' : 'blood-markers-page__optimal-params--collapsed'}`}
                  aria-label="Parameters list"
                  aria-hidden={!isLowCardExpanded}
                >
                  <BloodMarkersParameterRows rows={optimalInRangeRows} keyPrefix={`${card.id}-`} />
                </div>
              ) : null}
            </article>
          );
        })}
      </div>

      <div className="blood-markers-page__swipe-hint" aria-hidden="true">
        <span className="blood-markers-page__swipe-arrow blood-markers-page__swipe-arrow--left"><SwipeArrow /></span>
        <span className="blood-markers-page__swipe-text">Swipe to explore</span>
        <span className="blood-markers-page__swipe-arrow"><SwipeArrow /></span>
      </div>
    </section>
  );
};

const BloodMarkersPage = ({ onBack, initialDetailMarker = null, onInitialDetailConsumed }) => {
  const [activeFilter, setActiveFilter] = useState('Optimal');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [apiSections, setApiSections] = useState([]);

  useEffect(() => {
    if (!initialDetailMarker) {
      return;
    }
    const mapped = mapHomeBloodMarkerRowToDetailMarker(initialDetailMarker);
    if (mapped) {
      const rk = initialDetailMarker.riskKey;
      if (rk === 'high') {
        setActiveFilter('Critical');
      } else if (rk === 'low') {
        setActiveFilter('Marginal');
      } else {
        setActiveFilter('Optimal');
      }
      setSelectedMarker(mapped);
    }
    if (typeof onInitialDetailConsumed === 'function') {
      onInitialDetailConsumed();
    }
  }, [initialDetailMarker, onInitialDetailConsumed]);

  useEffect(() => {
    let isActive = true;

    const loadBloodMarkers = async () => {
      try {
        const { response } = await fetchLatestAssessmentReport(
          (assessmentId) => `/reports/${assessmentId}/blood-parameters`
        );
        if (isActive) {
          setApiSections(buildSectionsFromApi(response));
        }
      } catch (error) {
        console.error('Failed to load blood marker report:', error);
        if (isActive) {
          setApiSections([]);
        }
      }
    };

    loadBloodMarkers();

    return () => {
      isActive = false;
    };
  }, []);

  const sections = useMemo(() => {
    return apiSections.filter((section) => section.category === activeFilter);
  }, [activeFilter, apiSections]);
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredSections = normalizedQuery
    ? sections.filter((section) => {
        const markerText = section.tests.map((test) => test.marker.toLowerCase()).join(' ');
        return section.organ.toLowerCase().includes(normalizedQuery)
          || section.parameters.toLowerCase().includes(normalizedQuery)
          || markerText.includes(normalizedQuery);
      })
    : sections;

  if (selectedMarker) {
    return (
      <div className="blood-markers-page">
        <BloodMarkerDetailView marker={selectedMarker} onBack={() => setSelectedMarker(null)} />
      </div>
    );
  }

  return (
    <div className="blood-markers-page">
      <header className="blood-markers-page__header">
        <button
          type="button"
          className="blood-markers-page__back-btn"
          onClick={onBack}
          aria-label="Go back"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <h1 className="blood-markers-page__title">Blood Markers</h1>

        <button
          type="button"
          className="blood-markers-page__search-btn"
          onClick={() => setIsSearchOpen((prev) => !prev)}
          aria-label="Search"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M21 21L16.65 16.65" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </header>

      {isSearchOpen ? (
        <div className="blood-markers-page__search-row">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="rgba(255, 255, 255, 0.72)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M21 21L16.65 16.65" stroke="rgba(255, 255, 255, 0.72)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="blood-markers-page__search-input"
            placeholder="Search blood markers"
            aria-label="Search blood markers"
          />
        </div>
      ) : null}

      <div className="blood-markers-page__filters" role="tablist" aria-label="Risk filters">
        {FILTERS.map((filter) => {
          const isActive = filter === activeFilter;
          return (
            <button
              key={filter}
              type="button"
              className={`blood-markers-page__filter-pill ${isActive ? 'blood-markers-page__filter-pill--active' : ''}`}
              onClick={() => setActiveFilter(filter)}
              role="tab"
              aria-selected={isActive}
            >
              {filter}
            </button>
          );
        })}
      </div>

      <div className="blood-markers-page__sections">
        {filteredSections.map((section) => (
          <BloodMarkerStackSection key={section.id} section={section} onOpenDetail={setSelectedMarker} />
        ))}
      </div>

    </div>
  );
};

export default BloodMarkersPage;
