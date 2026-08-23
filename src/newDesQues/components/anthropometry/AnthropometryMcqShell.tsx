import type { ReactNode } from 'react'
import backIcon from '../../assets/family-history/back-icon.svg'
import nextChevronIcon from '../../assets/family-history/next-chevron.svg'
import {
  ANTHRO_FOOTER_INNER_CLASS,
  ANTHRO_SHELL_CLASS,
  formatNextQuestionPreview,
  MCQ_HEADER_CLASS,
  MCQ_SHELL_SCROLL_CLASS,
  PAGE_GUTTER_X,
} from '../mcq/mcqLayout'
import { McqProgressBar } from '../mcq/McqProgressBar'
import { ANTHRO_NEXT_BUTTON_GRADIENT, ANTHRO_PROGRESS_COLOR } from './anthropometryConfig'

export function AnthropometryMcqShell({
  children,
  onBack,
  onNext,
  nextQuestionPreview,
  progressPercent,
  footer,
  title = 'Anthropometry',
}: {
  children: ReactNode
  onBack?: () => void
  onNext?: () => void
  nextQuestionPreview?: { line1: string; line2?: string }
  progressPercent: number
  footer?: ReactNode
  title?: string
}) {
  const clampedPercent = Math.min(100, Math.max(0, progressPercent))
  const showNext = Boolean(onNext)
  const showNextPreview = Boolean(nextQuestionPreview && onNext)

  const shellClass = footer ? ANTHRO_SHELL_CLASS.replace('pb-[72px]', 'pb-0') : ANTHRO_SHELL_CLASS

  return (
    <div className={shellClass}>
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(at_-94%_-56%,rgba(74,222,128,0.72),#030712_55%)]"
        aria-hidden
      />
      <div className="pointer-events-none fixed bottom-0 right-0 z-0 h-72 w-48 rounded-full bg-cyan-400/40 blur-[100px]" aria-hidden />
      <header className={`relative z-[1] ${MCQ_HEADER_CLASS}`}>
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <button type="button" onClick={onBack} className="relative size-6 shrink-0" aria-label="Back">
            <img src={backIcon} alt="" className="absolute inset-0 size-full" aria-hidden />
          </button>
          <h1 className="shrink-0 whitespace-nowrap text-[18px] font-normal tracking-tight text-white">
            {title}
          </h1>
        </div>
      </header>

      <div className="relative z-[1] flex shrink-0 flex-col gap-3 px-[16px] py-2">
        <div className="flex w-full items-center justify-end">
          <p className="text-right text-[12px] font-normal uppercase leading-3 tracking-tight text-zinc-400">
            {clampedPercent}% COMPLETED
          </p>
        </div>
        <McqProgressBar percent={clampedPercent} color={ANTHRO_PROGRESS_COLOR} />
      </div>

      <div className={`relative z-[1] ${MCQ_SHELL_SCROLL_CLASS}`}>
        <div className={PAGE_GUTTER_X}>{children}</div>
      </div>

      {footer ? (
        <div className="relative z-[1] shrink-0 px-[16px] pb-6 pt-2">{footer}</div>
      ) : showNext ? (
        <footer className="fixed inset-x-0 bottom-0 z-10 bg-white/5 backdrop-blur-xl">
          <div className={ANTHRO_FOOTER_INNER_CLASS}>
            {showNextPreview && nextQuestionPreview ? (
              <div className="min-w-0 max-w-44 flex-1">
                <p className="text-[12px] font-medium uppercase leading-4 tracking-wide text-white/40">
                  NEXT QUESTION
                </p>
                <p className="mt-0.5 overflow-hidden whitespace-nowrap text-[14px] font-medium leading-5 text-white/60">
                  {formatNextQuestionPreview(nextQuestionPreview.line1, nextQuestionPreview.line2 || '')}
                </p>
              </div>
            ) : (
              <div className="min-w-0 flex-1" />
            )}
            <button
              type="button"
              onClick={onNext}
              className="flex size-12 shrink-0 items-center justify-center rounded-full border border-[#969696] shadow-[0_8px_32px_0_rgba(144,223,158,0.5)]"
              style={{ backgroundImage: ANTHRO_NEXT_BUTTON_GRADIENT }}
              aria-label={showNextPreview ? 'Next question' : 'Continue'}
            >
              <img src={nextChevronIcon} alt="" className="size-6" aria-hidden />
            </button>
          </div>
        </footer>
      ) : null}
    </div>
  )
}
