import { useEffect, useMemo, useState } from 'react'
import { QuestionSubText } from '../mcq/QuestionSubText'
import type { QuestionnaireQuestion } from '../../api/questionnaire'
import hipGif from '../../../images/hip-gif.gif'
import waistGif from '../../../images/waist-gif.gif'
import { AnthropometryMcqShell } from './AnthropometryMcqShell'
import { HeightRulerPicker } from './HeightRulerPicker'
import { HorizontalRulerPicker } from './HorizontalRulerPicker'
import { WeightGaugePicker } from './WeightGaugePicker'
import {
  AnthropometryInfoButton,
  AnthropometryInfoPopup,
} from './AnthropometryPrimitives'
import {
  ANTHRO_QUESTION_COUNT,
  clamp,
  convertCircumference,
  convertWeight,
  DEFAULT_HEIGHT_CM,
  DEFAULT_HEIGHT_FEET,
  DEFAULT_HEIGHT_INCHES,
  DEFAULT_HIP_IN,
  DEFAULT_WAIST_IN,
  DEFAULT_WEIGHT_KG,
  extractUnitOptionsFromQuestion,
  findQuestionByAliasesAndHints,
  getCircumferenceRangeForUnit,
  getQuestionSubText,
  getQuestionText,
  getWeightRangeForUnit,
  isCentimeterUnit,
  isFeetInchesUnit,
  isKilogramUnit,
  isPoundUnit,
  isProvidedNumber,
  MAX_HEIGHT_CM,
  MAX_HEIGHT_INCHES,
  MIN_HEIGHT_CM,
  MIN_HEIGHT_INCHES,
  prioritizeCircumferenceUnitOptions,
  prioritizeHeightUnitOptions,
  resolvePreferredUnitOption,
  roundToTenth,
  type AnthropometryFollowupValues,
  type AnthropometryPrimaryValues,
  type CircumferenceKind,
} from './anthropometryConfig'
import './anthropometry.css'

