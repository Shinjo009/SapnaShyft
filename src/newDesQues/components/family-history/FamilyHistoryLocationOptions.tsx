import coastalImg from '../../assets/family-history/coastal.webp'
import inlandImg from '../../assets/family-history/inland.webp'
import {
  getOptionLabel,
  getOptionValue,
  type QuestionnaireOption,
} from '../../api/questionnaire'
import { resolveLocationCardKind } from '../../lib/apiQuestionLayouts'
import { FamilyHistoryQuestionHeader } from './FamilyHistoryQuestionHeader'

const CARD_META: Record<'inland' | 'coastal', { image: string }> = {
  inland: { image: inlandImg },
  coastal: { image: coastalImg },
}

/** Warm the location card images into browser cache as soon as this module loads. */
if (typeof document !== 'undefined') {
  for (const src of [inlandImg, coastalImg]) {
    const img = new Image()
    img.src = src
  }
}

/** Designed Inland / Coastal cards — driven by API option labels/values. */
export function FamilyHistoryLocationOptions({
  questionLabel,
  questionText,
  questionSubText,
  options,
  selectedValue,
  onSelect,
  onInfoClick,
  disabled = false,
}: {
  questionLabel: string
  questionText: string
  questionSubText?: string | null
  options: QuestionnaireOption[]
  selectedValue: string | null
  onSelect: (value: string) => void
  onInfoClick?: () => void
  disabled?: boolean
}) {
  return (
    <div className="mx-auto flex w-full flex-col items-center gap-[32px]">
      <FamilyHistoryQuestionHeader questionLabel={questionLabel} subText={questionSubText} onInfoClick={onInfoClick}>
        <p>{questionText}</p>
      </FamilyHistoryQuestionHeader>

      <div className="flex h-[254px] w-full flex-col gap-[16px]">
        {options.map((option) => {
          const value = getOptionValue(option)
          const label = getOptionLabel(option) || value
          if (!value && !label) return null

          const kind = resolveLocationCardKind(option)
          const meta = kind ? CARD_META[kind] : null
          const isSelected = selectedValue === value

          return (
            <button
              key={value || label}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(value)}
              className={[
                'relative flex min-h-0 flex-1 flex-col items-end justify-center overflow-hidden rounded-xl px-6 py-3 disabled:opacity-60',
                isSelected
                  ? 'border-[0.5px] border-solid border-[#9d50bb] shadow-[0_0_20px_0_rgba(157,80,187,0.4)]'
                  : 'border-[0.5px] border-solid border-[rgba(255,255,255,0.5)]',
              ].join(' ')}
            >
              {meta ? (
                <>
                  <img
                    src={meta.image}
                    alt=""
                    decoding="async"
                    fetchPriority="high"
                    loading="eager"
                    className="pointer-events-none absolute inset-0 size-full object-cover"
                    aria-hidden
                  />
                  <div
                    className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent from-45% to-black/90"
                    aria-hidden
                  />
                </>
              ) : null}
              <span
                className={[
                  'relative whitespace-nowrap text-[14px] leading-[15px] text-white',
                  isSelected ? 'font-semibold' : 'font-normal',
                ].join(' ')}
              >
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
