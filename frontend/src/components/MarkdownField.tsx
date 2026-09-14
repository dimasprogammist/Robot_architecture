import { useState } from 'react'
import Markdown from 'react-markdown'

export function MarkdownField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  const [tab, setTab] = useState<'write' | 'preview'>('write')
  return (
    <div className="field">
      <label>{label}</label>
      <div className="tabs">
        <button className={`tab ${tab === 'write' ? 'active' : ''}`} onClick={() => setTab('write')} type="button">
          Писать
        </button>
        <button className={`tab ${tab === 'preview' ? 'active' : ''}`} onClick={() => setTab('preview')} type="button">
          Просмотр
        </button>
      </div>
      {tab === 'write' ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <div className="md-preview">
          <Markdown>{value || '_Пусто_'}</Markdown>
        </div>
      )}
    </div>
  )
}