export function AnthropometryStep({
  questions = [],
  onBack,
  onComplete,
  initialPrimary,
  initialFollowup,
  initialIndex = 0,
  title = 'Anthropometry',
}: {
  questions?: QuestionnaireQuestion[]
  onBack: () => void
  onComplete: (payload: {
    primary: AnthropometryPrimaryValues
    followup: AnthropometryFollowupValues
  }) => void
  initialPrimary?: Partial<AnthropometryPrimaryValues>
  initialFollowup?: Partial<AnthropometryFollowupValues>
  /** Start at a specific screen (e.g. 3 = hip for FitPrint follow-up-only). */
  initialIndex?: number
  title?: string
}) {
  const [index, setIndex] = useState(() =>
    clamp(Math.round(Number(initialIndex) || 0), 0, ANTHRO_QUESTION_COUNT - 1),
  )
  const [height, setHeight] = useState(() =>
    Number.isFinite(Number(initialPrimary?.height)) ? Number(initialPrimary?.height) : DEFAULT_HEIGHT_CM,
  )
  const [weight, setWeight] = useState<number | null>(() =>
    isProvidedNumber(initialPrimary?.weight) ? Number(initialPrimary?.weight) : DEFAULT_WEIGHT_KG,
  )
  const [waist, setWaist] = useState(() =>
    Number.isFinite(Number(initialPrimary?.waist))
      ? Math.round(Number(initialPrimary?.waist))
      : DEFAULT_WAIST_IN,
  )
  const [heightUnit, setHeightUnit] = useState(() => String(initialPrimary?.heightUnit || 'Cm'))
  const [weightUnit, setWeightUnit] = useState(() => String(initialPrimary?.weightUnit || 'Kg'))
  const [waistUnit, setWaistUnit] = useState(() => String(initialPrimary?.waistUnit || 'In'))
  const [heightFeet, setHeightFeet] = useState(() =>
    Number.isFinite(Number(initialPrimary?.heightFeet))
      ? Number(initialPrimary?.heightFeet)
      : DEFAULT_HEIGHT_FEET,
  )
  const [heightInches, setHeightInches] = useState(() =>
    Number.isFinite(Number(initialPrimary?.heightInches))
      ? Number(initialPrimary?.heightInches)
      : DEFAULT_HEIGHT_INCHES,
  )
  const [hipSize, setHipSize] = useState(() =>
    Number.isFinite(Number(initialFollowup?.hipSize))
      ? Math.round(Number(initialFollowup?.hipSize))
      : DEFAULT_HIP_IN,
  )
  const [hipUnit, setHipUnit] = useState(() => String(initialFollowup?.hipUnit || 'In'))
  const [showWaistInfo, setShowWaistInfo] = useState(false)
  const [showHipInfo, setShowHipInfo] = useState(false)
  const [submitAttempted, setSubmitAttempted] = useState(false)

  const heightLabel = getQuestionText(questions, ['height'], ['height'], 'What is you height ?')
  const weightLabel = getQuestionText(questions, ['weight'], ['weight', 'body weight'], 'What is you weight?')
  const waistLabel = getQuestionText(questions, ['waist_circumference', 'waist'], ['waist'], 'What is you waist size ?')
  const hipLabel = getQuestionText(questions, ['hip_circumference', 'hip'], ['hip'], 'What is you hip size ?')
  const heightSubText = getQuestionSubText(questions, ['height'], ['height'])
  const weightSubText = getQuestionSubText(questions, ['weight'], ['weight', 'body weight'])
  const waistSubText = getQuestionSubText(questions, ['waist_circumference', 'waist'], ['waist'])
  const hipSubText = getQuestionSubText(questions, ['hip_circumference', 'hip'], ['hip'])

  const previews = [{ line1: weightLabel }, { line1: waistLabel }, { line1: hipLabel }]

  const isLast = index >= ANTHRO_QUESTION_COUNT - 1
  const isWeightValid = isProvidedNumber(weight)

  const finish = (followup: AnthropometryFollowupValues) => {
    onComplete({
      primary: {
        height,
        weight,
        waist: roundToTenth(waist),
        heightUnit,
        weightUnit,
        waistUnit,
        heightFeet,
        heightInches,
      },
      followup,
    })
  }

  const handleNext = () => {
    if (index === 1 && !isWeightValid) {
      setSubmitAttempted(true)
      return
    }
    if (isLast) {
      finish({
        hipSize: roundToTenth(hipSize),
        hipUnit,
      })
      return
    }
    setIndex((current) => current + 1)
  }

  const handleBack = () => {
    if (index === 0) {
      onBack()
      return
    }
    setIndex((current) => current - 1)
  }

  return (
    <AnthropometryMcqShell
      title={title}
      progressPercent={Math.round(((index + 1) / ANTHRO_QUESTION_COUNT) * 100)}
      onBack={handleBack}
      onNext={handleNext}
      nextQuestionPreview={isLast ? undefined : previews[index]}
    >
      {index === 0 ? (
        <HeightQuestion
          questions={questions}
          label={heightLabel}
          subText={heightSubText}
          height={height}
          heightUnit={heightUnit}
          onHeightChange={setHeight}
          onUnitChange={(unit, nextHeight, feet, inches) => {
            setHeightUnit(unit)
            setHeight(nextHeight)
            setHeightFeet(feet)
            setHeightInches(inches)
          }}
        />
      ) : null}

      {index === 1 ? (
        <WeightQuestion
          questions={questions}
          label={weightLabel}
          subText={weightSubText}
          weight={weight}
          weightUnit={weightUnit}
          showRequired={submitAttempted && !isWeightValid}
          onWeightChange={(next) => {
            setWeight(next)
            if (isProvidedNumber(next)) setSubmitAttempted(false)
          }}
          onUnitChange={setWeightUnit}
        />
      ) : null}

      {index === 2 ? (
        <WaistQuestion
          questions={questions}
          label={waistLabel}
          subText={waistSubText}
          waist={waist}
          waistUnit={waistUnit}
          onWaistChange={setWaist}
          onUnitChange={setWaistUnit}
          onOpenInfo={() => setShowWaistInfo(true)}
        />
      ) : null}

      {index === 3 ? (
        <HipQuestion
          questions={questions}
          label={hipLabel}
          subText={hipSubText}
          hipSize={hipSize}
          hipUnit={hipUnit}
          onHipChange={setHipSize}
          onUnitChange={setHipUnit}
          onOpenInfo={() => setShowHipInfo(true)}
          onSkip={() => finish({})}
        />
      ) : null}

      <AnthropometryInfoPopup
        open={showWaistInfo}
        label="Waist size information"
        gifSrc={waistGif}
        onClose={() => setShowWaistInfo(false)}
      />
      <AnthropometryInfoPopup
        open={showHipInfo}
        label="Hip size information"
        gifSrc={hipGif}
        onClose={() => setShowHipInfo(false)}
      />
    </AnthropometryMcqShell>
  )
}

