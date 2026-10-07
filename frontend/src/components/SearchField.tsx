import { Search, X } from 'lucide-react'

export function SearchField({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (value: string) => void
  placeholder: string
}) {
  return (
    <label className="search-field">
      <Search size={15} aria-hidden />
      <input
        className="search-input"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
      {value ? (
        <button
          className="icon-btn search-clear"
          type="button"
          aria-label="Очистить поиск"
          onClick={() => onChange('')}
        >
          <X size={14} />
        </button>
      ) : null}
    </label>
  )
}
