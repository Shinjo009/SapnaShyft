import type { ReactNode } from 'react'
import { ChevronRight } from 'lucide-react'

type Props = {
  children: ReactNode
  onClick?: () => void
  type?: 'button' | 'submit'
  className?: string
  showChevron?: boolean
  disabled?: boolean
  /** Figma mobile: 46px (steps 1–2) or 52px (step 3+). `done` is the last-question pill. */
  variant?: 'default' | 'mobileBar' | 'mobileBarCompact' | 'done'
}

export function ContinueButton({
  children,
  onClick,
  type = 'button',
  className = '',
  showChevron = true,
  disabled = false,
  variant = 'default',
}: Props) {
  const isDone = variant === 'done'
  const isBar = variant === 'mobileBar' || variant === 'mobileBarCompact'
  const barHeight = variant === 'mobileBarCompact' ? 'h-[40px]' : 'h-[46px]'

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={[
        'inline-flex items-center justify-center rounded-[36px] text-white transition',
        isDone
          ? 'h-10 w-full gap-2 bg-gradient-to-r from-teal-800 to-emerald-400 px-6 py-2.5 text-base font-semibold tracking-tight shadow-[0px_12px_20px_0px_rgba(255,255,255,0.15)] outline outline-1 outline-offset-[-1px] outline-neutral-400'
          : `gap-1.5 bg-gradient-to-r from-[#296359] to-[#41ab99] ${
              isBar
                ? `${barHeight} w-full border-0 px-5 py-2 text-[14px] font-semibold shadow-[0_8px_8px_0_rgba(255,255,255,0.12)]`
                : 'h-[42px] min-w-[106px] border border-[#969696] px-6 py-2 text-[14px] font-semibold shadow-[0_8px_8px_0_rgba(255,255,255,0.12)]'
            }`,
        disabled ? 'cursor-not-allowed opacity-70' : 'hover:brightness-110',
        className,
      ].join(' ')}
    >
      <span>{children}</span>
      {showChevron && !isDone && (
        <ChevronRight className="size-4 shrink-0" strokeWidth={2} aria-hidden />
      )}
    </button>
  )
}
