import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { highlightCode, isDiagramCode, normalizeLang } from '../model/syntaxHighlight'

export function CodeBlock({
  code,
  lang,
}: {
  code: string
  lang?: string
}) {
  const [copied, setCopied] = useState(false)
  const resolved = normalizeLang(lang)
  const diagram = isDiagramCode(code, lang)
  const plainText = resolved === 'text' && !diagram
  const lines = code.length ? code.split('\n') : ['']
  const highlighted = diagram || plainText ? [code] : highlightCode(code, resolved)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code)
    } catch (error) {
      const area = document.createElement('textarea')
      area.value = code
      document.body.appendChild(area)
      area.select()
      document.execCommand('copy')
      area.remove()
      console.error(error)
    }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  return (
    <div className={`code-card ${diagram ? 'is-diagram' : ''} ${plainText ? 'is-text' : ''}`}>
      <div className="code-card-bar">
        {plainText ? null : (
          <span className="code-dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
        )}
        <span className="code-card-lang">{diagram ? 'схема' : resolved === 'text' ? '' : resolved}</span>
        <button
          className="code-copy"
          type="button"
          onClick={copy}
          aria-label={copied ? 'Скопировано' : 'Копировать код'}
          title={copied ? 'Скопировано' : 'Копировать'}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          <span>{copied ? 'Скопировано' : 'Копировать'}</span>
        </button>
      </div>
      <div className="code-card-body">
        {plainText ? null : (
          <ol className="code-gutter" aria-hidden="true">
            {lines.map((_, i) => (
              <li key={i}>{i + 1}</li>
            ))}
          </ol>
        )}
        <pre className="code-pre">
          <code>{highlighted}</code>
        </pre>
      </div>
    </div>
  )
}