function QuestionChrome({
  index,
  children,
  subText,
}: {
  index: number
  children: string
  subText?: string | null
}) {
  return (
    <div className="flex w-full flex-col items-start gap-2">
      <p className="font-['DM_Sans'] text-sm font-medium leading-5 text-white/40">
        Question {index + 1} of {ANTHRO_QUESTION_COUNT}
      </p>
      <p className="font-['Lato'] text-base font-normal tracking-tight text-white">{children}</p>
      <QuestionSubText text={subText} />
    </div>
  )
}

function HeightQuestion({
  questions,
  label,
  subText,
  height,
  heightUnit,
  onHeightChange,
  onUnitChange,
}: {
  questions: QuestionnaireQuestion[]
  label: string
  subText?: string | null
  height: number
  heightUnit: string
  onHeightChange: (value: number) => void
  onUnitChange: (unit: string, heightCm: number, feet: number, inches: number) => void
}) {
  const heightQuestion = useMemo(
    () => findQuestionByAliasesAndHints(questions, ['height'], ['height']),
    [questions],
  )
  const heightUnitOptions = useMemo(
    () => prioritizeHeightUnitOptions(extractUnitOptionsFromQuestion(heightQuestion)),
    [heightQuestion],
  )
  const cmOption = heightUnitOptions.find((option) => isCentimeterUnit(option)) || 'Cm'
  const ftOption = heightUnitOptions.find((option) => isFeetInchesUnit(option)) || 'Ft/In'
  const usesFeet = isFeetInchesUnit(heightUnit)
  const totalInches = clamp(height / 2.54, MIN_HEIGHT_INCHES, MAX_HEIGHT_INCHES)

  useEffect(() => {
    const preferred = resolvePreferredUnitOption(heightUnitOptions, heightUnit, 'Cm')
    if (preferred !== heightUnit) {
      onUnitChange(
        preferred,
        height,
        Math.floor(totalInches / 12),
        Math.round((totalInches % 12) * 10) / 10,
      )
    }
  }, [heightUnitOptions]) // eslint-disable-line react-hooks/exhaustive-deps

  const selectUnit = (nextUnit: string) => {
    if (isFeetInchesUnit(nextUnit)) {
      const inches = clamp(height / 2.54, MIN_HEIGHT_INCHES, MAX_HEIGHT_INCHES)
      onUnitChange(nextUnit, height, Math.floor(inches / 12), inches % 12)
      return
    }
    onUnitChange(nextUnit, height, Math.floor(totalInches / 12), totalInches % 12)
  }

  return (
    <div className="flex w-full flex-col items-center gap-7 pb-4 pt-2">
      <QuestionChrome index={0} subText={subText}>{label}</QuestionChrome>
      <div className="flex w-full flex-col items-center gap-5">
        <div className="inline-flex items-start rounded-full bg-black/30 p-1 outline outline-1 outline-offset-[-1px] outline-white/10">
          <button
            type="button"
            className={`rounded-full px-5 py-2 text-center text-xs font-medium leading-4 ${
              !usesFeet ? 'bg-white/10 text-white' : 'text-neutral-400'
            }`}
            onClick={() => selectUnit(cmOption)}
          >
            Centimeters
          </button>
          <button
            type="button"
            className={`rounded-full px-5 py-2 text-center text-xs font-medium leading-4 ${
              usesFeet ? 'bg-white/10 text-white' : 'text-neutral-400'
            }`}
            onClick={() => selectUnit(ftOption)}
          >
            Feet/inches
          </button>
        </div>

        {usesFeet ? (
          <HeightRulerPicker
            key="ft"
            value={clamp(Math.round(totalInches), MIN_HEIGHT_INCHES, MAX_HEIGHT_INCHES)}
            min={MIN_HEIGHT_INCHES}
            max={MAX_HEIGHT_INCHES}
            step={0.1}
            snapStep={1}
            unitLabel=""
            formatValue={(inches) => {
              const rounded = Math.round(inches)
              const feet = Math.floor(rounded / 12)
              const rest = rounded % 12
              return `${feet}.${rest}`
            }}
            formatTickLabel={(inches) => {
              const feet = Math.floor(inches / 12)
              const rest = Math.round(inches % 12)
              return `${feet}'${rest}"`
            }}
            onChange={(inches) => {
              const whole = Math.round(inches)
              const nextCm = clamp(whole * 2.54, MIN_HEIGHT_CM, MAX_HEIGHT_CM)
              onUnitChange(heightUnit, nextCm, Math.floor(whole / 12), whole % 12)
            }}
          />
        ) : (
          <HeightRulerPicker
            key="cm"
            value={height}
            min={MIN_HEIGHT_CM}
            max={MAX_HEIGHT_CM}
            step={0.1}
            unitLabel="cm"
            onChange={onHeightChange}
          />
        )}
      </div>
    </div>
  )
}

