/**
 * Normalizes GET /reports/:id/blood-parameters payloads across snake_case, camelCase,
 * alternate nesting (`data.groups`), and common field aliases so UI layers don't drop rows.
 */

export const firstDefined = (...candidates) => {
  for (let i = 0; i < candidates.length; i += 1) {
    const v = candidates[i];
    if (v !== undefined && v !== null) {
      return v;
    }
  }
  return undefined;
};

export const coerceFiniteNumber = (raw) => {
  if (raw === undefined || raw === null || raw === '') {
    return undefined;
  }
  if (typeof raw === 'boolean') {
    return undefined;
  }
  if (typeof raw === 'string') {
    const trimmed = raw.trim().replace(/,/g, '');
    if (trimmed === '') {
      return undefined;
    }
    const n = Number(trimmed);
    return Number.isFinite(n) ? n : undefined;
  }
  if (typeof raw === 'object' && raw !== null) {
    if ('value' in raw) {
      return coerceFiniteNumber(raw.value);
    }
    if ('amount' in raw) {
      return coerceFiniteNumber(raw.amount);
    }
    return undefined;
  }
  const n = Number(raw);
  return Number.isFinite(n) ? n : undefined;
};

export const extractBloodParameterGroupsArray = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }
  if (!payload || typeof payload !== 'object') {
    return [];
  }

  const nestedCandidates = [
    payload.data,
    payload.groups,
    payload.results,
    payload.items,
    payload.blood_parameter_groups,
    payload.bloodParameterGroups,
    payload.report?.groups,
    payload.report?.data,
    payload.data?.groups,
    payload.data?.blood_parameter_groups,
    payload.data?.bloodParameterGroups,
    payload.data?.items,
    payload.data?.results,
    payload.data?.tests,
    payload.data?.report?.groups,
  ];

  for (let i = 0; i < nestedCandidates.length; i += 1) {
    const c = nestedCandidates[i];
    if (Array.isArray(c)) {
      return c;
    }
  }

  return [];
};

export const pickBloodParameterGroupName = (group) => {
  const g = group && typeof group === 'object' ? group : {};
  const raw = firstDefined(
    g.group_name,
    g.groupName,
    g.name,
    g.title,
    g.group_title,
    g.groupTitle,
    g.profile_name,
    g.profileName,
    g.category_name,
    g.categoryName,
    g.label,
  );
  const s = String(raw ?? '').trim();
  return s || 'Blood markers';
};

export const getBloodParameterTestsFromGroup = (group) => {
  const g = group && typeof group === 'object' ? group : {};
  const keys = [
    'tests',
    'parameters',
    'markers',
    'blood_tests',
    'bloodTests',
    'items',
    'results',
    'test_results',
    'testResults',
  ];
  for (let i = 0; i < keys.length; i += 1) {
    const arr = g[keys[i]];
    if (Array.isArray(arr)) {
      return arr;
    }
  }
  return [];
};

export const normalizeBloodParameterTestRow = (test) => {
  const t = test && typeof test === 'object' ? test : {};
  const test_name = String(firstDefined(
    t.test_name,
    t.testName,
    t.name,
    t.title,
    t.parameter_name,
    t.parameterName,
    t.display_name,
    t.displayName,
    t.label,
    t.parameter_key,
    t.parameterKey,
  ) ?? '').trim() || 'Test';

  const val = coerceFiniteNumber(firstDefined(
    t.value,
    t.Value,
    t.result,
    t.test_result,
    t.testResult,
    t.numeric_value,
    t.numericValue,
    t.observed_value,
    t.observedValue,
    t.machine_value,
    t.machineValue,
    t.measured_value,
    t.measuredValue,
    t.reported_value,
    t.reportedValue,
    t.actual_value,
    t.actualValue,
    t.reading,
  ));

  const lower = coerceFiniteNumber(firstDefined(
    t.lower_range,
    t.lowerRange,
    t.min_range,
    t.minRange,
    t.reference_low,
    t.referenceLow,
    t.normal_min,
    t.normalMin,
    t.ref_low,
    t.refLow,
    t.low_normal,
    t.lowNormal,
    t.low_risk_lower_range_male,
    t.lowRiskLowerRangeMale,
    t.low_risk_lower_range_female,
    t.lowRiskLowerRangeFemale,
  ));

  const higher = coerceFiniteNumber(firstDefined(
    t.higher_range,
    t.higherRange,
    t.upper_range,
    t.upperRange,
    t.max_range,
    t.maxRange,
    t.reference_high,
    t.referenceHigh,
    t.normal_max,
    t.normalMax,
    t.ref_high,
    t.refHigh,
    t.high_normal,
    t.highNormal,
    t.low_risk_higher_range_male,
    t.lowRiskHigherRangeMale,
    t.low_risk_higher_range_female,
    t.lowRiskHigherRangeFemale,
  ));

  const unitRaw = firstDefined(t.unit, t.units, t.unit_of_measure, t.unitOfMeasure);
  const unit = unitRaw !== undefined && unitRaw !== null ? String(unitRaw).trim() : '';

  return {
    test_name,
    parameter_key: firstDefined(t.parameter_key, t.parameterKey) ?? null,
    value: val !== undefined ? val : null,
    lower_range: lower !== undefined ? lower : null,
    higher_range: higher !== undefined ? higher : null,
    unit: unit || null,
    test_id: firstDefined(t.test_id, t.testId, t.id) ?? null,
    diagnostic_test_id: firstDefined(t.diagnostic_test_id, t.diagnosticTestId) ?? null,
  };
};

/** Prefer normalized row; fall back to raw test keys (handles gateways that omit fields from normalization). */
export const resolveBloodParameterNumericValue = (normalizedRow, rawTest) => {
  const fromRow = coerceFiniteNumber(normalizedRow?.value);
  if (fromRow !== undefined) {
    return fromRow;
  }
  const t = rawTest && typeof rawTest === 'object' ? rawTest : {};
  return coerceFiniteNumber(firstDefined(
    t.value,
    t.Value,
    t.machine_value,
    t.machineValue,
    t.result,
    t.test_result,
    t.testResult,
    t.reading,
    t.actual_value,
    t.actualValue,
    t.numeric_value,
    t.numericValue,
  ));
};

/** Canonical `{ group_name, tests[] }[]` for consumers that expect the Python report shape. */
export const normalizeBloodParametersReportPayload = (payload) => {
  const rawGroups = extractBloodParameterGroupsArray(payload);
  return rawGroups.map((group) => ({
    group_name: pickBloodParameterGroupName(group),
    tests: getBloodParameterTestsFromGroup(group).map(normalizeBloodParameterTestRow),
  }));
};
