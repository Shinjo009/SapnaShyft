import type { QuestionnaireOption } from '../../api/questionnaire'
import { LifestyleHabitsQuestionHeader } from './LifestyleHabitsQuestionHeader'
import { LifestyleApiPillGrid } from './LifestyleApiPillGrid'

/** Designed Lifestyle Q9 — pick 1–2 wellness priorities; payload is a string list. */
export function LifestyleWellnessPrioritiesQuestion({
  questionLabel,
  questionText,
  questionSubText,
  options,
  selectedValues,
  onToggle,
  onInfoClick,
  maxSelections = 2,
}: {
  questionLabel: string
  questionText: string
  questionSubText?: string | null
  options: QuestionnaireOption[]
  selectedValues: string[]
  onToggle: (value: string) => void
  onInfoClick?: () => void
  maxSelections?: number
}) {
  return (
    <div className="flex w-full flex-col gap-8">
      <LifestyleHabitsQuestionHeader questionLabel={questionLabel} subText={questionSubText} onInfoClick={onInfoClick}>
        <p>{questionText}</p>
      </LifestyleHabitsQuestionHeader>

      <LifestyleApiPillGrid
        options={options}
        selectedValues={selectedValues}
        onToggle={onToggle}
        maxSelections={maxSelections}
        layout="wellness"
        showTick
      />
    </div>
  )
}