function WeightQuestion({
  questions,
  label,
  subText,
  weight,
  weightUnit,
  showRequired,
  onWeightChange,
  onUnitChange,
}: {
  questions: QuestionnaireQuestion[]
  label: string
  subText?: string | null
  weight: number | null
  weightUnit: string
  showRequired: boolean
  onWeightChange: (value: number | null) => void
  onUnitChange: (unit: string) => void
}) {
  const weightQuestion = useMemo(
    () => findQuestionByAliasesAndHints(questions, ['weight'], ['weight', 'body weight']),
    [questions],
  )
  const weightUnitOptions = useMemo(() => {
    const extracted = extractUnitOptionsFromQuestion(weightQuestion)
    return extracted.length > 0 ? extracted : ['Kg', 'Lb']
  }, [weightQuestion])

  const kgOption = weightUnitOptions.find((option) => isKilogramUnit(option)) || 'Kg'
  const lbOption = weightUnitOptions.find((option) => isPoundUnit(option)) || 'Lb'
  const usesPounds = isPoundUnit(weightUnit)
  const range = getWeightRangeForUnit(weightUnit)
  const gaugeValue = weight == null ? range.defaultValue : clamp(weight, range.min, range.max)
  const unitLabel = usesPounds ? 'Lb' : 'Kg'

  useEffect(() => {
    onUnitChange(resolvePreferredUnitOption(weightUnitOptions, weightUnit, 'Kg'))
  }, [weightUnitOptions]) // eslint-disable-line react-hooks/exhaustive-deps

  const selectUnit = (nextUnit: string) => {
    if (nextUnit === weightUnit) return
    onWeightChange(convertWeight(gaugeValue, weightUnit, nextUnit))
    onUnitChange(nextUnit)
  }

  return (
    <div className="flex w-full flex-col items-center gap-7 pb-4 pt-2">
      <QuestionChrome index={1} subText={subText}>{label}</QuestionChrome>
      <div className="flex w-full flex-col items-center gap-10">
        <div className="inline-flex items-start rounded-full bg-black/30 p-1 outline outline-1 outline-offset-[-1px] outline-white/10">
          <button
            type="button"
            className={`rounded-full px-5 py-2 text-center font-['DM_Sans'] text-xs font-medium leading-4 ${
              !usesPounds ? 'bg-white/10 text-white' : 'text-neutral-400'
            }`}
            onClick={() => selectUnit(kgOption)}
          >
            Kilograms
          </button>
          <button
            type="button"
            className={`rounded-full px-5 py-2 text-center font-['DM_Sans'] text-xs font-medium leading-4 ${
              usesPounds ? 'bg-white/10 text-white' : 'text-neutral-400'
            }`}
            onClick={() => selectUnit(lbOption)}
          >
            Pounds
          </button>
        </div>

        <WeightGaugePicker
          key={usesPounds ? 'lb' : 'kg'}
          value={gaugeValue}
          min={range.min}
          max={range.max}
          unitLabel={unitLabel}
          onChange={onWeightChange}
        />
      </div>
      {showRequired ? <p className="text-center text-sm text-[#f5a9a9]">Please enter your weight</p> : null}
    </div>
  )
}

const WAIST_ALIASES = ['waist_circumference', 'waist']
const WAIST_HINTS = ['waist']
const HIP_ALIASES = ['hip_circumference', 'hip_size', 'hip']
const HIP_HINTS = ['hip']

