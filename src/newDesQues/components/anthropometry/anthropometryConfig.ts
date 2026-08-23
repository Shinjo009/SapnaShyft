import type { QuestionnaireOption, QuestionnaireQuestion } from '../../api/questionnaire'

export const MIN_HEIGHT_CM = 50
export const MAX_HEIGHT_CM = 250
/** Feet/inches display min 1.5 → 1′5″ (17 total inches). */
export const MIN_HEIGHT_INCHES = 17
/** Feet/inches display max 8.5 → 8′5″ (101 total inches). */
export const MAX_HEIGHT_INCHES = 101
export const DEFAULT_HEIGHT_CM = 165
export const DEFAULT_HEIGHT_FEET = 5
export const DEFAULT_HEIGHT_INCHES = 5

export const MIN_WAIST_CM = 60
export const MAX_WAIST_CM = 150
export const MIN_WAIST_IN = 24
export const MAX_WAIST_IN = 59
export const DEFAULT_WAIST_CM = 90
export const DEFAULT_WAIST_IN = 35

export const MIN_HIP_CM = 70
export const MAX_HIP_CM = 160
export const MIN_HIP_IN = 28
export const MAX_HIP_IN = 62
export const DEFAULT_HIP_CM = 95
export const DEFAULT_HIP_IN = 37

export const IN_TO_CM = 2.54

export const ANTHRO_QUESTION_COUNT = 4

export const ANTHRO_PROGRESS_COLOR = '#90DF9E'

export const ANTHRO_NEXT_BUTTON_GRADIENT =
  "url(\"data:image/svg+xml;utf8,<svg viewBox='0 0 50 50' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='none'><rect x='0' y='0' height='100%' width='100%' fill='url(%23grad)' opacity='0.3'/><defs><radialGradient id='grad' gradientUnits='userSpaceOnUse' cx='0' cy='0' r='10' gradientTransform='matrix(2.5 0 0 2.5 25 25)'><stop stop-color='rgba(163,230,53,1)' offset='0'/><stop stop-color='rgba(4,47,46,1)' offset='1'/></radialGradient></defs></svg>\")"

export type AnthropometryPrimaryValues = {
  height: number
  weight: number | null
  waist: number
  heightUnit: string
  weightUnit: string
  waistUnit: string
  heightFeet: number
  heightInches: number
}

export type AnthropometryFollowupValues = {
  hipSize?: number
  hipUnit?: string
}

export type CircumferenceKind = 'waist' | 'hip'

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function roundToWholeNumber(value: unknown, fallback = 0): number {
  const numericValue = Number(value)
  if (!Number.isFinite(numericValue)) return fallback
  return Math.round(numericValue)
}

export function parseInitialWeight(raw: unknown): number | null {
  if (raw == null || raw === '') return null
  const n = Number(raw)
  return Number.isFinite(n) ? n : null
}

export function isProvidedNumber(raw: unknown): boolean {
  if (raw == null || raw === '') return false
  const n = Number(raw)
  return Number.isFinite(n) && n > 0
}

export function normalizeUnitToken(value: unknown): string {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
}

export function isFeetInchesUnit(value: unknown): boolean {
  const token = normalizeUnitToken(value)
  return (
    token.includes('ftin') ||
    token.includes('feetinch') ||
    token.includes('footinch') ||
    token === 'ft' ||
    token === 'feet' ||
    token === 'foot' ||
    token.includes('feet') ||
    token.includes('foot')
  )
}

export function isCentimeterUnit(value: unknown): boolean {
  const token = normalizeUnitToken(value)
  return token === 'cm' || token.includes('centimeter') || token.includes('centimetre')
}

export function isInchUnit(value: unknown): boolean {
  const token = normalizeUnitToken(value)
  return token === 'in' || token === 'inch' || token.includes('inches')
}

export function isPoundUnit(value: unknown): boolean {
  const token = normalizeUnitToken(value)
  return token === 'lb' || token === 'lbs' || token.includes('pound')
}

export const MIN_WEIGHT_KG = 20
export const MAX_WEIGHT_KG = 130
export const MIN_WEIGHT_LB = 44
export const MAX_WEIGHT_LB = 660
export const DEFAULT_WEIGHT_KG = 50
export const KG_TO_LB = 2.20462

export function isKilogramUnit(value: unknown): boolean {
  const token = normalizeUnitToken(value)
  return token === 'kg' || token.includes('kilo')
}

export function getWeightRangeForUnit(unit: string): { min: number; max: number; defaultValue: number } {
  if (isPoundUnit(unit)) {
    return { min: MIN_WEIGHT_LB, max: MAX_WEIGHT_LB, defaultValue: Math.round(DEFAULT_WEIGHT_KG * KG_TO_LB) }
  }
  return { min: MIN_WEIGHT_KG, max: MAX_WEIGHT_KG, defaultValue: DEFAULT_WEIGHT_KG }
}

export function convertWeight(value: number, fromUnit: string, toUnit: string): number {
  if (isPoundUnit(fromUnit) === isPoundUnit(toUnit)) {
    const range = getWeightRangeForUnit(toUnit)
    return clamp(Math.round(value), range.min, range.max)
  }
  if (isPoundUnit(toUnit)) {
    return clamp(Math.round(value * KG_TO_LB), MIN_WEIGHT_LB, MAX_WEIGHT_LB)
  }
  return clamp(Math.round(value / KG_TO_LB), MIN_WEIGHT_KG, MAX_WEIGHT_KG)
}

export function roundToTenth(value: number): number {
  return Math.round(value * 10) / 10
}

