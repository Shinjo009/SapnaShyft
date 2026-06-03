/**
 * Questionnaire visibility — mirrors GET /questionnaire/:id/category/:cid evaluation
 * (visibility_rules, user preferences, parent answers in question order).
 */

const isEmptyAnswer = (value) => {
  if (value === null || value === undefined) {
    return true;
  }
  if (Array.isArray(value)) {
    return value.length === 0;
  }
  if (typeof value === 'string' && value.trim() === '') {
    return true;
  }
  return false;
};

const LIFESTYLE_WALKING_WHEEL_KEY_SUFFIX = '__walking_wheel__';
const OTHER_TEXT_SELECTION_KEY_SUFFIX = '__other_text';

/** Fallback when API rules are absent (nutrition conditional follow-ups). */
const DEFAULT_VISIBILITY_RULES_BY_QUESTION_KEY = {
  red_meat_frequency: {
    match: 'all',
    conditions: [
      {
        type: 'question_answer',
        question_key: 'diet_preference',
        operator: 'not_in',
        value: ['0', '3', '4', '5'],
      },
    ],
  },
  caffeine_type: {
    match: 'all',
    conditions: [
      {
        type: 'question_answer',
        question_key: 'caffeine_frequency',
        operator: 'not_in',
        value: ['0', '3'],
      },
    ],
  },
};

const normalizeRuleText = (value) => {
  if (value == null) {
    return '';
  }
  if (Array.isArray(value)) {
    return value.map((item) => normalizeRuleText(item)).join(',');
  }
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  return String(value).trim().toLowerCase();
};

const getOptionDisplayText = (option) => String(
  option?.display_name ?? option?.label ?? '',
).trim();

const getOptionStoredValue = (option) => String(
  option?.option_value ?? option?.value ?? '',
).trim();

/**
 * Map UI chip labels (display_name) to API option_value codes for rule matching.
 */
export const normalizeAnswerForVisibilityRules = (question, answer) => {
  if (isEmptyAnswer(answer)) {
    return answer;
  }

  const opts = Array.isArray(question?.options) ? question.options : [];
  if (opts.length === 0) {
    return answer;
  }

  const normalizePiece = (piece) => {
    if (piece == null || (typeof piece === 'object' && !Array.isArray(piece))) {
      return piece;
    }
    const raw = String(piece).trim();
    if (raw === '') {
      return piece;
    }

    const matched = opts.find((option) => {
      const stored = getOptionStoredValue(option);
      const display = getOptionDisplayText(option);
      return (stored !== '' && normalizeRuleText(stored) === normalizeRuleText(raw))
        || (display !== '' && normalizeRuleText(display) === normalizeRuleText(raw));
    });

    if (!matched) {
      return piece;
    }

    const stored = getOptionStoredValue(matched);
    return stored !== '' ? stored : getOptionDisplayText(matched) || piece;
  };

  if (Array.isArray(answer)) {
    return answer.map((item) => normalizePiece(item));
  }

  return normalizePiece(answer);
};

const matchesOperator = (actual, expected, operator) => {
  const op = String(operator || 'equals').trim().toLowerCase();
  if (op === 'equals') {
    return normalizeRuleText(actual) === normalizeRuleText(expected);
  }
  if (op === 'not_equals') {
    return normalizeRuleText(actual) !== normalizeRuleText(expected);
  }
  if (op === 'contains') {
    if (Array.isArray(actual)) {
      return actual.some((item) => normalizeRuleText(item) === normalizeRuleText(expected));
    }
    return normalizeRuleText(expected) !== ''
      && normalizeRuleText(actual).includes(normalizeRuleText(expected));
  }
  if (op === 'not_contains') {
    if (Array.isArray(actual)) {
      return !actual.some((item) => normalizeRuleText(item) === normalizeRuleText(expected));
    }
    return normalizeRuleText(expected) === ''
      || !normalizeRuleText(actual).includes(normalizeRuleText(expected));
  }
  if (op === 'in') {
    if (!Array.isArray(expected)) {
      return false;
    }
    return expected.some((item) => normalizeRuleText(actual) === normalizeRuleText(item));
  }
  if (op === 'not_in') {
    if (!Array.isArray(expected)) {
      return false;
    }
    return !expected.some((item) => normalizeRuleText(actual) === normalizeRuleText(item));
  }
  return false;
};

export const evaluateVisibilityRules = (visibilityRules, answersByQuestionKey, preferences = {}) => {
  if (!visibilityRules || typeof visibilityRules !== 'object') {
    return true;
  }

  const conditions = visibilityRules.conditions;
  if (!Array.isArray(conditions) || conditions.length === 0) {
    return true;
  }

  const matchMode = String(visibilityRules.match || 'all').trim().toLowerCase();
  const results = conditions.map((condition) => {
    if (!condition || typeof condition !== 'object') {
      return false;
    }
    const conditionType = String(condition.type || '').trim().toLowerCase();
    const operator = String(condition.operator || 'equals').trim().toLowerCase();
    const expected = condition.value;

    if (conditionType === 'question_answer') {
      const questionKey = String(condition.question_key || '').trim().toLowerCase();
      const actual = answersByQuestionKey[questionKey];
      return matchesOperator(actual, expected, operator);
    }
    if (conditionType === 'user_preference') {
      const preferenceKey = String(condition.preference_key || '').trim().toLowerCase();
      const actual = preferences[preferenceKey];
      return matchesOperator(actual, expected, operator);
    }
    return false;
  });

  return matchMode === 'any' ? results.some(Boolean) : results.every(Boolean);
};

const readInlineQuestionAnswer = (question) => {
  const inline = question?.answer
    ?? question?.response
    ?? question?.value
    ?? question?.selected_option
    ?? question?.selected_options
    ?? question?.user_answer
    ?? question?.user_response;
  return isEmptyAnswer(inline) ? null : inline;
};