function CircumferenceQuestion({
  questions,
  label,
  subText,
  index,
  value,
  unit,
  kind,
  aliases,
  hints,
  infoLabel,
  onChange,
  onUnitChange,
  onOpenInfo,
  onSkip,
}: {
  questions: QuestionnaireQuestion[]
  label: string
  subText?: string | null
  index: number
  value: number
  unit: string
  kind: CircumferenceKind
  aliases: string[]
  hints: string[]
  infoLabel: string
  onChange: (value: number) => void
  onUnitChange: (unit: string) => void
  onOpenInfo: () => void
  onSkip?: () => void
}) {
  const question = useMemo(() => findQuestionByAliasesAndHints(questions, aliases, hints), [aliases, hints, questions])
  const unitOptions = useMemo(
    () => prioritizeCircumferenceUnitOptions(extractUnitOptionsFromQuestion(question)),
    [question],
  )
  const cmOption = unitOptions.find((option) => isCentimeterUnit(option)) || 'Cm'
  const inOption = unitOptions.find((option) => !isCentimeterUnit(option)) || 'In'
  const usesCm = isCentimeterUnit(unit)
  const range = getCircumferenceRangeForUnit(unit, kind)
  const unitLabel = usesCm ? 'Cms' : 'In'

  useEffect(() => {
    onUnitChange(resolvePreferredUnitOption(unitOptions, unit, 'In'))
  }, [unitOptions]) // eslint-disable-line react-hooks/exhaustive-deps

  const selectUnit = (nextUnit: string) => {
    if (nextUnit === unit) return
    onChange(convertCircumference(value, unit, nextUnit, kind))
    onUnitChange(nextUnit)
  }

  return (
    <div className="flex w-full flex-col items-center gap-7 pb-4 pt-2">
      <div className="relative w-full">
        <QuestionChrome index={index} subText={subText}>{label}</QuestionChrome>
        <AnthropometryInfoButton label={infoLabel} onClick={onOpenInfo} />
      </div>
      <div className="flex w-full flex-col items-center gap-10">
        <div className="inline-flex items-start rounded-full bg-black/30 p-1 outline outline-1 outline-offset-[-1px] outline-white/10">
          <button
            type="button"
            className={`rounded-full px-5 py-2 text-center font-['DM_Sans'] text-xs font-medium leading-4 ${
              usesCm ? 'bg-white/10 text-white' : 'text-neutral-400'
            }`}
            onClick={() => selectUnit(cmOption)}
          >
            Centimeters
          </button>
          <button
            type="button"
            className={`rounded-full px-5 py-2 text-center font-['DM_Sans'] text-xs font-medium leading-4 ${
              !usesCm ? 'bg-white/10 text-white' : 'text-neutral-400'
            }`}
            onClick={() => selectUnit(inOption)}
          >
            Inches
          </button>
        </div>

        <HorizontalRulerPicker
          key={usesCm ? 'cm' : 'in'}
          value={clamp(Math.round(value), range.min, range.max)}
          min={range.min}
          max={range.max}
          step={0.1}
          snapStep={1}
          unitLabel={unitLabel}
          onChange={(next) => onChange(Math.round(next))}
        />
      </div>
      {onSkip ? (
        <button type="button" className="text-sm font-normal tracking-tight text-zinc-400 underline" onClick={onSkip}>
          Skip
        </button>
      ) : null}
    </div>
  )
}

function WaistQuestion({
  questions,
  label,
  subText,
  waist,
  waistUnit,
  onWaistChange,
  onUnitChange,
  onOpenInfo,
}: {
  questions: QuestionnaireQuestion[]
  label: string
  subText?: string | null
  waist: number
  waistUnit: string
  onWaistChange: (value: number) => void
  onUnitChange: (unit: string) => void
  onOpenInfo: () => void
}) {
  return (
    <CircumferenceQuestion
      questions={questions}
      label={label}
      subText={subText}
      index={2}
      value={waist}
      unit={waistUnit}
      kind="waist"
      aliases={WAIST_ALIASES}
      hints={WAIST_HINTS}
      infoLabel="Open waist size information"
      onChange={onWaistChange}
      onUnitChange={onUnitChange}
      onOpenInfo={onOpenInfo}
    />
  )
}

function HipQuestion({
  questions,
  label,
  subText,
  hipSize,
  hipUnit,
  onHipChange,
  onUnitChange,
  onOpenInfo,
  onSkip,
}: {
  questions: QuestionnaireQuestion[]
  label: string
  subText?: string | null
  hipSize: number
  hipUnit: string
  onHipChange: (value: number) => void
  onUnitChange: (unit: string) => void
  onOpenInfo: () => void
  onSkip: () => void
}) {
  return (
    <CircumferenceQuestion
      questions={questions}
      label={label}
      subText={subText}
      index={3}
      value={hipSize}
      unit={hipUnit}
      kind="hip"
      aliases={HIP_ALIASES}
      hints={HIP_HINTS}
      infoLabel="Open hip size information"
      onChange={onHipChange}
      onUnitChange={onUnitChange}
      onOpenInfo={onOpenInfo}
      onSkip={onSkip}
    />
  )
}