export function getCircumferenceRangeForUnit(
  unit: string,
  kind: CircumferenceKind = 'waist',
): {
  min: number
  max: number
  defaultValue: number
} {
  if (isCentimeterUnit(unit)) {
    if (kind === 'hip') {
      return { min: MIN_HIP_CM, max: MAX_HIP_CM, defaultValue: DEFAULT_HIP_CM }
    }
    return { min: MIN_WAIST_CM, max: MAX_WAIST_CM, defaultValue: DEFAULT_WAIST_CM }
  }
  if (kind === 'hip') {
    return { min: MIN_HIP_IN, max: MAX_HIP_IN, defaultValue: DEFAULT_HIP_IN }
  }
  return { min: MIN_WAIST_IN, max: MAX_WAIST_IN, defaultValue: DEFAULT_WAIST_IN }
}

export function convertCircumference(
  value: number,
  fromUnit: string,
  toUnit: string,
  kind: CircumferenceKind = 'waist',
): number {
  const toCm = isCentimeterUnit(toUnit)
  const fromCm = isCentimeterUnit(fromUnit)
  if (toCm === fromCm) {
    const range = getCircumferenceRangeForUnit(toUnit, kind)
    return clamp(roundToTenth(value), range.min, range.max)
  }
  if (toCm) {
    const hipRange = getCircumferenceRangeForUnit('cm', kind)
    return clamp(roundToTenth(value * IN_TO_CM), hipRange.min, hipRange.max)
  }
  const inchRange = getCircumferenceRangeForUnit('in', kind)
  return clamp(roundToTenth(value / IN_TO_CM), inchRange.min, inchRange.max)
}

function getQuestionOptionLabel(option: QuestionnaireOption): string {
  return String(option?.display_name || option?.option_value || option?.label || '').trim()
}

export function extractUnitOptionsFromQuestion(question: QuestionnaireQuestion | null): string[] {
  const apiOptions = Array.isArray(question?.options)
    ? question.options.map(getQuestionOptionLabel).filter(Boolean)
    : []
  return [...new Set(apiOptions)]
}

export function prioritizeHeightUnitOptions(options: string[] = []): string[] {
  const normalizedOptions = options.filter(Boolean)
  if (normalizedOptions.length === 0) return ['Ft/In', 'Cm']

  const prioritized: string[] = []
  const feetOption = normalizedOptions.find((option) => isFeetInchesUnit(option))
  const cmOption = normalizedOptions.find((option) => isCentimeterUnit(option))
  prioritized.push(feetOption || 'Ft/In')
  prioritized.push(cmOption || 'Cm')

  for (const option of normalizedOptions) {
    if (!prioritized.some((existing) => normalizeUnitToken(existing) === normalizeUnitToken(option))) {
      prioritized.push(option)
    }
  }
  return prioritized
}

export function prioritizeCircumferenceUnitOptions(options: string[] = []): string[] {
  const normalizedOptions = options.filter(Boolean)
  if (normalizedOptions.length === 0) return ['In', 'cm']

  const prioritized: string[] = []
  const inchOption = normalizedOptions.find((option) => isInchUnit(option))
  const cmOption = normalizedOptions.find((option) => isCentimeterUnit(option))
  prioritized.push(inchOption || 'In')
  prioritized.push(cmOption || 'cm')

  for (const option of normalizedOptions) {
    if (!prioritized.some((existing) => normalizeUnitToken(existing) === normalizeUnitToken(option))) {
      prioritized.push(option)
    }
  }
  return prioritized
}

export function resolvePreferredUnitOption(
  options: string[] = [],
  preferredUnit = '',
  fallback = '-',
): string {
  if (!Array.isArray(options) || options.length === 0) return fallback

  const normalizedPreferred = normalizeUnitToken(preferredUnit)
  if (!normalizedPreferred) return options[0]

  const byExact = options.find((option) => normalizeUnitToken(option) === normalizedPreferred)
  if (byExact) return byExact

  const byPartial = options.find((option) => {
    const normalizedOption = normalizeUnitToken(option)
    return normalizedOption.includes(normalizedPreferred) || normalizedPreferred.includes(normalizedOption)
  })
  if (byPartial) return byPartial

  return options[0]
}

export function findQuestionByAliasesAndHints(
  questions: QuestionnaireQuestion[] = [],
  aliases: string[] = [],
  hints: string[] = [],
): QuestionnaireQuestion | null {
  if (!Array.isArray(questions) || questions.length === 0) return null

  const normalizedAliases = aliases.map((alias) => normalizeUnitToken(alias)).filter(Boolean)
  const normalizedHints = hints.map((hint) => normalizeUnitToken(hint)).filter(Boolean)

  const byExactKey = questions.find((question) => {
    const key = normalizeUnitToken(question?.question_key)
    return Boolean(key && normalizedAliases.includes(key))
  })
  if (byExactKey) return byExactKey

  const byPartialKey = questions.find((question) => {
    const key = normalizeUnitToken(question?.question_key)
    return Boolean(key && normalizedAliases.some((alias) => key.includes(alias) || alias.includes(key)))
  })
  if (byPartialKey) return byPartialKey

  return (
    questions.find((question) => {
      const questionText = normalizeUnitToken(question?.question_text)
      return Boolean(questionText && normalizedHints.some((hint) => questionText.includes(hint)))
    }) || null
  )
}

export function getQuestionText(
  questions: QuestionnaireQuestion[],
  keys: string[],
  hints: string[],
  fallback: string,
): string {
  return findQuestionByAliasesAndHints(questions, keys, hints)?.question_text || fallback
}

export function getQuestionSubText(
  questions: QuestionnaireQuestion[],
  keys: string[],
  hints: string[],
): string | null {
  const text = String(findQuestionByAliasesAndHints(questions, keys, hints)?.sub_text || '').trim()
  return text || null
}
