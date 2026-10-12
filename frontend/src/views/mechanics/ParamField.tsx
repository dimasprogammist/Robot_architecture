import { useEffect, useState } from 'react'
import { parseFinite } from '../../model/mechanics/units'

function formatValue(value: number | null | '') {
  if (typeof value === 'number' && Number.isFinite(value)) return String(Number(value.toFixed(4)))
  return ''
}

export function ParamField({
  label,
  unit,
  value,
  onChange,
  min,
  max,
  step,
  optional,
  slider,
  hint,
}: {
  label: string
  unit?: string
  value: number | null | ''
  onChange: (v: number | null) => void
  min?: number
  max?: number
  step?: number
  optional?: boolean
  slider?: boolean
  hint?: string
}) {
  const numeric = typeof value === 'number' && Number.isFinite(value)
  const [draft, setDraft] = useState<string | null>(null)
  const [rangeMsg, setRangeMsg] = useState('')
  const shown = draft ?? formatValue(value)
  const sliderVal = numeric ? value : min ?? 0

  useEffect(() => {
    if (draft == null) return
    const formatted = formatValue(value)
    if (formatted && draft.replace(',', '.') === formatted) setDraft(null)
  }, [value, draft])

  const commit = (raw: string, clamp: boolean) => {
    const trimmed = raw.trim().replace(',', '.')
    if (trimmed === '' || trimmed === '-' || trimmed === '.' || trimmed === '-.') {
      if (optional && trimmed === '') {
        onChange(null)
        setRangeMsg('')
      }
      return false
    }
    const n = parseFinite(trimmed, Number.NaN)
    if (!Number.isFinite(n)) return false
    let next = n
    if (clamp) {
      if (min != null && next < min) {
        next = min
        setRangeMsg(`Минимум ${min}${unit ? ` ${unit}` : ''}.`)
      } else if (max != null && next > max) {
        next = max
        setRangeMsg(`Максимум ${max}${unit ? ` ${unit}` : ''}.`)
      } else setRangeMsg('')
    } else if ((min != null && n < min) || (max != null && n > max)) {
      setRangeMsg(`Допустимо ${min ?? '−∞'}…${max ?? '+∞'}${unit ? ` ${unit}` : ''}.`)
      return false
    } else setRangeMsg('')
    onChange(next)
    return true
  }

  return (
    <div className="field param-field">
      <div className="param-head">
        <label>{label}</label>
        <div className="param-value">
          <input
            inputMode="decimal"
            value={shown}
            placeholder={optional ? 'не задано' : undefined}
            aria-label={unit ? `${label}, ${unit}` : label}
            onFocus={(e) => setDraft(e.target.value)}
            onChange={(e) => {
              const raw = e.target.value
              setDraft(raw)
              const trimmed = raw.trim()
              if (trimmed === '') {
                if (optional) onChange(null)
                return
              }
              if (!/^-?\d*([.,]\d*)?$/.test(trimmed)) return
              if (trimmed.endsWith('.') || trimmed.endsWith(',') || trimmed === '-' || trimmed.endsWith('.0') && raw.endsWith('0')) {
                if (!trimmed.endsWith('.') && !trimmed.endsWith(',') && trimmed !== '-') commit(trimmed, false)
                return
              }
              commit(trimmed, false)
            }}
            onBlur={() => {
              const raw = draft ?? shown
              if (raw.trim() === '') {
                if (optional) onChange(null)
                else if (numeric) setDraft(null)
                setDraft(null)
                return
              }
              commit(raw, true)
              setDraft(null)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
            }}
          />
          {unit ? <span className="field-unit">{unit}</span> : null}
        </div>
      </div>
      {slider && min != null && max != null ? (
        <input
          className="app-range"
          type="range"
          min={min}
          max={max}
          step={step ?? (max - min) / 100}
          value={Math.min(max, Math.max(min, sliderVal))}
          disabled={!numeric && optional}
          aria-label={`${label} слайдер`}
          onChange={(e) => {
            const n = Number(e.target.value)
            setDraft(null)
            setRangeMsg('')
            onChange(n)
          }}
        />
      ) : null}
      {rangeMsg ? <p className="hint">{rangeMsg}</p> : hint ? <p className="hint">{hint}</p> : null}
    </div>
  )
}
