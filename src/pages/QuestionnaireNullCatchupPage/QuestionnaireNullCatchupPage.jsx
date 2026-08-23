import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import './QuestionnaireNullCatchupPage.css';
import {
  buildAnthropometryInitialValuesFromResponses,
  buildAnthropometryResponses,
  coerceResponsesToOptionKeys,
  buildSelectionStateFromResponses,
  buildVitalsInitialValuesFromResponses,
  buildVitalsResponses,
  findMappedOtherTextQuestion,
  isLikelyOtherTextQuestion,
  toFamilyApiCards,
  findFamilyHistoryCardKeys,
  isNoneOptionLabel,
} from '../HealthAssessmentPage/HealthAssessmentPage';
import HealthAssessmentScenario2Category from '../HealthAssessmentPage/HealthAssessmentScenario2Category';
import { PageBackdrop } from '../../newDesQues/components/PageBackdrop';
import { AnthropometryStep } from '../../newDesQues/components/anthropometry/AnthropometryStep';
import backgroundAssessmentSvg from '../../newDesQues/assets/Background.svg';
import { getMyProfileCached } from '../../services/profileService';
import {
  computeQuestionsWithVisibility,
  getQuestionnairePreferencesFromProfile,
  isEmptyAnswer,
  loadQuestionnaireContextForAssessmentInstance,
  mapCategoryToRouteId,
  markFamilyHistoryQuestionnaireDraftKnown,
  markNutritionLogQuestionnaireDraftKnown,
  submitQuestionnaireResponses,
  submitFitprintGapQuestionnaire,
} from '../../services/questionnaireService';
import { clearReportRequestCache } from '../../services/reportService';
import {
  anthropometryPrimaryHasUnfilled,
  evaluateFitprintCatchupLoadedContext,
} from '../../utils/fitprintGapCatchupCompletion';

const SWIPE_ROUTE_ORDER = ['family-history', 'lifestyle-habits', 'nutrition-log', 'vitals'];

/** Single top-of-flow category label for the FitPrint gap questionnaire (replaces per-section titles). */
const FITPRINT_CATCHUP_HEADING = 'FitPrint';

/** Swipe embeds that snapshot unanswered questions once per visit (no mid-flow refilter / no draft-on-swipe). */
const CATCHUP_EMBED_SNAPSHOT_ROUTES = new Set(['family-history', 'lifestyle-habits', 'nutrition-log', 'vitals']);

/** Multiple assessment categories can map to the same routeId (e.g. two nutrition blocks); merge without losing questions. */
const buildQuestionsByRoute = (categories, questionsByCategoryId) => {
  const chunks = {};
  (Array.isArray(categories) ? categories : []).forEach((cat) => {
    const route = mapCategoryToRouteId(cat);
    if (!route) {
      return;
    }
    const cid = Number(cat.category_id || 0);
    if (cid <= 0) {
      return;
    }
    const list = questionsByCategoryId[String(cid)] || [];
    const tagged = list.map((q) => ({
      ...q,
      __catchupCategoryId: cid,
    }));
    if (!chunks[route]) {
      chunks[route] = [];
    }
    chunks[route].push(...tagged);
  });
  const out = {};
  Object.keys(chunks).forEach((route) => {
    const byId = new Map();
    (chunks[route] || []).forEach((q) => {
      const id = Number(q?.question_id || q?.id || 0);
      if (id > 0 && !byId.has(id)) {
        byId.set(id, q);
      }
    });
    out[route] = Array.from(byId.values());
  });
  return out;
};

const hasCategoriesForRoute = (categories, routeId) => (
  (Array.isArray(categories) ? categories : []).some((c) => mapCategoryToRouteId(c) === routeId)
);

/** Merge saved responses from every category that shares this route (same question_id: first wins). */
const mergeResponsesForRoute = (categories, responsesByCategoryId, routeId) => {
  const byQid = new Map();
  (Array.isArray(categories) ? categories : []).forEach((cat) => {
    if (mapCategoryToRouteId(cat) !== routeId) {
      return;
    }
    const cid = String(cat.category_id || '');
    const rows = responsesByCategoryId[cid] || [];
    rows.forEach((row) => {
      const id = Number(row?.question_id || row?.questionId || 0);
      if (id > 0 && !byQid.has(id)) {
        byQid.set(id, row);
      }
    });
  });
  return Array.from(byQid.values());
};

