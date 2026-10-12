import { useRef } from 'react'
import { highlightCode, normalizeLang } from '../model/syntaxHighlight'

export function CodeEditor({
  value,
  lang,
  onChange,
  onBlur,
  rows = 12,
  label,
}: {
  value: string
  lang?: string
  onChange: (next: string) => void
  onBlur?: () => void
  rows?: number
  label?: string
}) {
  const resolved = normalizeLang(lang)
  const display = value.endsWith('\n') ? `${value} ` : value || ' '
  const preRef = useRef<HTMLPreElement>(null)
  return (
    <div className="code-card code-editor-card">
      <div className="code-card-bar">
        <span className="code-dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className="code-card-lang">{label || resolved}</span>
      </div>
      <div className="code-editor-body">
        <pre className="code-editor-highlight" aria-hidden="true" ref={preRef}>
          <code>{highlightCode(display, resolved)}</code>
        </pre>
        <textarea
          className="code-editor-input"
          spellCheck={false}
          rows={rows}
          value={value}
          aria-label={label || 'Редактор кода'}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          onScroll={(e) => {
            const pre = preRef.current
            if (!pre) return
            pre.scrollTop = e.currentTarget.scrollTop
            pre.scrollLeft = e.currentTarget.scrollLeft
          }}
        />
      </div>
    </div>
  )
}
