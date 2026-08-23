import type { QuestionnaireQuestion } from '../../api/questionnaire'

export const MIN_BP = 0
export const MAX_BP = 299
export const VITALS_PROGRESS_COLOR = '#90DF9E'

export type VitalsValues = {
  systolic: number | null
  diastolic: number | null
}

/** BP readings ≤ 0 are unset — “00” is visual only. */
export function normalizeStoredVitalReading(raw: unknown): number | null {
  if (raw == null || raw === '') return null
  const n = Number(raw)
  if (!Number.isFinite(n) || n <= 0) return null
  return n
}

export function clampBloodPressure(value: number): number {
  return Math.min(MAX_BP, Math.max(MIN_BP, value))
}

export function formatVitalsTwoDigits(value: number): string {
  return String(value).padStart(2, '0')
}

function normalizeKey(value: unknown): string {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
}

export function findVitalsQuestion(
  questions: QuestionnaireQuestion[] = [],
  aliases: string[],
): QuestionnaireQuestion | null {
  const normalizedAliases = aliases.map(normalizeKey).filter(Boolean)
  return (
    questions.find((question) => {
      const key = normalizeKey(question?.question_key)
      return Boolean(key && normalizedAliases.some((alias) => key === alias || key.includes(alias)))
    }) || null
  )
}

export function getVitalsQuestionText(
  questions: QuestionnaireQuestion[],
  aliases: string[],
  fallback: string,
): string {
  return findVitalsQuestion(questions, aliases)?.question_text || fallback
}

export function getVitalsQuestionSubText(
  questions: QuestionnaireQuestion[],
  aliases: string[],
): string | null {
  const text = String(findVitalsQuestion(questions, aliases)?.sub_text || '').trim()
  return text || null
}