const mergeResponsesByQuestionId = (existing = [], incoming = []) => {
  const map = new Map();
  (Array.isArray(existing) ? existing : []).forEach((row) => {
    const id = Number(row?.question_id || row?.questionId || 0);
    if (id > 0) {
      map.set(id, row);
    }
  });
  (Array.isArray(incoming) ? incoming : []).forEach((row) => {
    const id = Number(row?.question_id || row?.questionId || 0);
    if (id > 0) {
      map.set(id, row);
    }
  });
  return Array.from(map.values());
};

const normalizeAnswerCandidate = (raw) => {
  if (raw == null) {
    return null;
  }
  if (typeof raw === 'string') {
    const t = raw.trim();
    if (t === '' || t === '[]' || t === '{}' || t.toLowerCase() === 'null') {
      return null;
    }
    if (t.startsWith('[') || (t.startsWith('{') && t.endsWith('}'))) {
      try {
        return JSON.parse(t);
      } catch {
        return raw;
      }
    }
  }
  return raw;
};

const getAnswerForQuestion = (question, rawResponses = []) => {
  const inline = question?.answer
    ?? question?.response
    ?? question?.value
    ?? question?.selected_option
    ?? question?.selected_options
    ?? question?.user_answer
    ?? question?.user_response
    ?? question?.answers;
  const nInline = normalizeAnswerCandidate(inline);
  if (!isEmptyAnswer(nInline)) {
    return nInline;
  }
  const qid = Number(question?.question_id || question?.id || 0);
  if (qid <= 0) {
    return null;
  }
  const row = rawResponses.find((r) => Number(r?.question_id || r?.questionId || 0) === qid);
  const ans = row?.answer
    ?? row?.response
    ?? row?.value
    ?? row?.selected_option
    ?? row?.selected_options
    ?? row?.answers;
  return normalizeAnswerCandidate(ans);
};

const questionIsUnfilled = (question, rawResponses) => {
  if (!question || typeof question !== 'object') {
    return false;
  }
  if (question.is_read_only || question.is_visible === false) {
    return false;
  }
  return isEmptyAnswer(getAnswerForQuestion(question, rawResponses));
};

/**
 * Unfilled questions (per `unfilledPredicate`) plus any "Other" free-text partner (family/lifestyle/nutrition
 * cards drop other-text rows in to*ApiCards; without the parent, you get zero cards and the empty state).
 */
const expandCatchupQuestionsForCardBundles = (fullQs, rawResponses, unfilledPredicate) => {
  const list = Array.isArray(fullQs) ? fullQs : [];
  const unfilled = list.filter((q) => unfilledPredicate(q, list, rawResponses));
  if (unfilled.length === 0) {
    return list;
  }
  const byId = new Map(
    list
      .map((q) => [Number(q?.question_id || q?.id || 0), q])
      .filter(([id]) => id > 0),
  );
  const otherTextIdToParent = new Map();
  list.forEach((parent) => {
    const mapped = findMappedOtherTextQuestion(list, parent);
    const oid = Number(mapped?.question_id || mapped?.id || 0);
    if (oid > 0 && mapped) {
      otherTextIdToParent.set(oid, parent);
    }
  });
  const outIds = new Set();
  const addById = (id) => {
    if (id > 0 && byId.has(id)) {
      outIds.add(id);
    }
  };
  unfilled.forEach((q) => {
    const id = Number(q?.question_id || q?.id || 0);
    addById(id);
    const mapped = findMappedOtherTextQuestion(list, q);
    const mid = Number(mapped?.question_id || mapped?.id || 0);
    if (mid > 0) {
      addById(mid);
    }
    if (isLikelyOtherTextQuestion(q)) {
      const parent = otherTextIdToParent.get(id);
      if (parent) {
        const pid = Number(parent?.question_id || parent?.id || 0);
        addById(pid);
      }
    }
  });
  const ordered = list.filter((row) => outIds.has(Number(row?.question_id || row?.id || 0)));
  return ordered.length > 0 ? ordered : list;
};

const isAnthropometryFollowupQuestion = (question) => {
  const k = String(question?.question_key || '').toLowerCase();
  const t = String(question?.question_text || '').toLowerCase();
  return k.includes('hip') || k.includes('body_fat') || k.includes('fat_percent')
    || t.includes('hip size') || t.includes('body fat') || t.includes('body-fat');
};

const anthropometryFollowupHasUnfilled = (questions, rawResponses) => (
  questions.some((q) => isAnthropometryFollowupQuestion(q) && questionIsUnfilled(q, rawResponses))
);

