import React, { useEffect, useState, useRef } from 'react'
import { ApiQuestionnaireStep } from '../../newDesQues/components/ApiQuestionnaireStep'
import { AnthropometryStep } from '../../newDesQues/components/anthropometry/AnthropometryStep'
import { VitalsStep } from '../../newDesQues/components/vitals/VitalsStep'
import { buildQuestionnaireResponses } from '../../newDesQues/api/questionnaire'
import { PageBackdrop } from '../../newDesQues/components/PageBackdrop'
import backgroundAssessmentSvg from '../../newDesQues/assets/Background.svg'
import familyHistoryBackgroundSvg from '../../newDesQues/assets/family history.svg'
import lifestyleHabitsBackgroundSvg from '../../newDesQues/assets/lifestyle-habits/background.svg'
import nutritionLogBackgroundSvg from '../../newDesQues/assets/nutritionlogstart.svg'

const ROUTE_THEME = {
  'family-history': 'family',
  'lifestyle-habits': 'lifestyle',
  'nutrition-log': 'nutrition',
}

const ROUTE_TITLE = {
  anthropometry: 'Anthropometry',
  'family-history': 'Family History',
  'lifestyle-habits': 'Lifestyle & Habits',
  'nutrition-log': 'Nutrition Log',
  vitals: 'Vitals',
}

const ROUTE_BACKDROP = {
  anthropometry: backgroundAssessmentSvg,
  'family-history': familyHistoryBackgroundSvg,
  'lifestyle-habits': lifestyleHabitsBackgroundSvg,
  'nutrition-log': nutritionLogBackgroundSvg,
  vitals: backgroundAssessmentSvg,
}

/**
 * Merge draft `{ question_id, answer }` rows onto API questions so Scenario 2
 * seedAnswersFromQuestions restores prior progress.
 */
export function applyDraftResponsesToQuestions(questions = [], responses = []) {
  if (!Array.isArray(questions) || questions.length === 0) {
    return []
  }
  if (!Array.isArray(responses) || responses.length === 0) {
    return questions
  }

  const byId = new Map()
  responses.forEach((item) => {
    const questionId = Number(item?.question_id)
    if (!Number.isFinite(questionId) || questionId <= 0) {
      return
    }
    if (item?.answer == null) {
      return
    }
    byId.set(questionId, item.answer)
  })

  if (byId.size === 0) {
    return questions
  }

  return questions.map((question) => {
    const questionId = Number(question?.question_id)
    if (!byId.has(questionId)) {
      return question
    }
    return {
      ...question,
      answer: byId.get(questionId),
    }
  })
}

/**
 * Scenario 2 category UI for Health Assessment — same save/complete contracts as
 * the old Embedded* pages (onStepDraftSave / onStepComplete response arrays).
 */
export default function HealthAssessmentScenario2Category({
  routeId,
  questions = [],
  draftResponses = [],
  assessmentInstanceId = 0,
  categoryId = 0,
  anthropometryPrimary = {},
  anthropometryFollowup = {},
  vitalsInitial = {},
  buildAnthropometryResponses,
  buildVitalsResponses,
  headingOverride,
  anthropometryInitialIndex = 0,
  onBack,
  onStepDraftSave,
  onStepComplete,
}) {
  /**
   * Seed drafts once when questions first arrive. Do not re-merge after each autosave —
   * that rebuilt the questions prop and reset progress (stuck on question 2).
   */
  const seededIdentityRef = useRef('')
  const [seededQuestions, setSeededQuestions] = useState(() =>
    applyDraftResponsesToQuestions(questions, draftResponses),
  )

  useEffect(() => {
    if (!Array.isArray(questions) || questions.length === 0) return

    const identity = questions
      .map((item) => Number(item?.question_id) || 0)
      .filter((id) => id > 0)
      .join(',')
    if (!identity) return

    // First load, or the category's question set actually changed.
    if (seededIdentityRef.current === identity) return

    seededIdentityRef.current = identity
    setSeededQuestions(applyDraftResponsesToQuestions(questions, draftResponses))
  }, [questions, draftResponses])

  const backdropSrc = ROUTE_BACKDROP[routeId] || backgroundAssessmentSvg
  const title = headingOverride || ROUTE_TITLE[routeId] || 'Assessment'

  if (routeId === 'anthropometry') {
    return (
      <PageBackdrop mobileBackgroundSrc={backdropSrc}>
        <AnthropometryStep
          title={title}
          questions={seededQuestions}
          initialPrimary={anthropometryPrimary}
          initialFollowup={anthropometryFollowup}
          initialIndex={anthropometryInitialIndex}
          onBack={onBack}
          onComplete={({ primary, followup }) => {
            const responses = typeof buildAnthropometryResponses === 'function'
              ? buildAnthropometryResponses(seededQuestions, primary || {}, followup || {})
              : []
            onStepComplete?.(routeId, responses, { primary, followup })
          }}
        />
      </PageBackdrop>
    )
  }

  if (routeId === 'vitals') {
    return (
      <PageBackdrop mobileBackgroundSrc={backdropSrc}>
        <VitalsStep
          questions={seededQuestions}
          initialValues={vitalsInitial}
          title={title}
          onBack={onBack}
          onComplete={(values) => {
            const responses = typeof buildVitalsResponses === 'function'
              ? buildVitalsResponses(seededQuestions, values || {})
              : []
            onStepComplete?.(routeId, responses, { vitals: values })
          }}
        />
      </PageBackdrop>
    )
  }

  const theme = ROUTE_THEME[routeId] || 'family'

  return (
    <PageBackdrop mobileBackgroundSrc={backdropSrc}>
      <ApiQuestionnaireStep
        title={title}
        questions={seededQuestions}
        assessmentInstanceId={assessmentInstanceId > 0 ? assessmentInstanceId : 1}
        categoryId={categoryId > 0 ? categoryId : 1}
        theme={theme}
        onBack={onBack}
        onPersistResponses={async (responses) => {
          await onStepDraftSave?.(routeId, responses)
        }}
        onComplete={(answersById) => {
          const responses = buildQuestionnaireResponses(answersById || {})
          onStepComplete?.(routeId, responses)
        }}
      />
    </PageBackdrop>
  )
}
