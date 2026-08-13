import { useMemo, useState } from 'react'
import type { ChangeEvent } from 'react'
import type { QuestionnaireQuestion } from '../../api/questionnaire'
import backIcon from '../../assets/family-history/back-icon.svg'
import { ContinueButton } from '../ContinueButton'
import { McqProgressBar } from '../mcq/McqProgressBar'
import { MCQ_HEADER_CLASS, MCQ_SHELL_CLASS, MCQ_SHELL_SCROLL_CLASS } from '../mcq/mcqLayout'
import {
  clampBloodPressure,
  formatVitalsTwoDigits,
  getVitalsQuestionText,
  MAX_BP,
  MIN_BP,
  normalizeStoredVitalReading,
  VITALS_PROGRESS_COLOR,
  type VitalsValues,
} from './vitalsConfig'
import './vitals.css'

export function VitalsStep({
  questions = [],
  onBack,
  onComplete,
  initialValues,
}: {
  questions?: QuestionnaireQuestion[]
  onBack: () => void
  onComplete: (values: VitalsValues) => void
  initialValues?: Partial<VitalsValues>
}) {
  const [systolic, setSystolic] = useState(() =>
    normalizeStoredVitalReading(initialValues?.systolic),
  )
  const [diastolic, setDiastolic] = useState(() =>
    normalizeStoredVitalReading(initialValues?.diastolic),
  )

  const systolicLabel = useMemo(
    () =>
      getVitalsQuestionText(
        questions,
        ['systolic_blood_pressure', 'systolic'],
        'Systolic Blood Pressure',
      ),
    [questions],
  )
  const diastolicLabel = useMemo(
    () =>
      getVitalsQuestionText(
        questions,
        ['diastolic_blood_pressure', 'diastolic'],
        'Diastolic Blood Pressure',
      ),
    [questions],
  )

  const finish = (values: VitalsValues) => {
    onComplete(values)
  }

  return (
    <div className={MCQ_SHELL_CLASS.replace('pb-[72px]', 'pb-0')}>
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(at_-94%_-56%,rgba(74,222,128,0.72),#030712_55%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none fixed bottom-0 right-0 z-0 h-72 w-48 rounded-full bg-cyan-400/40 blur-[100px]"
        aria-hidden
      />

      <header className={`relative z-[1] ${MCQ_HEADER_CLASS}`}>
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <button type="button" onClick={onBack} className="relative size-6 shrink-0" aria-label="Back">
            <img src={backIcon} alt="" className="absolute inset-0 size-full" aria-hidden />
          </button>
          <h1 className="shrink-0 whitespace-nowrap text-lg font-normal tracking-tight text-white">
            Vitals
          </h1>
        </div>
      </header>

      <div className="relative z-[1] flex shrink-0 flex-col gap-3 px-[25px] py-2">
        <div className="flex w-full items-center justify-end">
          <p className="text-right font-['DM_Sans'] text-xs font-normal uppercase leading-3 tracking-tight text-zinc-400">
            100% COMPLETED
          </p>
        </div>
        <McqProgressBar percent={100} color={VITALS_PROGRESS_COLOR} />
      </div>

      <div className={`relative z-[1] ${MCQ_SHELL_SCROLL_CLASS}`}>
        <div className="flex w-full flex-col items-center gap-6 px-[25px] pb-4 pt-6">
          <VitalsReadingField
            label={systolicLabel}
            value={systolic}
            onChange={setSystolic}
            ariaLabel="Systolic blood pressure"
          />
          <VitalsReadingField
            label={diastolicLabel}
            value={diastolic}
            onChange={setDiastolic}
            ariaLabel="Diastolic blood pressure"
          />
          <button
            type="button"
            className="text-sm font-normal tracking-tight text-zinc-400 underline"
            onClick={() => finish({ systolic: null, diastolic: null })}
          >
            Skip
          </button>
        </div>
      </div>

      <div className="relative z-[1] flex shrink-0 justify-center px-[25px] pb-6 pt-2">
        <ContinueButton variant="done" showChevron={false} onClick={() => finish({ systolic, diastolic })}>
          Done
        </ContinueButton>
      </div>
    </div>
  )
}

function VitalsReadingField({
  label,
  value,
  onChange,
  ariaLabel,
}: {
  label: string
  value: number | null
  onChange: (next: number | null) => void
  ariaLabel: string
}) {
  const display = value == null ? 0 : value
  const empty = value == null

  const handleNumberInput = (event: ChangeEvent<HTMLInputElement>) => {
    const raw = String(event.target.value || '').trim()
    if (raw === '') {
      onChange(null)
      return
    }
    const next = Number(raw)
    onChange(clampBloodPressure(Number.isNaN(next) ? 0 : next))
  }

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <p className="w-full text-center text-base font-normal tracking-tight text-white">{label}</p>
      <div className="relative flex h-36 w-full items-center justify-center rounded-2xl bg-teal-400/5 outline outline-[0.84px] outline-offset-[-0.84px] outline-zinc-300/10">
        <div className="flex items-center gap-3">
          <div className="relative flex min-w-12 items-center justify-center rounded-lg border border-white/20 bg-black/20 px-2 py-3">
            <input
              className="ndq-vitals__score-input"
              type="number"
              inputMode="numeric"
              min={MIN_BP}
              max={MAX_BP}
              value={value ?? ''}
              onChange={handleNumberInput}
              aria-label={ariaLabel}
            />
            <span
              className={`text-center font-['DM_Sans'] text-2xl leading-6 ${
                empty ? 'font-normal text-zinc-400' : 'font-bold text-white'
              }`}
              aria-hidden
            >
              {formatVitalsTwoDigits(display)}
            </span>
          </div>
          <span className="text-sm font-normal tracking-tight text-white">mmHg</span>
        </div>
      </div>
    </div>
  )
}