const getCategoryForRoute = (categories, routeId) => (
  (Array.isArray(categories) ? categories : []).find((c) => mapCategoryToRouteId(c) === routeId) || null
);

const formatCatchupRequestError = (error) => {
  const raw = String(error?.message || error || '').trim();
  if (!raw || raw === 'Failed to fetch') {
    return 'Could not reach the server. Check your connection and that the API is running.';
  }
  return raw;
};

const cardKeyForQuestion = (q) => String(q?.question_key || `question-${q?.question_id || q?.id || ''}`);

/** Matches EmbeddedFamilyHistory: medication card is removed when diagnosed is only "None". */
const isFamilyMedicationSkippedWhenDiagnosedNoneOnly = (fullQs, raw, q) => {
  const cards = toFamilyApiCards(fullQs);
  const { diagnosedKey, medicationKey } = findFamilyHistoryCardKeys(cards);
  if (!medicationKey || !diagnosedKey) {
    return false;
  }
  if (String(medicationKey) !== cardKeyForQuestion(q)) {
    return false;
  }
  const selections = buildSelectionStateFromResponses(fullQs, raw);
  const diagnosedSel = Array.isArray(selections[diagnosedKey]) ? selections[diagnosedKey] : [];
  return diagnosedSel.length > 0 && diagnosedSel.every((item) => isNoneOptionLabel(item));
};

const familyQuestionBlocksCatchup = (fullQs, raw, q) => (
  questionIsUnfilled(q, raw) && !isFamilyMedicationSkippedWhenDiagnosedNoneOnly(fullQs, raw, q)
);

/** Matches EmbeddedFamilyHistory visible stack (medication card hidden when diagnosed is only None). */
const familyVisibleCardCount = (catchupQuestionSubset, selections) => {
  const cards = toFamilyApiCards(catchupQuestionSubset);
  if (cards.length === 0) {
    return 0;
  }
  const { diagnosedKey, medicationKey } = findFamilyHistoryCardKeys(cards);
  if (!medicationKey || !diagnosedKey) {
    return cards.length;
  }
  const diagnosedSel = Array.isArray(selections?.[diagnosedKey]) ? selections[diagnosedKey] : [];
  const diagnosedNoneOnly = diagnosedSel.length > 0 && diagnosedSel.every((item) => isNoneOptionLabel(item));
  if (!diagnosedNoneOnly) {
    return cards.length;
  }
  return cards.filter((c) => c.key !== medicationKey).length;
};

const routesWithAnyUnfilled = (
  categories,
  questionsByRoute,
  responsesByCategoryId,
  contextQuestionsByRoute = questionsByRoute,
) => (
  SWIPE_ROUTE_ORDER.filter((routeId) => {
    if (!hasCategoriesForRoute(categories, routeId)) {
      return false;
    }
    const qs = questionsByRoute[routeId] || [];
    const contextQs = contextQuestionsByRoute[routeId] || qs;
    const raw = mergeResponsesForRoute(categories, responsesByCategoryId, routeId);
    if (routeId === 'family-history') {
      return qs.some((q) => familyQuestionBlocksCatchup(contextQs, raw, q));
    }
    return qs.some((q) => questionIsUnfilled(q, raw));
  })
);

/**
 * Health Span Index / FitPrint gap flow: remaining questions come from
 * GET /questionnaire/{id}/category/{cid}?question=unanswered.
 * Anthropometry first (primary then follow-up when needed), then remaining categories in order
 * (family â†’ lifestyle â†’ nutrition â†’ vitals). Each swipe section lists the unanswered questions
 * returned by that API (order preserved, deck does not shrink while answering). Responses are saved
 * only when you tap Done on that section. Final Continue/submit calls POST /assessments/{id}/submit.
 */
