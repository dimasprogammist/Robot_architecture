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

export function ColorSwatches({ value, onChange }: { value: string; onChange: (color: string) => void }) {
  const current = (value || '').toLowerCase()
  return (
    <div className="swatches" role="listbox" aria-label="Палитра цветов">
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
    </div>
  )
}
