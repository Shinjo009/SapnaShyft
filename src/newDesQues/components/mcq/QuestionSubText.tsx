/** Secondary line under the question title from API `sub_text`. */
export function QuestionSubText({
  text,
  className = '',
}: {
  text?: string | null
  className?: string
}) {
  const value = String(text || '').trim()
  if (!value) return null

  return (
    <p
      className={`mt-1 break-words font-['Lato'] text-[12px] font-normal tracking-[0.06px] text-[#BBBBBB] ${className}`.trim()}
      style={{ wordWrap: 'break-word' }}
    >
      {value}
    </p>
  )
}