const QuestionnaireNullCatchupPage = ({ assessmentInstanceId, onBack, onDone }) => {
  const instanceId = Number(assessmentInstanceId);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;
  const [loadState, setLoadState] = useState('loading');
  const [loadError, setLoadError] = useState(null);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const finalizeInFlightRef = useRef(false);
  const [categories, setCategories] = useState([]);
  const [questionsByCategoryId, setQuestionsByCategoryId] = useState({});
  const [contextQuestionsByCategoryId, setContextQuestionsByCategoryId] = useState({});
  const [responsesByCategoryId, setResponsesByCategoryId] = useState({});
  const responsesMapRef = useRef({});

  const [anthroPhase, setAnthroPhase] = useState(null);
  const [anthroPrimaryValues, setAnthroPrimaryValues] = useState({});
  const [anthroFollowupValues, setAnthroFollowupValues] = useState({});
  const [, setShowAnthroFollowup] = useState(false);

  const [swipeRoutes, setSwipeRoutes] = useState([]);
  /** route -> frozen embed payload for this visit (questions + initial UI state at entry). */
  const [catchupRouteSnapshots, setCatchupRouteSnapshots] = useState({});
  const [questionnairePreferences, setQuestionnairePreferences] = useState({});

  useEffect(() => {
    let cancelled = false;
    void getMyProfileCached()
      .then((profile) => {
        if (!cancelled) {
          setQuestionnairePreferences(getQuestionnairePreferencesFromProfile(profile));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setQuestionnairePreferences({});
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const questionsByRoute = useMemo(
    () => buildQuestionsByRoute(categories, questionsByCategoryId),
    [categories, questionsByCategoryId],
  );

  /** Answered + unanswered definitions â€” used for visibility / family skip, not for the listed deck. */
  const contextQuestionsByRoute = useMemo(
    () => buildQuestionsByRoute(categories, contextQuestionsByCategoryId),
    [categories, contextQuestionsByCategoryId],
  );

  const anthroQuestions = useMemo(
    () => questionsByRoute['anthropometry'] || [],
    [questionsByRoute],
  );

  useEffect(() => {
    responsesMapRef.current = responsesByCategoryId;
  }, [responsesByCategoryId]);

  const persistCategoryResponses = useCallback(async (routeId, newResponses) => {
    const incoming = Array.isArray(newResponses) ? newResponses : [];
    const fallbackCat = getCategoryForRoute(categories, routeId);
    if (!fallbackCat && incoming.length === 0) {
      return responsesMapRef.current;
    }

    const resolveInstanceIdForCategoryId = (categoryId) => {
      const targetCategoryId = Number(categoryId);
      const match = (Array.isArray(categories) ? categories : []).find(
        (cat) => Number(cat?.category_id || cat?.id || 0) === targetCategoryId,
      );
      const fromCategory = Number(
        match?.assessment_instance_id
        || match?.assessment_id
        || 0,
      );
      return fromCategory > 0 ? fromCategory : instanceId;
    };

    // Prefer full context defs (answered + unanswered) so option_value keys are available to remap labels.
    const routeQuestions = [
      ...(contextQuestionsByRoute[routeId] || []),
      ...(questionsByRoute[routeId] || []),
    ];
    const keyedIncoming = coerceResponsesToOptionKeys(routeQuestions, incoming);
    const partition = new Map();
    keyedIncoming.forEach((row) => {
      const qid = Number(row?.question_id || row?.questionId || 0);
      if (qid <= 0) {
        return;
      }
      const q = routeQuestions.find((x) => Number(x?.question_id || x?.id || 0) === qid);
      const bucket = Number(q?.__catchupCategoryId || fallbackCat?.category_id || 0);
      if (bucket <= 0) {
        return;
      }
      if (!partition.has(bucket)) {
        partition.set(bucket, []);
      }
      partition.get(bucket).push(row);
    });

    let nextMap = { ...responsesMapRef.current };

    if (keyedIncoming.length === 0) {
      return nextMap;
    }

    if (partition.size > 0) {
      for (const [catIdNum, rows] of partition) {
        const cid = String(catIdNum);
        const prev = nextMap[cid] || [];
        const remappedPrev = coerceResponsesToOptionKeys(routeQuestions, prev);
        const merged = mergeResponsesByQuestionId(remappedPrev, rows);
        if (rows.length > 0) {
          const targetInstanceId = resolveInstanceIdForCategoryId(catIdNum);
          // Only PUT this Done action's answers (already remapped to option keys).
          await submitQuestionnaireResponses(targetInstanceId, catIdNum, rows);
        }
        nextMap = { ...nextMap, [cid]: merged };
      }
    } else if (fallbackCat) {
      const cid = String(fallbackCat.category_id || '');
      const prev = nextMap[cid] || [];
      const remappedPrev = coerceResponsesToOptionKeys(routeQuestions, prev);
      const merged = mergeResponsesByQuestionId(remappedPrev, keyedIncoming);
      const fallbackCategoryId = Number(fallbackCat.category_id);
      const targetInstanceId = resolveInstanceIdForCategoryId(fallbackCategoryId);
      await submitQuestionnaireResponses(targetInstanceId, fallbackCategoryId, keyedIncoming);
      nextMap = { ...nextMap, [cid]: merged };
    } else {
      return responsesMapRef.current;
    }

    responsesMapRef.current = nextMap;
    setResponsesByCategoryId(nextMap);
    if (routeId === 'family-history') {
      markFamilyHistoryQuestionnaireDraftKnown(true);
    }
    if (routeId === 'nutrition-log') {
      markNutritionLogQuestionnaireDraftKnown(true);
    }
    return nextMap;
  }, [categories, instanceId, questionsByRoute, contextQuestionsByRoute]);

  const recomputeSwipeFromMap = useCallback((responsesMap) => {
    const qRoute = buildQuestionsByRoute(categories, questionsByCategoryId);
    const contextRoute = buildQuestionsByRoute(categories, contextQuestionsByCategoryId);
    const next = routesWithAnyUnfilled(categories, qRoute, responsesMap, contextRoute);
    setSwipeRoutes(next);
    return next;
  }, [categories, questionsByCategoryId, contextQuestionsByCategoryId]);

  const finalizeAndExit = useCallback(async () => {
    if (finalizeInFlightRef.current) {
      return;
    }
    finalizeInFlightRef.current = true;
    setIsFinalizing(true);
    setLoadError(null);
    try {
      await submitFitprintGapQuestionnaire(instanceId);
      clearReportRequestCache();
      onDoneRef.current?.();
    } catch (error) {
      setLoadError(formatCatchupRequestError(error));
      setLoadState('error');
    } finally {
      finalizeInFlightRef.current = false;
      setIsFinalizing(false);
    }
  }, [instanceId]);

  const reportCatchupError = useCallback((error) => {
    setLoadError(formatCatchupRequestError(error));
    setLoadState('error');
  }, []);

  const finishAll = useCallback(() => {
    void finalizeAndExit();
  }, [finalizeAndExit]);

  const handleRouteDone = useCallback(async (routeId, responses) => {
    try {
      const nextMap = await persistCategoryResponses(routeId, responses);
      const nextSwipe = recomputeSwipeFromMap(nextMap);
      if (nextSwipe.length === 0) {
        await finalizeAndExit();
      }
    } catch (error) {
      reportCatchupError(error);
    }
  }, [persistCategoryResponses, recomputeSwipeFromMap, finalizeAndExit, reportCatchupError]);

  const saveAnthropometryAndContinue = useCallback(async (primaryVals, followupVals) => {
    try {
      const responses = buildAnthropometryResponses(
        anthroQuestions,
        primaryVals || {},
        followupVals || {},
      );
      const nextMap = await persistCategoryResponses('anthropometry', responses);
      setAnthroPhase('done');
      const nextSwipe = recomputeSwipeFromMap(nextMap);
      if (nextSwipe.length === 0) {
        await finalizeAndExit();
      }
    } catch (error) {
      reportCatchupError(error);
    }
  }, [
    anthroQuestions,
    finalizeAndExit,
    persistCategoryResponses,
    recomputeSwipeFromMap,
    reportCatchupError,
  ]);

  /** Skip Family History when the embedded UI would show zero swipe cards (avoids spurious saves / PUTs). */
  useLayoutEffect(() => {
    if (loadState !== 'ready') {
      return;
    }
    if (swipeRoutes[0] !== 'family-history') {
      return;
    }
    if (!hasCategoriesForRoute(categories, 'family-history')) {
      return;
    }
    const qs = questionsByRoute['family-history'] || [];
    const contextQs = contextQuestionsByRoute['family-history'] || qs;
    const raw = mergeResponsesForRoute(categories, responsesMapRef.current, 'family-history');
    const nullQs = expandCatchupQuestionsForCardBundles(
      qs,
      raw,
      (q, _list, r) => familyQuestionBlocksCatchup(contextQs, r, q),
    );
    const initialSelections = buildSelectionStateFromResponses(contextQs, raw);
    if (familyVisibleCardCount(nullQs, initialSelections) > 0) {
      return;
    }
    const nextRoutes = swipeRoutes[0] === 'family-history'
      ? swipeRoutes.slice(1)
      : swipeRoutes.filter((r) => r !== 'family-history');
    setSwipeRoutes(nextRoutes);
    if (nextRoutes.length === 0) {
      finishAll();
    }
  }, [
    loadState,
    swipeRoutes,
    categories,
    questionsByRoute,
    contextQuestionsByRoute,
    responsesByCategoryId,
    finishAll,
  ]);

  /**
   * Snapshot API unanswered questions once per route visit so the deck stays stable until Done.
   * `questionsByRoute` is already filtered via `?question=unanswered`.
   */
  useLayoutEffect(() => {
    if (loadState !== 'ready') {
      return;
    }
    const route = swipeRoutes[0];
    if (!route || !CATCHUP_EMBED_SNAPSHOT_ROUTES.has(route)) {
      return;
    }
    setCatchupRouteSnapshots((prev) => {
      if (Object.prototype.hasOwnProperty.call(prev, route)) {
        return prev;
      }
      if (!hasCategoriesForRoute(categories, route)) {
        return prev;
      }
      const qs = route === 'vitals'
        ? (questionsByRoute.vitals || [])
        : (questionsByRoute[route] || []);
      const contextQs = contextQuestionsByRoute[route] || qs;
      const raw = mergeResponsesForRoute(categories, responsesMapRef.current, route);
      const selectionsForVisibility = buildSelectionStateFromResponses(contextQs, raw);
      const visibleQs = computeQuestionsWithVisibility(qs, {
        selections: selectionsForVisibility,
        preferences: questionnairePreferences,
      }).filter((q) => q.is_visible !== false);

      if (route === 'vitals') {
        const vitalsInitial = buildVitalsInitialValuesFromResponses(contextQs, raw);
        return {
          ...prev,
          [route]: {
            kind: 'vitals',
            questions: visibleQs,
            initialValues: {
              systolic: vitalsInitial.systolic,
              diastolic: vitalsInitial.diastolic,
            },
          },
        };
      }

      // Keep Other-text partners when the API returns the parent but not the free-text row.
      const unfilledPred = route === 'family-history'
        ? (q, _list, r) => familyQuestionBlocksCatchup(contextQs, r, q)
        : (q, _list, r) => questionIsUnfilled(q, r);
      const questions = expandCatchupQuestionsForCardBundles(visibleQs, raw, unfilledPred);
      const initialSelections = buildSelectionStateFromResponses(contextQs, raw);
      return {
        ...prev,
        [route]: { kind: 'cards', questions, initialSelections },
      };
    });
  }, [
    loadState,
    swipeRoutes,
    categories,
    questionsByRoute,
    contextQuestionsByRoute,
    questionnairePreferences,
  ]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadState('loading');
      setLoadError(null);
      setCatchupRouteSnapshots({});
      try {
        const ctx = await loadQuestionnaireContextForAssessmentInstance(instanceId, {
          question: 'unanswered',
        });
        if (cancelled) {
          return;
        }
        const cats = ctx?.categories || [];
        const qBy = ctx?.questionsByCategoryId || {};
        const contextBy = ctx?.contextQuestionsByCategoryId || qBy;
        const rBy = { ...(ctx?.responsesByCategoryId || {}) };
        setCategories(cats);
        setQuestionsByCategoryId(qBy);
        setContextQuestionsByCategoryId(contextBy);
        setResponsesByCategoryId(rBy);
        responsesMapRef.current = rBy;

        const qRoute = buildQuestionsByRoute(cats, qBy);
        const contextRoute = buildQuestionsByRoute(cats, contextBy);
        const anthQ = qRoute['anthropometry'] || [];
        const anthContext = contextRoute['anthropometry'] || anthQ;
        const anthRaw = mergeResponsesForRoute(cats, rBy, 'anthropometry');

        const primaryOpen = anthropometryPrimaryHasUnfilled(anthQ, anthRaw);
        const followOpen = anthropometryFollowupHasUnfilled(anthQ, anthRaw);
        const init = buildAnthropometryInitialValuesFromResponses(anthContext, anthRaw);

        if (primaryOpen) {
          setAnthroPrimaryValues(init.primary || {});
          setAnthroFollowupValues(init.followup || {});
          setShowAnthroFollowup(false);
          setAnthroPhase('primary');
        } else if (followOpen) {
          setAnthroPrimaryValues(init.primary || {});
          setAnthroFollowupValues(init.followup || {});
          setShowAnthroFollowup(true);
          setAnthroPhase('followup_only');
        } else {
          setAnthroPhase('done');
        }

        if (evaluateFitprintCatchupLoadedContext({
          categories: cats,
          questionsByCategoryId: qBy,
          contextQuestionsByCategoryId: contextBy,
          responsesByCategoryId: rBy,
        })) {
          if (!cancelled) {
            finalizeInFlightRef.current = true;
            setIsFinalizing(true);
            try {
              await submitFitprintGapQuestionnaire(instanceId);
              clearReportRequestCache();
              if (!cancelled) {
                onDoneRef.current?.();
              }
            } catch (error) {
              if (!cancelled) {
                setLoadError(formatCatchupRequestError(error));
                setLoadState('error');
              }
            } finally {
              if (!cancelled) {
                finalizeInFlightRef.current = false;
                setIsFinalizing(false);
              }
            }
          }
          return;
        }

        const swipe = routesWithAnyUnfilled(cats, qRoute, rBy, contextRoute);
        setSwipeRoutes(swipe);

        setLoadState('ready');
      } catch (e) {
        if (!cancelled) {
          setLoadError(e?.message || 'Failed to load questionnaire');
          setLoadState('error');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [instanceId]);

  if (loadState === 'loading' || loadState === 'error' || isFinalizing) {
    return (
      <div className="questionnaire-null-catchup questionnaire-null-catchup--center">
        <h1 className="questionnaire-null-catchup__brand">{FITPRINT_CATCHUP_HEADING}</h1>
        {loadState === 'loading' || isFinalizing ? (
          <p className="questionnaire-null-catchup__text">
            {isFinalizing ? 'Submitting questionnaireâ€¦' : 'Loading questionnaireâ€¦'}
          </p>
        ) : (
          <>
            <p className="questionnaire-null-catchup__text">{loadError || 'Something went wrong.'}</p>
            <button type="button" className="questionnaire-null-catchup__btn" onClick={onBack}>
              Go back
            </button>
          </>
        )}
      </div>
    );
  }


  if (anthroPhase === 'primary' || anthroPhase === 'followup_after_primary' || anthroPhase === 'followup_only') {
    const startAtHip = anthroPhase === 'followup_only';
    return (
      <PageBackdrop mobileBackgroundSrc={backgroundAssessmentSvg}>
        <AnthropometryStep
          title={FITPRINT_CATCHUP_HEADING}
          questions={anthroQuestions}
          initialPrimary={anthroPrimaryValues}
          initialFollowup={anthroFollowupValues}
          initialIndex={startAtHip ? 3 : 0}
          onBack={() => {
            if (anthroPhase === 'followup_after_primary') {
              setShowAnthroFollowup(false);
              setAnthroPhase('primary');
              return;
            }
            onBack?.();
          }}
          onComplete={({ primary, followup }) => {
            setAnthroPrimaryValues(primary || {});
            setAnthroFollowupValues(followup || {});
            void saveAnthropometryAndContinue(primary || {}, followup || {});
          }}
        />
      </PageBackdrop>
    );
  }

  const currentSwipeRoute = swipeRoutes[0] || null;
  const swipeCategory = currentSwipeRoute
    ? (Array.isArray(categories) ? categories : []).find((cat) => mapCategoryToRouteId(cat) === currentSwipeRoute)
    : null;
  const swipeCategoryId = Number(swipeCategory?.category_id || 0);
  const swipeAssessmentInstanceId = Number(
    swipeCategory?.assessment_instance_id
    || swipeCategory?.assessment_id
    || instanceId
    || 0,
  );
  const swipeDraftResponses = currentSwipeRoute
    ? mergeResponsesForRoute(categories, responsesMapRef.current, currentSwipeRoute)
    : [];

  if (currentSwipeRoute === 'family-history') {
    const snap = catchupRouteSnapshots['family-history'];
    if (!snap || snap.kind !== 'cards') {
      return (
        <div className="questionnaire-null-catchup questionnaire-null-catchup--center">
          <h1 className="questionnaire-null-catchup__brand">{FITPRINT_CATCHUP_HEADING}</h1>
          <p className="questionnaire-null-catchup__text">Loading questions…</p>
        </div>
      );
    }
    const { questions: nullQs } = snap;
    return (
      <HealthAssessmentScenario2Category
        key="fitprint-family-history"
        routeId="family-history"
        questions={nullQs}
        draftResponses={swipeDraftResponses}
        assessmentInstanceId={swipeAssessmentInstanceId}
        categoryId={swipeCategoryId}
        headingOverride={FITPRINT_CATCHUP_HEADING}
        onBack={onBack}
        onStepDraftSave={async (routeId, responses) => {
          await persistCategoryResponses(routeId, responses);
        }}
        onStepComplete={async (routeId, responses) => {
          try {
            await handleRouteDone(routeId, responses);
          } catch (error) {
            reportCatchupError(error);
          }
        }}
      />
    );
  }

  if (currentSwipeRoute === 'lifestyle-habits') {
    const snap = catchupRouteSnapshots['lifestyle-habits'];
    if (!snap || snap.kind !== 'cards') {
      return (
        <div className="questionnaire-null-catchup questionnaire-null-catchup--center">
          <h1 className="questionnaire-null-catchup__brand">{FITPRINT_CATCHUP_HEADING}</h1>
          <p className="questionnaire-null-catchup__text">Loading questions…</p>
        </div>
      );
    }
    const { questions: nullQs } = snap;
    return (
      <HealthAssessmentScenario2Category
        key="fitprint-lifestyle-habits"
        routeId="lifestyle-habits"
        questions={nullQs}
        draftResponses={swipeDraftResponses}
        assessmentInstanceId={swipeAssessmentInstanceId}
        categoryId={swipeCategoryId}
        headingOverride={FITPRINT_CATCHUP_HEADING}
        onBack={onBack}
        onStepDraftSave={async (routeId, responses) => {
          await persistCategoryResponses(routeId, responses);
        }}
        onStepComplete={async (routeId, responses) => {
          await handleRouteDone(routeId, responses);
        }}
      />
    );
  }

  if (currentSwipeRoute === 'nutrition-log') {
    const snap = catchupRouteSnapshots['nutrition-log'];
    if (!snap || snap.kind !== 'cards') {
      return (
        <div className="questionnaire-null-catchup questionnaire-null-catchup--center">
          <h1 className="questionnaire-null-catchup__brand">{FITPRINT_CATCHUP_HEADING}</h1>
          <p className="questionnaire-null-catchup__text">Loading questions…</p>
        </div>
      );
    }
    const { questions: nullQs } = snap;
    return (
      <HealthAssessmentScenario2Category
        key="fitprint-nutrition-log"
        routeId="nutrition-log"
        questions={nullQs}
        draftResponses={swipeDraftResponses}
        assessmentInstanceId={swipeAssessmentInstanceId}
        categoryId={swipeCategoryId}
        headingOverride={FITPRINT_CATCHUP_HEADING}
        onBack={onBack}
        onStepDraftSave={async (routeId, responses) => {
          await persistCategoryResponses(routeId, responses);
        }}
        onStepComplete={async (routeId, responses) => {
          await handleRouteDone(routeId, responses);
        }}
      />
    );
  }

  if (currentSwipeRoute === 'vitals') {
    const snap = catchupRouteSnapshots.vitals;
    if (!snap || snap.kind !== 'vitals') {
      return (
        <div className="questionnaire-null-catchup questionnaire-null-catchup--center">
          <h1 className="questionnaire-null-catchup__brand">{FITPRINT_CATCHUP_HEADING}</h1>
          <p className="questionnaire-null-catchup__text">Loading questions…</p>
        </div>
      );
    }
    const { questions: nullQs, initialValues: vitalsFrozenInitial } = snap;
    return (
      <HealthAssessmentScenario2Category
        key="fitprint-vitals"
        routeId="vitals"
        questions={nullQs}
        draftResponses={swipeDraftResponses}
        assessmentInstanceId={swipeAssessmentInstanceId}
        categoryId={swipeCategoryId}
        vitalsInitial={vitalsFrozenInitial}
        buildVitalsResponses={buildVitalsResponses}
        headingOverride={FITPRINT_CATCHUP_HEADING}
        onBack={onBack}
        onStepComplete={async (routeId, responses) => {
          await handleRouteDone(routeId, responses);
        }}
      />
    );
  }

  if (anthroPhase === 'done' && swipeRoutes.length === 0) {
    return (
      <div className="questionnaire-null-catchup questionnaire-null-catchup--center">
        <h1 className="questionnaire-null-catchup__brand">{FITPRINT_CATCHUP_HEADING}</h1>
        <p className="questionnaire-null-catchup__text">You&apos;re all caught up.</p>
        <button
          type="button"
          className="questionnaire-null-catchup__btn"
          onClick={finishAll}
          disabled={isFinalizing}
        >
          {isFinalizing ? 'Submitting…' : 'Continue'}
        </button>
      </div>
    );
  }

  return null;
};

export default QuestionnaireNullCatchupPage;
