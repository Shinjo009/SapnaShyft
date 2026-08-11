import { ContinueButton } from './ContinueButton'
import { SectionCompleteCelebration } from './SectionCompleteCelebration'
import {
  ASSESSMENT_CARD_STACK_CLASS,
  ASSESSMENT_FIVE_CARD_STACK_CLASS,
  ASSESSMENT_SUBTITLE_CLASS,
  PAGE_GUTTER_X,
} from './mcq/mcqLayout'
import assessmentRadioImg from '../assets/Ellipse 13077.svg'
import hourglassIcon from '../assets/Group.svg'
import heartRateIcon from '../assets/figma/heart-rate-assessment.svg'
import {
  categoryDescriptionForKey,
  hasAnthropometryAndVitals,
  introShortLabelForCategory,
  type AssessmentCategoryStatus,
} from '../api/assessments'

function AssessmentCard({
  title,
  description,
  featured,
  compact,
}: {
  title: string
  description?: string
  featured: boolean
  compact?: boolean
}) {
  const radioClass = compact ? 'size-[14px] shrink-0' : 'size-[15px] shrink-0'

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

/** Health Assessment intro — 3-section (heart icon) or 5-section (gauge + Anthro/Vitals). */
export function HealthAssessmentStep({
  categories,
  onStartAssessment,
  isStarting = false,
}: {
  categories: AssessmentCategoryStatus[]
  onStartAssessment?: () => void
  isStarting?: boolean
}) {
  const fiveSection = hasAnthropometryAndVitals(categories)
  const sections = categories.map((category, index) => {
    const key = String(category.category_key || '').trim().toLowerCase()
    return {
      id: String(category.id || category.category_id || key || index),
      title: category.display_name || category.category_key || 'Assessment',
      description: categoryDescriptionForKey(key),
      featured: index === 0,
    }
  })
  const introMilestones = categories.map((category) => introShortLabelForCategory(category))

  const startButton = (
    <ContinueButton
      variant="mobileBar"
      className={`w-full border border-[#969696] shadow-[0_12px_20px_rgba(255,255,255,0.15)] ${
        fiveSection ? '!h-12' : '!h-[52px] mt-auto'
      }`}
      showChevron={false}
      disabled={isStarting || categories.length === 0}
      onClick={onStartAssessment}
    >
      {isStarting ? 'Loading...' : 'Start Assessment'}
    </ContinueButton>
  )

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col">
      <div className={fiveSection ? 'h-12 shrink-0' : 'h-[74px] shrink-0'} aria-hidden />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [overflow-clip-margin:12px]">
          <div
            className={`flex w-full flex-col ${PAGE_GUTTER_X} ${
              fiveSection ? 'gap-5 pb-4 pt-2' : 'gap-10 pb-6 pt-8'
            }`}
          >
            <div className="flex w-full flex-col items-center">
              {fiveSection ? (
                <SectionCompleteCelebration tone="intro" milestones={introMilestones} />
              ) : (
                <div className="mb-6 flex size-14 items-center justify-center rounded-xl border border-[rgba(222,144,223,0.5)] p-px shadow-[0_4px_12px_0_rgba(16,185,129,0.1)]">
                  <img src={heartRateIcon} alt="" className="size-7" aria-hidden />
                </div>
              )}

              <div className={`flex w-full flex-col items-center pb-3 ${fiveSection ? 'mt-1' : ''}`}>
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

            <div className={fiveSection ? ASSESSMENT_FIVE_CARD_STACK_CLASS : ASSESSMENT_CARD_STACK_CLASS}>
              {sections.map((section) => (
                <AssessmentCard
                  key={section.id}
                  title={section.title}
                  description={section.featured ? section.description : undefined}
                  featured={section.featured}
                  compact={fiveSection}
                />
              ))}
            </div>

            {fiveSection ? null : startButton}
          </div>
        </div>

        {fiveSection ? <div className={`shrink-0 pb-4 ${PAGE_GUTTER_X}`}>{startButton}</div> : null}
      </div>
    </div>
  )
}
