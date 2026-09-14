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
          Write
        </button>
        <button className={`tab ${tab === 'preview' ? 'active' : ''}`} onClick={() => setTab('preview')} type="button">
          Preview
        </button>
      </div>
      {tab === 'write' ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <div className="md-preview">
          <Markdown>{value || '_Empty_'}</Markdown>
        </div>
      )}
    </div>
  )
}
