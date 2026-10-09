import { useEffect, useRef, useState } from 'react'

export const COMPONENT_PALETTE = [
  '#D9773A',
  '#C9A227',
  '#6BAE3A',
  '#2F9E78',
  '#2B8FD4',
  '#6B5AD8',
  '#D94A7A',
  '#C46B2E',
  '#B45309',
  '#CA8A04',
  '#4D7C0F',
  '#0F766E',
  '#1D4ED8',
  '#6D28D9',
  '#BE185D',
  '#9A3412',
  '#A16207',
  '#3F6212',
  '#155E75',
  '#1E3A8A',
  '#5B21B6',
  '#9D174D',
  '#7C2D12',
  '#854D0E',
  '#365314',
  '#164E63',
  '#1E40AF',
  '#4C1D95',
  '#831843',
  '#44403C',
  '#DC2626',
  '#EA580C',
]

export const PROTOCOL_PALETTE = [...COMPONENT_PALETTE]

export const PROTOCOL_PALETTE_LAYOUT = { columns: 8, rows: 4 } as const

export type PaletteLayout = 'row' | 'grid'

export function componentPaletteConfig(colors: string[] = COMPONENT_PALETTE) {
  return { layout: 'row' as const, count: colors.length, rows: 1, wrap: false }
}

export function protocolPaletteConfig(colors: string[] = PROTOCOL_PALETTE) {
  return {
    layout: 'grid' as const,
    count: colors.length,
    columns: PROTOCOL_PALETTE_LAYOUT.columns,
    rows: PROTOCOL_PALETTE_LAYOUT.rows,
  }
}

function Palette({
  value,
  onChange,
  colors,
}: {
  value: string
  onChange: (color: string) => void
  colors: string[]
}) {
  const current = (value || '').toLowerCase()
  return (
    <>
      {colors.map((color) => (
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
  colors = COMPONENT_PALETTE,
  layout = 'row',
}: {
  value: string
  onChange: (color: string) => void
  compact?: boolean
  colors?: string[]
  layout?: PaletteLayout
}) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const current = value || colors[0]
  const layoutClass = layout === 'grid' ? 'swatches-grid' : 'swatches-row'

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
      <div className={`swatches ${layoutClass}`} role="listbox" aria-label="Палитра цветов">
        <Palette value={value} onChange={onChange} colors={colors} />
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
        title="Выбрать цвет"
        aria-label="Выбрать цвет"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="swatch" style={{ background: current }} />
      </button>
      {open ? (
        <div className={`color-picker-pop ${layoutClass}`} role="listbox" aria-label="Палитра цветов">
          <Palette
            value={value}
            colors={colors}
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
