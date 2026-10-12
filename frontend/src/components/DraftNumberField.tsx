import { useEffect, useState } from 'react'

export function DraftNumberField({
  label,
  value,
  onCommit,
  min,
  max,
  step,
  ariaLabel,
  hideLabel,
  title,
}: {
  label: string
  value: number
  onCommit: (n: number) => void
  min: number
  max: number
  step?: number
  ariaLabel?: string
  hideLabel?: boolean
  title?: string
}) {
  const [draft, setDraft] = useState(String(value))
  useEffect(() => {
    setDraft(String(value))
  }, [value])

  const commit = (raw: string) => {
    const n = Number.parseFloat(raw.trim().replace(',', '.'))
    if (!Number.isFinite(n)) {
      setDraft(String(value))
      return
    }
    const snapped = step ? Math.round(n / step) * step : n
    const next = Math.min(max, Math.max(min, snapped))
    setDraft(String(next))
    if (next !== value) onCommit(next)
  }

  return (
    <div className="field">
      {hideLabel ? null : <label>{label}</label>}
      <input
        type="text"
        inputMode="decimal"
        value={draft}
        title={title || ariaLabel || label}
        aria-label={ariaLabel || label}
        onChange={(e) => {
          const raw = e.target.value
          if (raw !== '' && !/^-?\d*([.,]\d*)?$/.test(raw.trim())) return
          setDraft(raw)
        }}
        onBlur={() => commit(draft)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
        }}
      />
    </div>
  )
}