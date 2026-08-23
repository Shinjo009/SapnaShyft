import tickCircleSolid from '../assets/figma/tick-circle-solid.svg'
import assessmentRadioImg from '../assets/Ellipse 13077.svg'
import sectionSuccessGif from '../assets/animation-gif.gif'
import lifestyleSuccessGif from '../assets/animation-gif-lifestyle-orange.webp'
import nutritionSuccessGif from '../assets/animation-gif-nutrition-blue.webp'
import {
  categoryDescriptionForKey,
  isCategoryCompleted,
  normalizeCategoryKey,
  type AssessmentCategoryStatus,
} from '../api/assessments'
import { ContinueButton } from './ContinueButton'
import {
  ASSESSMENT_CARD_STACK_CLASS,
  ASSESSMENT_CONTENT_MAX_CLASS,
  ASSESSMENT_FIVE_CARD_STACK_CLASS,
  PAGE_GUTTER_X,
} from './mcq/mcqLayout'

export type SectionCompleteVariant =
  | 'anthropometry'
  | 'family'
  | 'lifestyle'
  | 'nutrition'
  | 'vitals'

const VARIANT_COPY: Record<SectionCompleteVariant, { title: string }> = {
  anthropometry: {
    title: 'Anthropometry Section Complete!',
  },
  family: {
    title: 'Family Section Complete!',
  },
  lifestyle: {
    title: 'Lifestyle Section Complete!',
  },
  nutrition: {
    title: 'Nutrition Section Complete!',
  },
  vitals: {
    title: 'Vitals Section Complete!',
  },
}

/** Family GIF reused for anthro + vitals until dedicated clips exist. */
const VARIANT_SUCCESS_GIF: Record<SectionCompleteVariant, string> = {
  anthropometry: sectionSuccessGif,
  family: sectionSuccessGif,
  lifestyle: lifestyleSuccessGif,
  nutrition: nutritionSuccessGif,
  vitals: sectionSuccessGif,
}

/** Shared section-complete hub — categories come from /assessments/{id}/status */
export function SectionCompleteHub({
  variant,
  categories,
  completedCategoryIds,
  onSelectCategory,
  canSelectCategory,
  onContinue,
  isLoadingCategoryId,
  isContinuing = false,
}: {
  variant: SectionCompleteVariant
  categories: AssessmentCategoryStatus[]
  completedCategoryIds: number[]
  onSelectCategory: (category: AssessmentCategoryStatus) => void
  canSelectCategory?: (category: AssessmentCategoryStatus) => boolean
  onContinue?: () => void
  isLoadingCategoryId?: number | null
  isContinuing?: boolean
}) {
  const copy = VARIANT_COPY[variant]
  const remaining = categories.filter(
    (category) => !isCategoryCompleted(category, completedCategoryIds),
  ).length
  const nextIncompleteId = categories.find(
    (category) => !isCategoryCompleted(category, completedCategoryIds),
  )?.category_id
  const allComplete = remaining === 0

  return (
    <div className="flex min-h-full w-full flex-1 flex-col overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [overflow-clip-margin:12px]">
      <div
        className={`flex w-full flex-col items-center gap-11 py-10 ${PAGE_GUTTER_X} ${
          allComplete ? 'mt-4 mb-auto' : 'my-auto'
        }`}
      >
        <div className="flex flex-col items-center gap-3">
          <img
            key={allComplete ? 'all' : variant}
            src={allComplete ? sectionSuccessGif : VARIANT_SUCCESS_GIF[variant]}
            alt=""
            draggable={false}
            className="mx-auto -mt-4 h-[176px] w-[176px] object-contain"
          />
          <div className="flex flex-col items-center gap-1 pb-1">
            <h2 className="text-center text-[18px] font-semibold tracking-[0.2px] text-white">
              {allComplete ? 'Assessment Complete!' : copy.title}
            </h2>
            {!allComplete ? (
              <p className="text-center text-[12px] leading-4 text-[#9a9a9a]">
                {remaining === 1 ? 'Only 1 more section left' : `Only ${remaining} more sections left`}
              </p>
            ) : null}
          </div>
        </div>

        <div className={categories.length >= 5 ? ASSESSMENT_FIVE_CARD_STACK_CLASS : ASSESSMENT_CARD_STACK_CLASS}>
          {categories.map((category) => {
            const completed = isCategoryCompleted(category, completedCategoryIds)
            const featured = !completed && category.category_id === nextIncompleteId
            const description = categoryDescriptionForKey(normalizeCategoryKey(category.category_key))
            const loading = isLoadingCategoryId === category.category_id
            const selectable = canSelectCategory ? canSelectCategory(category) : true

            if (completed) {
              const reopenable = canSelectCategory ? canSelectCategory(category) : false
              const completedClassName =
                'flex w-full items-center rounded-xl border border-[rgba(218,193,90,0.5)] bg-white/5 p-4 shadow-[0_0_5px_0_rgba(218,193,90,0.2)]'
              const completedInner = (
                <div className="flex min-w-0 items-center gap-1.5">
                  <img src={tickCircleSolid} alt="" className="size-[15px] shrink-0" aria-hidden />
                  <span className="text-[14px] font-medium text-white">
                    {category.display_name || category.category_key}
                  </span>
                </div>
              )

              if (reopenable) {
                return (
                  <button
                    key={category.category_id}
                    type="button"
                    disabled={loading || Boolean(isLoadingCategoryId)}
                    onClick={() => onSelectCategory(category)}
                    className={`${completedClassName} cursor-pointer text-left transition-colors hover:bg-white/10 disabled:opacity-70`}
                  >
                    {completedInner}
                  </button>
                )
              }

              return (
                <div key={category.category_id} className={completedClassName}>
                  {completedInner}
                </div>
              )
            }

            return (
              <button
                key={category.category_id}
                type="button"
                disabled={!selectable || loading || Boolean(isLoadingCategoryId)}
                onClick={() => onSelectCategory(category)}
                className={
                  featured
                    ? 'flex w-full flex-col gap-4 rounded-xl border border-[rgba(144,223,158,0.5)] bg-white/5 p-4 text-left shadow-[0_0_10px_0_rgba(144,223,158,0.5)] disabled:opacity-70'
                    : 'flex w-full items-center rounded-xl bg-white/5 p-[15px] text-left disabled:opacity-70'
                }
              >
                <div className="flex min-w-0 items-center gap-1.5">
                  <img src={assessmentRadioImg} alt="" className="size-[15px] shrink-0" aria-hidden />
                  <span className="text-[14px] font-medium text-[#ccc]">
                    {loading
                      ? 'Loading...'
                      : category.display_name || category.category_key}
                  </span>
                </div>
                {featured && description ? (
                  <p className="text-[11px] font-normal leading-normal text-[#c4c4c4]">{description}</p>
                ) : null}
              </button>
            )
          })}
        </div>

        {allComplete && onContinue ? (
          <ContinueButton
            variant="mobileBar"
            className={`!h-[52px] w-full border border-[#969696] shadow-[0_12px_20px_rgba(255,255,255,0.15)] ${ASSESSMENT_CONTENT_MAX_CLASS}`}
            showChevron={false}
            disabled={isContinuing}
            onClick={onContinue}
          >
            {isContinuing ? 'Submitting...' : 'Continue'}
          </ContinueButton>
        ) : null}
      </div>
    </div>
  )
}
