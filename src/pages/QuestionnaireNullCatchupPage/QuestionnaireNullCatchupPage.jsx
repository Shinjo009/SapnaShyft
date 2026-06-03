import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import './QuestionnaireNullCatchupPage.css';
import {
  EmbeddedAnthropometryPage,
  EmbeddedAnthropometryFollowupPage,
  EmbeddedFamilyHistoryPage,
  EmbeddedLifestyleHabitsPage,
  EmbeddedNutritionLogPage,
  EmbeddedVitalsPage,
  buildAnthropometryInitialValuesFromResponses,
  buildAnthropometryResponses,
  buildNutritionLogResponsesForSave,
  buildResponsesFromSelections,
  buildSelectionStateFromResponses,
  buildVitalsInitialValuesFromResponses,
  buildVitalsResponses,
  findMappedOtherTextQuestion,
  isLikelyOtherTextQuestion,
  normalizeStoredVitalReading,
  toNutritionApiCards,
  toFamilyApiCards,
  findFamilyHistoryCardKeys,
  isNoneOptionLabel,
} from '../HealthAssessmentPage/HealthAssessmentPage';
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

/** Vitals: unfilled-only (no other-text card pipeline). Falls back to full list if none. */
const questionsNullOnlyOrAll = (allQuestions, rawResponses) => {
  const list = Array.isArray(allQuestions) ? allQuestions : [];
  const filtered = list.filter((q) => questionIsUnfilled(q, rawResponses));
  return filtered.length > 0 ? filtered : list;
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

const routesWithAnyUnfilled = (categories, questionsByRoute, responsesByCategoryId) => (
  SWIPE_ROUTE_ORDER.filter((routeId) => {
    if (!hasCategoriesForRoute(categories, routeId)) {
      return false;
    }
    const qs = questionsByRoute[routeId] || [];
    const raw = mergeResponsesForRoute(categories, responsesByCategoryId, routeId);
    if (routeId === 'family-history') {
      return qs.some((q) => familyQuestionBlocksCatchup(qs, raw, q));
    }
    return qs.some((q) => questionIsUnfilled(q, raw));
  })
);

/**
 * FitPrint gap flow: complete missing questionnaire answers on the latest Basic/Pro assessment.
 * Anthropometry first (primary then follow-up when needed), then remaining categories in order
 * (family → lifestyle → nutrition → vitals). Each swipe section snapshots unanswered questions once
 * when you land on it (order preserved, deck does not shrink while answering). Responses are saved
 * only when you tap Done on that section (no draft PUTs while swiping between cards).
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
  const [responsesByCategoryId, setResponsesByCategoryId] = useState({});
  const responsesMapRef = useRef({});

  const [anthroPhase, setAnthroPhase] = useState(null);
  const [anthroPrimaryValues, setAnthroPrimaryValues] = useState({});
  const [anthroFollowupValues, setAnthroFollowupValues] = useState({});
  const [showAnthroFollowup, setShowAnthroFollowup] = useState(false);

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

    const routeQuestions = questionsByRoute[routeId] || [];
    const partition = new Map();
    incoming.forEach((row) => {
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

    if (incoming.length === 0) {
      return nextMap;
    }

    if (partition.size > 0) {
      for (const [catIdNum, rows] of partition) {
        const cid = String(catIdNum);
        const prev = nextMap[cid] || [];
        const merged = mergeResponsesByQuestionId(prev, rows);
        if (rows.length > 0) {
          const targetInstanceId = resolveInstanceIdForCategoryId(catIdNum);
          await submitQuestionnaireResponses(targetInstanceId, catIdNum, merged);
        }
        nextMap = { ...nextMap, [cid]: merged };
      }
    } else if (fallbackCat) {
      const cid = String(fallbackCat.category_id || '');
      const prev = nextMap[cid] || [];
      const merged = mergeResponsesByQuestionId(prev, incoming);
      const fallbackCategoryId = Number(fallbackCat.category_id);
      const targetInstanceId = resolveInstanceIdForCategoryId(fallbackCategoryId);
      await submitQuestionnaireResponses(targetInstanceId, fallbackCategoryId, merged);
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
  }, [categories, instanceId, questionsByRoute]);

  const recomputeSwipeFromMap = useCallback((responsesMap) => {
    const qRoute = buildQuestionsByRoute(categories, questionsByCategoryId);
    const next = routesWithAnyUnfilled(categories, qRoute, responsesMap);
    setSwipeRoutes(next);
    return next;
  }, [categories, questionsByCategoryId]);

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
    const raw = mergeResponsesForRoute(categories, responsesMapRef.current, 'family-history');
    const nullQs = expandCatchupQuestionsForCardBundles(
      qs,
      raw,
      (q, list, r) => familyQuestionBlocksCatchup(list, r, q),
    );
    const initialSelections = buildSelectionStateFromResponses(qs, raw);
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
  }, [loadState, swipeRoutes, categories, questionsByRoute, responsesByCategoryId, finishAll]);

  /** Snapshot unanswered questions once per route visit so the deck stays stable until Done (no live refilter). */
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
      const raw = mergeResponsesForRoute(categories, responsesMapRef.current, route);
      const selectionsForVisibility = buildSelectionStateFromResponses(qs, raw);
      const visibleQs = computeQuestionsWithVisibility(qs, {
        selections: selectionsForVisibility,
        preferences: questionnairePreferences,
      }).filter((q) => q.is_visible !== false);

      if (route === 'vitals') {
        const questions = questionsNullOnlyOrAll(visibleQs, raw);
        const vitalsInitial = buildVitalsInitialValuesFromResponses(qs, raw);
        return {
          ...prev,
          [route]: {
            kind: 'vitals',
            questions,
            initialValues: {
              systolic: vitalsInitial.systolic,
              diastolic: vitalsInitial.diastolic,
            },
          },
        };
      }

      const unfilledPred = route === 'family-history'
        ? (q, list, r) => familyQuestionBlocksCatchup(list, r, q)
        : (q, _list, r) => questionIsUnfilled(q, r);
      const questions = expandCatchupQuestionsForCardBundles(visibleQs, raw, unfilledPred);
      const initialSelections = buildSelectionStateFromResponses(visibleQs, raw);
      return {
        ...prev,
        [route]: { kind: 'cards', questions, initialSelections },
      };
    });
  }, [loadState, swipeRoutes, categories, questionsByRoute, questionnairePreferences]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadState('loading');
      setLoadError(null);
      setCatchupRouteSnapshots({});
      try {
        const ctx = await loadQuestionnaireContextForAssessmentInstance(instanceId);
        if (cancelled) {
          return;
        }
        const cats = ctx?.categories || [];
        const qBy = ctx?.questionsByCategoryId || {};
        const rBy = { ...(ctx?.responsesByCategoryId || {}) };
        setCategories(cats);
        setQuestionsByCategoryId(qBy);
        setResponsesByCategoryId(rBy);
        responsesMapRef.current = rBy;

        const qRoute = buildQuestionsByRoute(cats, qBy);
        const anthQ = qRoute['anthropometry'] || [];
        const anthRaw = mergeResponsesForRoute(cats, rBy, 'anthropometry');

        const primaryOpen = anthropometryPrimaryHasUnfilled(anthQ, anthRaw);
        const followOpen = anthropometryFollowupHasUnfilled(anthQ, anthRaw);
        const init = buildAnthropometryInitialValuesFromResponses(anthQ, anthRaw);

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

        const swipe = routesWithAnyUnfilled(cats, qRoute, rBy);
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
            {isFinalizing ? 'Submitting questionnaire…' : 'Loading questionnaire…'}
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

  if (anthroPhase === 'primary') {
    return (
      <EmbeddedAnthropometryPage
        questions={anthroQuestions}
        initialValues={anthroPrimaryValues}
        categoryHeading={FITPRINT_CATCHUP_HEADING}
        onBack={onBack}
        onContinue={(values) => {
          setAnthroPrimaryValues(values || {});
          const raw = mergeResponsesForRoute(categories, responsesMapRef.current, 'anthropometry');
          if (anthropometryFollowupHasUnfilled(anthroQuestions, raw)) {
            setShowAnthroFollowup(true);
            setAnthroPhase('followup_after_primary');
          } else {
            void saveAnthropometryAndContinue(values || {}, anthroFollowupValues);
          }
        }}
      />
    );
  }

  if (anthroPhase === 'followup_after_primary' && showAnthroFollowup) {
    return (
      <EmbeddedAnthropometryFollowupPage
        questions={anthroQuestions}
        initialValues={anthroFollowupValues}
        categoryHeading={FITPRINT_CATCHUP_HEADING}
        onBack={() => {
          setShowAnthroFollowup(false);
          setAnthroPhase('primary');
        }}
        onDone={(followupVals) => {
          setAnthroFollowupValues(followupVals || {});
          void saveAnthropometryAndContinue(anthroPrimaryValues, followupVals || {});
        }}
      />
    );
  }

  if (anthroPhase === 'followup_only' && showAnthroFollowup) {
    return (
      <EmbeddedAnthropometryFollowupPage
        questions={anthroQuestions}
        initialValues={anthroFollowupValues}
        categoryHeading={FITPRINT_CATCHUP_HEADING}
        onBack={onBack}
        onDone={(followupVals) => {
          setAnthroFollowupValues(followupVals || {});
          void saveAnthropometryAndContinue(anthroPrimaryValues, followupVals || {});
        }}
      />
    );
  }

  const currentSwipeRoute = swipeRoutes[0] || null;

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
    const { questions: nullQs, initialSelections } = snap;
    return (
      <EmbeddedFamilyHistoryPage
        questions={questionsByRoute['family-history'] || []}
        questionnairePreferences={questionnairePreferences}
        initialSelections={initialSelections}
        categoryHeading={FITPRINT_CATCHUP_HEADING}
        onBack={onBack}
        onDone={(selections) => {
          void (async () => {
            try {
              if (familyVisibleCardCount(nullQs, selections || {}) === 0) {
                const nextRoutes = swipeRoutes[0] === 'family-history'
                  ? swipeRoutes.slice(1)
                  : swipeRoutes.filter((r) => r !== 'family-history');
                setSwipeRoutes(nextRoutes);
                if (nextRoutes.length === 0) {
                  await finalizeAndExit();
                }
                return;
              }
              const responses = buildResponsesFromSelections(
                questionsByRoute['family-history'] || [],
                selections || {},
                questionnairePreferences,
              );
              await handleRouteDone('family-history', responses);
            } catch (error) {
              reportCatchupError(error);
            }
          })();
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
    const { initialSelections } = snap;
    return (
      <EmbeddedLifestyleHabitsPage
        questions={questionsByRoute['lifestyle-habits'] || []}
        questionnairePreferences={questionnairePreferences}
        initialSelections={initialSelections}
        categoryHeading={FITPRINT_CATCHUP_HEADING}
        onBack={onBack}
        onDone={(selections) => {
          const responses = buildResponsesFromSelections(
            questionsByRoute['lifestyle-habits'] || [],
            selections || {},
            questionnairePreferences,
          );
          void handleRouteDone('lifestyle-habits', responses);
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
    const { initialSelections } = snap;
    return (
      <EmbeddedNutritionLogPage
        questions={questionsByRoute['nutrition-log'] || []}
        questionnairePreferences={questionnairePreferences}
        initialSelections={initialSelections}
        categoryHeading={FITPRINT_CATCHUP_HEADING}
        onBack={onBack}
        onDone={(selections) => {
          const routeQs = questionsByRoute['nutrition-log'] || [];
          const visibleQs = computeQuestionsWithVisibility(routeQs, {
            selections: selections || {},
            preferences: questionnairePreferences,
          }).filter((q) => q.is_visible !== false);
          const cardsForSave = visibleQs.length > 0 ? toNutritionApiCards(visibleQs) : [];
          const responses = buildNutritionLogResponsesForSave(
            routeQs,
            selections || {},
            cardsForSave,
            questionnairePreferences,
          );
          void handleRouteDone('nutrition-log', responses);
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
      <EmbeddedVitalsPage
        questions={nullQs}
        initialValues={vitalsFrozenInitial}
        categoryHeading={FITPRINT_CATCHUP_HEADING}
        onBack={onBack}
        onDone={(values) => {
          const sanitized = {
            systolic: normalizeStoredVitalReading(values?.systolic),
            diastolic: normalizeStoredVitalReading(values?.diastolic),
          };
          const responses = buildVitalsResponses(nullQs, sanitized);
          void handleRouteDone('vitals', responses);
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
