import { useEffect, useRef, useState } from 'react'

export const PROTOCOL_PALETTE = [
  '#0072B2',
  '#E69F00',
  '#009E73',
  '#D55E00',
  '#CC79A7',
  '#56B4E9',
  '#882255',
  '#44AA99',
  '#117733',
  '#332288',
  '#AA4499',
  '#88CCEE',
  '#DDCC77',
  '#661100',
  '#999933',
  '#000000',
]

function Palette({
  value,
  onChange,
}: {
  value: string
  onChange: (color: string) => void
}) {
  const current = (value || '').toLowerCase()
  return (
    <>
      {PROTOCOL_PALETTE.map((color) => (
        <button
          key={color}
          type="button"
          className={`swatch ${current === color.toLowerCase() ? 'active' : ''}`}
          style={{ background: color }}
          aria-label={color}
          onClick={() => onChange(color)}
        />
      ))}
    </>
  )
}

export function ColorSwatches({
  value,
  onChange,
  compact = true,
}: {
  value: string
  onChange: (color: string) => void
  compact?: boolean
}) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const current = value || PROTOCOL_PALETTE[0]

  useEffect(() => {
    if (!open) return
    const onDoc = (event: MouseEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  if (!compact) {
    return (
      <div className="swatches" role="listbox" aria-label="Палитра цветов">
        <Palette value={value} onChange={onChange} />
      </div>
    )
  }

  return (
    <div className="color-picker" ref={wrapRef}>
      <button
        className="color-picker-current"
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
        title="Выбрать цвет протокола"
        aria-label="Выбрать цвет протокола"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="swatch" style={{ background: current }} />
      </button>
      {open ? (
        <div className="color-picker-pop" role="listbox" aria-label="Палитра цветов">
          <Palette
            value={value}
            onChange={(color) => {
              onChange(color)
              setOpen(false)
            }}
          />
        </div>
      ) : null}
    </div>
  )
}
