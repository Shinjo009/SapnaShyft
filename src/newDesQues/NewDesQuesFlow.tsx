import { useCallback, useEffect, useState } from 'react'
import {
  isCategoryCompleted,
  loadAssessmentCategoriesForStep2,
  normalizeCategoryKey,
  submitCompletedAssessmentFlow,
  type AssessmentCategoryStatus,
} from './api/assessments'
import {
  getCategoryQuestionnaire,
  type QuestionnaireQuestion,
} from './api/questionnaire'
import { ApiQuestionnaireStep } from './components/ApiQuestionnaireStep'
import { HealthAssessmentStep } from './components/HealthAssessmentStep'
import { PageBackdrop } from './components/PageBackdrop'
import {
  SectionCompleteHub,
  type SectionCompleteVariant,
} from './components/SectionCompleteHub'
import { getAccessToken } from './lib/authStorage'
import { isFrontendOnly } from './lib/frontendOnly'
import { getMockQuestionnaireQuestions } from './data/mockApiQuestionnaires'
import backgroundAssessmentSvg from './assets/Background.svg'
import nutritionEndBackgroundSvg from './assets/nutritionend.svg'
import nutritionLogBackgroundSvg from './assets/nutritionlogstart.svg'
import familyHistoryBackgroundSvg from './assets/family history.svg'
import lifestyleHabitsBackgroundSvg from './assets/lifestyle-habits/background.svg'

type Step = 6 | 7 | 8 | 10 | 12 | 'done'

type Props = {
  onBack: () => void
}

const hubStepForVariant = (variant: SectionCompleteVariant): Step => {
  if (variant === 'lifestyle') return 10
  if (variant === 'nutrition') return 12
  return 8
}

const variantForCategory = (category: AssessmentCategoryStatus): SectionCompleteVariant => {
  const key = normalizeCategoryKey(category.category_key)
  if (key.includes('lifestyle')) return 'lifestyle'
  if (key.includes('nutrition')) return 'nutrition'
  return 'family'
}

/**
 * Mirrors BookAppointment steps 6 → 7 → 8/10/12 for the three redesigned sections
 * (Family History, Lifestyle & Habits, Nutrition Log). Does not include Anthropometry/Vitals.
 */
