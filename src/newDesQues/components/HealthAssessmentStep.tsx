import { ContinueButton } from './ContinueButton'
import {
  APP_COLUMN_MAX,
  ASSESSMENT_CARD_STACK_CLASS,
  ASSESSMENT_FIVE_CARD_STACK_CLASS,
  ASSESSMENT_SUBTITLE_CLASS,
  PAGE_GUTTER_X,
} from './mcq/mcqLayout'
import assessmentRadioImg from '../assets/Ellipse 13077.svg'
import tickCircleSolid from '../assets/figma/tick-circle-solid.svg'
import hourglassIcon from '../assets/Group.svg'
import heartRateIcon from '../assets/figma/heart-rate-assessment.svg'
import {
  categoryDescriptionForKey,
  hasAnthropometryAndVitals,
  isCategoryCompleted,
  type AssessmentCategoryStatus,
} from '../api/assessments'

function AssessmentCard({
  title,
  description,
  featured,
  compact,
  completed = false,
}: {
  title: string
  description?: string
  featured: boolean
  compact?: boolean
  completed?: boolean
}) {
  const radioClass = compact ? 'size-[14px] shrink-0' : 'size-[15px] shrink-0'

  if (completed) {
    return (
      <div
        className={[
          'flex w-full items-center rounded-xl border border-[rgba(218,193,90,0.5)] bg-white/5 shadow-[0_0_5px_0_rgba(218,193,90,0.2)]',
          compact ? 'p-3.5' : 'p-4',
        ].join(' ')}
      >
        <div className="flex min-w-0 items-center gap-1.5">
          <img src={tickCircleSolid} alt="" className={radioClass} aria-hidden />
          <span className="text-[14px] font-medium text-white">{title}</span>
        </div>
      </div>
    )
  }

  if (featured) {
    return (
      <div
        className={[
          'flex w-full flex-col gap-4 rounded-xl border border-[rgba(144,223,158,0.5)] bg-white/5 shadow-[0_0_10px_0_rgba(144,223,158,0.5)]',
          compact ? 'p-3.5' : 'p-4',
        ].join(' ')}
      >
        <div className="flex items-center gap-1.5">
          <img src={assessmentRadioImg} alt="" className={radioClass} aria-hidden />
          <span className="text-[14px] font-medium text-[#ccc]">{title}</span>
        </div>
        {description ? (
          <p
            className={
              compact
                ? 'text-[12px] font-normal leading-4 text-[#9a9a9a]'
                : 'text-[11px] font-normal leading-normal text-[#9a9a9a]'
            }
          >
            {description}
          </p>
        ) : null}
      </div>
    )
  }

  return (
    <div className={`flex w-full items-center rounded-xl bg-white/5 ${compact ? 'p-3.5' : 'p-[15px]'}`}>
      <div className="flex min-w-0 items-center gap-1.5">
        <img src={assessmentRadioImg} alt="" className={radioClass} aria-hidden />
        <span className="text-[14px] font-medium text-[#ccc]">{title}</span>
      </div>
    </div>
  )
}

/** Health Assessment intro — heart icon for all scenarios; pedals only on final complete. */
export function HealthAssessmentStep({
  categories,
  completedCategoryIds = [],
  onStartAssessment,
  isStarting = false,
}: {
  categories: AssessmentCategoryStatus[]
  completedCategoryIds?: number[]
  onStartAssessment?: () => void
  isStarting?: boolean
}) {
  const denseCards = hasAnthropometryAndVitals(categories) || categories.length >= 5
  const firstIncompleteIndex = categories.findIndex(
    (category) => !isCategoryCompleted(category, completedCategoryIds),
  )
  const sections = categories.map((category, index) => {
    const key = String(category.category_key || '').trim().toLowerCase()
    const completed = isCategoryCompleted(category, completedCategoryIds)
    return {
      id: String(category.id || category.category_id || key || index),
      title: category.display_name || category.category_key || 'Assessment',
      description: categoryDescriptionForKey(key),
      featured: !completed && index === (firstIncompleteIndex < 0 ? 0 : firstIncompleteIndex),
      completed,
    }
  })

  const buttonHeight = denseCards ? 48 : 52
  // Fixed 40px from screen bottom + button height + gap so scroll content clears the CTA.
  const scrollBottomPad = 40 + buttonHeight + 16

  return (
    <div className="relative flex min-h-0 w-full flex-1 flex-col">
      <div className={denseCards ? 'h-12 shrink-0' : 'h-[74px] shrink-0'} aria-hidden />

      <div
        className="flex min-h-0 flex-1 flex-col overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [overflow-clip-margin:12px]"
        style={{ paddingBottom: scrollBottomPad }}
      >
        <div
          className={`flex w-full flex-col ${PAGE_GUTTER_X} ${
            denseCards ? 'gap-5 pt-2' : 'gap-10 pt-8'
          }`}
        >
          <div className="flex w-full flex-col items-center">
            <div className="mb-6 flex size-14 items-center justify-center rounded-xl border border-[rgba(222,144,223,0.5)] p-px shadow-[0_4px_12px_0_rgba(16,185,129,0.1)]">
              <img src={heartRateIcon} alt="" className="size-7" aria-hidden />
            </div>

            <div className="flex w-full flex-col items-center pb-3">
              <h2 className="text-center text-[18px] font-semibold tracking-tight text-white">
                Health Assessment
              </h2>
              <p className={ASSESSMENT_SUBTITLE_CLASS}>
                Help our Bio-AI create a more personalized view of your lifestyle and health risks.
              </p>
            </div>

            <div className="flex items-center justify-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1">
              <img src={hourglassIcon} alt="" className="h-[11px] w-2.5" aria-hidden />
              <span className="text-center text-[12px] leading-4 text-[#90df9e]">Takes only 4 mins</span>
            </div>
          </div>

          <div className={denseCards ? ASSESSMENT_FIVE_CARD_STACK_CLASS : ASSESSMENT_CARD_STACK_CLASS}>
            {sections.map((section) => (
              <AssessmentCard
                key={section.id}
                title={section.title}
                description={section.featured ? section.description : undefined}
                featured={section.featured}
                completed={section.completed}
                compact={denseCards}
              />
            ))}
          </div>
        </div>
      </div>

      <div className={`pointer-events-none fixed inset-x-0 bottom-10 z-10 ${PAGE_GUTTER_X}`}>
        <div className={`pointer-events-auto mx-auto w-full ${APP_COLUMN_MAX}`}>
          <ContinueButton
            variant="mobileBar"
            className={`w-full border border-[#969696] shadow-[0_12px_20px_rgba(255,255,255,0.15)] ${
              denseCards ? '!h-12' : '!h-[52px]'
            }`}
            showChevron={false}
            disabled={isStarting || categories.length === 0}
            onClick={onStartAssessment}
          >
            {isStarting ? 'Loading...' : 'Start Assessment'}
          </ContinueButton>
        </div>
      </div>
    </div>
  )
}