const isMultiChoiceQuestion = (question) => {
  const type = String(question?.question_type || '').trim().toLowerCase();
  return type === 'multi_choice' || type === 'multiple_choice';
};

const walkingWheelStorageKey = (questionKey) => `${String(questionKey || '')}${LIFESTYLE_WALKING_WHEEL_KEY_SUFFIX}`;

const selectionValueToAnswer = (question, selections) => {
  const key = String(question?.question_key || '').trim();
  if (!key || !selections || typeof selections !== 'object') {
    return null;
  }

  const wheel = selections[walkingWheelStorageKey(key)]
    ?? selections[walkingWheelStorageKey(key.replace(/_/g, '-'))];
  if (wheel && typeof wheel === 'object' && Number.isFinite(Number(wheel.value))) {
    const unit = String(wheel.unitLabel || wheel.unit || '').trim();
    if (unit) {
      return { value: Number(wheel.value), unit };
    }
  }

  const raw = selections[key]
    ?? selections[key.replace(/-/g, '_')]
    ?? selections[key.replace(/_/g, '-')];

  if (raw == null) {
    return null;
  }

  if (Array.isArray(raw)) {
    if (raw.length === 0) {
      return null;
    }
    if (isMultiChoiceQuestion(question)) {
      return raw.map((item) => String(item ?? '').trim()).filter(Boolean);
    }
    return raw[0];
  }

  return raw;
};

const resolveAnswerForVisibility = (question, selections) => {
  const fromSelection = selectionValueToAnswer(question, selections);
  const raw = !isEmptyAnswer(fromSelection) ? fromSelection : readInlineQuestionAnswer(question);
  if (isEmptyAnswer(raw)) {
    return null;
  }
  return normalizeAnswerForVisibilityRules(question, raw);
};

const getEffectiveVisibilityRules = (question) => {
  const rules = question?.visibility_rules;
  if (rules && typeof rules === 'object' && Array.isArray(rules.conditions) && rules.conditions.length > 0) {
    return rules;
  }
  const questionKey = String(question?.question_key || '').trim().toLowerCase();
  return DEFAULT_VISIBILITY_RULES_BY_QUESTION_KEY[questionKey] || null;
};

/**
 * Profile / preference fields used by visibility_rules (`user_preference` conditions).
 */
export const getQuestionnairePreferencesFromProfile = (profile) => {
  if (!profile || typeof profile !== 'object') {
    return {};
  }
  const nested = profile.preferences && typeof profile.preferences === 'object'
    ? profile.preferences
    : {};
  const allergies = nested.allergies ?? profile.allergies;
  return {
    diet_preference: nested.diet_preference ?? profile.diet_preference ?? null,
    allergies: Array.isArray(allergies) ? allergies : allergies ?? null,
  };
};

/**
 * Recomputes `is_visible` per question (API order) using rules, saved answers, and live selections.
 */
export const computeQuestionsWithVisibility = (questions = [], { selections = {}, preferences = {} } = {}) => {
  const list = Array.isArray(questions) ? questions : [];
  const prefs = preferences && typeof preferences === 'object' ? preferences : {};

  return list.map((question, index) => {
    const answersByQuestionKey = {};
    for (let i = 0; i < index; i += 1) {
      const prior = list[i];
      const priorKey = String(prior?.question_key || '').trim().toLowerCase();
      if (!priorKey) {
        continue;
      }
      const answer = resolveAnswerForVisibility(prior, selections);
      if (!isEmptyAnswer(answer)) {
        answersByQuestionKey[priorKey] = answer;
      }
    }

    const rules = getEffectiveVisibilityRules(question);
    let isVisible = true;
    if (rules) {
      isVisible = evaluateVisibilityRules(rules, answersByQuestionKey, prefs);
    } else if (question?.is_visible === false) {
      isVisible = false;
    }

    return {
      ...question,
      is_visible: isVisible,
    };
  });
};

export const filterVisibleQuestions = (questions = [], context = {}) => (
  computeQuestionsWithVisibility(questions, context).filter((q) => q.is_visible !== false && !q.is_read_only)
);

export const isQuestionVisibleForDisplay = (question) => (
  Boolean(question)
  && question.is_read_only !== true
  && question.is_visible !== false
);

/** Drop answers for cards removed by visibility (e.g. red meat after Jain diet). */
export const pruneSelectionsForVisibleCards = (selections = {}, cardsData = []) => {
  if (!selections || typeof selections !== 'object') {
    return selections;
  }

  const visibleKeys = new Set(
    (Array.isArray(cardsData) ? cardsData : [])
      .map((card) => String(card?.key || '').trim())
      .filter(Boolean),
  );

  if (visibleKeys.size === 0) {
    return selections;
  }

  let changed = false;
  const next = { ...selections };

  Object.keys(next).forEach((key) => {
    if (key.includes(LIFESTYLE_WALKING_WHEEL_KEY_SUFFIX)) {
      const baseKey = key.slice(0, key.indexOf(LIFESTYLE_WALKING_WHEEL_KEY_SUFFIX));
      if (!visibleKeys.has(baseKey)) {
        delete next[key];
        changed = true;
      }
      return;
    }

    if (key.endsWith(OTHER_TEXT_SELECTION_KEY_SUFFIX)) {
      const parentKey = key.slice(0, -OTHER_TEXT_SELECTION_KEY_SUFFIX.length);
      if (!visibleKeys.has(parentKey)) {
        delete next[key];
        changed = true;
      }
      return;
    }

    if (!visibleKeys.has(key)) {
      delete next[key];
      changed = true;
    }
  });

  return changed ? next : selections;
};