export function NewDesQuesFlow({ onBack }: Props) {
  const [step, setStep] = useState<Step>(6)
  const [assessmentInstanceId, setAssessmentInstanceId] = useState<number | null>(null)
  const [assessmentCategories, setAssessmentCategories] = useState<AssessmentCategoryStatus[]>([])
  const [completedCategoryIds, setCompletedCategoryIds] = useState<number[]>([])
  const [activeCategory, setActiveCategory] = useState<AssessmentCategoryStatus | null>(null)
  const [categoryQuestions, setCategoryQuestions] = useState<QuestionnaireQuestion[]>([])
  const [questionnaireReturnStep, setQuestionnaireReturnStep] = useState<Step>(6)
  const [hubVariant, setHubVariant] = useState<SectionCompleteVariant>('family')
  const [isBootstrapping, setIsBootstrapping] = useState(true)
  const [isLoadingQuestionnaire, setIsLoadingQuestionnaire] = useState(false)
  const [loadingCategoryId, setLoadingCategoryId] = useState<number | null>(null)
  const [isSubmittingAssessment, setIsSubmittingAssessment] = useState(false)
  const [uiError, setUiError] = useState('')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setIsBootstrapping(true)
      setUiError('')
      try {
        const accessToken = getAccessToken() || ''
        const result = await loadAssessmentCategoriesForStep2(accessToken)
        if (cancelled) return
        setAssessmentInstanceId(result.assessmentInstanceId)
        setAssessmentCategories(result.categories)
        setCompletedCategoryIds(
          result.categories
            .filter((category) => isCategoryCompleted(category, []))
            .map((category) => Number(category.category_id)),
        )
        setStep(6)
      } catch (error) {
        if (!cancelled) {
          setUiError(
            error instanceof Error ? error.message : 'Unable to load health assessment categories.',
          )
        }
      } finally {
        if (!cancelled) setIsBootstrapping(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const handleLoadCategory = useCallback(
    async (category: AssessmentCategoryStatus, options?: { returnStep?: Step }) => {
      if (isLoadingQuestionnaire) return

      const categoryId = Number(category.category_id || 0)
      if (!assessmentInstanceId || categoryId <= 0) {
        setUiError('Assessment category is missing.')
        return
      }

      setUiError('')
      setIsLoadingQuestionnaire(true)
      setLoadingCategoryId(categoryId)
      setQuestionnaireReturnStep(options?.returnStep ?? hubStepForVariant(hubVariant))

      try {
        if (isFrontendOnly()) {
          const questions = getMockQuestionnaireQuestions(category.category_key)
          if (questions.length === 0) {
            throw new Error('No mock questions available for this category yet.')
          }
          setActiveCategory(category)
          setCategoryQuestions(questions)
          setStep(7)
          return
        }

        const accessToken = getAccessToken() || ''
        const questionnaire = await getCategoryQuestionnaire(
          accessToken,
          assessmentInstanceId,
          categoryId,
        )
        const questions = questionnaire.questions
        if (!Array.isArray(questions) || questions.length === 0) {
          throw new Error('No questions returned for this category.')
        }
        setActiveCategory(category)
        setCategoryQuestions(questions)
        setStep(7)
      } catch (error) {
        setUiError(error instanceof Error ? error.message : 'Unable to load questionnaire.')
      } finally {
        setIsLoadingQuestionnaire(false)
        setLoadingCategoryId(null)
      }
    },
    [assessmentInstanceId, hubVariant, isLoadingQuestionnaire],
  )

  const handleStartAssessment = async () => {
    const nextCategory =
      assessmentCategories.find((category) => !isCategoryCompleted(category, completedCategoryIds)) ||
      assessmentCategories[0]

    if (!nextCategory) {
      setUiError('Assessment category is missing.')
      return
    }

    await handleLoadCategory(nextCategory, { returnStep: 6 })
  }

  const handleCategoryQuestionnaireComplete = () => {
    if (!activeCategory) {
      setStep(8)
      return
    }

    const categoryId = Number(activeCategory.category_id)
    setCompletedCategoryIds((prev) =>
      prev.includes(categoryId) ? prev : [...prev, categoryId],
    )

    const variant = variantForCategory(activeCategory)
    setHubVariant(variant)
    setStep(hubStepForVariant(variant))
  }

  const handleSubmitCompletedAssessment = async () => {
    if (isSubmittingAssessment) return
    if (!assessmentInstanceId) {
      setStep('done')
      return
    }

    setUiError('')
    setIsSubmittingAssessment(true)
    try {
      const accessToken = getAccessToken() || ''
      await submitCompletedAssessmentFlow(accessToken, assessmentInstanceId)
      setStep('done')
    } catch (error) {
      setUiError(error instanceof Error ? error.message : 'Unable to submit assessment.')
    } finally {
      setIsSubmittingAssessment(false)
    }
  }

  const activeCategoryKey = normalizeCategoryKey(activeCategory?.category_key || '')
  const questionnaireBackground = activeCategoryKey.includes('lifestyle')
    ? lifestyleHabitsBackgroundSvg
    : activeCategoryKey.includes('nutrition')
      ? nutritionLogBackgroundSvg
      : familyHistoryBackgroundSvg

  const backdropSrc =
    step === 6 || step === 8
      ? backgroundAssessmentSvg
      : step === 10
        ? nutritionEndBackgroundSvg
        : step === 12 || step === 'done'
          ? nutritionLogBackgroundSvg
          : step === 7
            ? questionnaireBackground
            : undefined

  if (isBootstrapping) {
    return (
      <PageBackdrop mobileBackgroundSrc={backgroundAssessmentSvg}>
        <div className="flex h-full min-w-0 flex-col items-center justify-center gap-4 px-6">
          <p className="text-center text-[14px] text-[#ccc]">Loading NewDesQues…</p>
          <button
            type="button"
            onClick={onBack}
            className="text-[13px] text-[#9a9a9a] underline"
          >
            Back to Profile
          </button>
        </div>
      </PageBackdrop>
    )
  }

  if (uiError && assessmentCategories.length === 0) {
    return (
      <PageBackdrop mobileBackgroundSrc={backgroundAssessmentSvg}>
        <div className="flex h-full min-w-0 flex-col items-center justify-center gap-4 px-6">
          <p className="text-center text-[14px] text-[#f5a9a9]">{uiError}</p>
          <button
            type="button"
            onClick={onBack}
            className="rounded-full border border-[#969696] px-5 py-2 text-[13px] text-white"
          >
            Back to Profile
          </button>
        </div>
      </PageBackdrop>
    )
  }

  if (step === 'done') {
    return (
      <PageBackdrop mobileBackgroundSrc={nutritionLogBackgroundSvg}>
        <div className="flex h-full min-w-0 flex-col items-center justify-center gap-6 px-6">
          <h2 className="text-center text-[18px] font-semibold tracking-[0.2px] text-white">
            Questionnaire complete
          </h2>
          <p className="text-center text-[12px] leading-4 text-[#9a9a9a]">
            This is a design preview only. Production Health Assessment is unchanged.
          </p>
          <button
            type="button"
            onClick={onBack}
            className="inline-flex h-[46px] w-full max-w-[320px] items-center justify-center rounded-[36px] bg-gradient-to-r from-[#296359] to-[#41ab99] text-[14px] font-semibold text-white"
          >
            Back to Profile
          </button>
        </div>
      </PageBackdrop>
    )
  }

  return (
    <PageBackdrop mobileBackgroundSrc={backdropSrc}>
      <div className="flex h-full min-w-0 flex-col">
        {step === 6 ? (
          <div className="absolute left-5 top-5 z-10">
            <button
              type="button"
              onClick={onBack}
              className="flex size-8 items-center justify-start text-white"
              aria-label="Back to Profile"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M19 12H5M5 12L12 19M5 12L12 5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        ) : null}

        {uiError ? (
          <p className="shrink-0 px-6 pt-3 text-center text-[12px] text-[#f5a9a9]">{uiError}</p>
        ) : null}

        {step === 6 && (
          <HealthAssessmentStep
            categories={assessmentCategories}
            isStarting={isLoadingQuestionnaire}
            onStartAssessment={handleStartAssessment}
          />
        )}

        {step === 7 && activeCategory && categoryQuestions.length > 0 ? (
          <ApiQuestionnaireStep
            title={activeCategory.display_name || 'Assessment'}
            questions={categoryQuestions}
            assessmentInstanceId={assessmentInstanceId ?? 1}
            categoryId={Number(activeCategory.category_id)}
            theme={
              normalizeCategoryKey(activeCategory.category_key).includes('lifestyle')
                ? 'lifestyle'
                : normalizeCategoryKey(activeCategory.category_key).includes('nutrition')
                  ? 'nutrition'
                  : 'family'
            }
            onBack={() => setStep(questionnaireReturnStep)}
            onComplete={handleCategoryQuestionnaireComplete}
          />
        ) : null}

        {(step === 8 || step === 10 || step === 12) && (
          <SectionCompleteHub
            variant={step === 8 ? 'family' : step === 10 ? 'lifestyle' : 'nutrition'}
            categories={assessmentCategories}
            completedCategoryIds={completedCategoryIds}
            isLoadingCategoryId={loadingCategoryId}
            isContinuing={isSubmittingAssessment}
            onSelectCategory={(category) =>
              handleLoadCategory(category, { returnStep: step })
            }
            onContinue={step === 12 ? handleSubmitCompletedAssessment : undefined}
          />
        )}
      </div>
    </PageBackdrop>
  )
}

export default NewDesQuesFlow
