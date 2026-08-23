import type { ReactNode } from 'react'
import infoIcon from '../../assets/family-history/info-icon.svg'
import { QuestionSubText } from '../mcq/QuestionSubText'

/** Figma 5629:15433 — question counter with clickable info icon */
export function FamilyHistoryQuestionHeader({
  questionLabel,
  onInfoClick,
  subText,
  children,
  titleClassName = 'mt-2 text-[16px] leading-normal tracking-[0.08px] text-white',
}: {
  questionLabel: string
  onInfoClick?: () => void
  subText?: string | null
  children: ReactNode
  titleClassName?: string
}) {
  return (
    <div className="relative w-full">
      <p className="text-[14px] font-medium leading-5 text-[rgba(154,154,154,0.4)]">
        {questionLabel}
      </p>
      <div className={titleClassName}>
        {children}
        <QuestionSubText text={subText} />
      </div>
      {onInfoClick ? (
        <button
          type="button"
          onClick={onInfoClick}
          className="absolute right-0 top-[3px] size-[14px]"
          aria-label="Show question information"
        >
          <img src={infoIcon} alt="" className="size-full" aria-hidden />
        </button>
      ) : null}
    </div>
  )
}
