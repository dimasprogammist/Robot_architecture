import { useMemo, useState } from 'react'
import { SearchField } from '../components/SearchField'
import { Star } from 'lucide-react'
import { MarkdownField } from '../components/MarkdownField'
import { AttachedFileRow } from '../components/InspectorExtras'
import { StlPreview } from '../components/StlPreview'
import { useProjectStore } from '../store/useProjectStore'
import { useUiStore } from '../store/useUiStore'
import { uid } from '../lib/ids'
import { BomView } from './BomView'
import { RequirementsView } from './RequirementsView'

export function DocumentsView() {
  const project = useProjectStore((s) => s.project)!
  const mutate = useProjectStore((s) => s.mutate)
  const tab = useUiStore((s) => s.docTab)
  const setTab = useUiStore((s) => s.setDocTab)
  const settings = useUiStore((s) => s.settings)
  const [preview, setPreview] = useState<string | null>(null)
  const [noteQuery, setNoteQuery] = useState('')
  const [fileQuery, setFileQuery] = useState('')
  const attached = project.components.flatMap((c) =>
    (c.files || []).map((file) => ({ file, component: c })),
  )
  const files = useMemo(() => {
    const needle = fileQuery.trim().toLowerCase()
    if (!needle) return attached
    return attached.filter(
      ({ file, component }) =>
        file.filename.toLowerCase().includes(needle) ||
        (file.description || '').toLowerCase().includes(needle) ||
        component.name.toLowerCase().includes(needle),
    )
  }, [attached, fileQuery])
  const notes = useMemo(() => {
    const needle = noteQuery.trim().toLowerCase()
    const items = project.documents.filter(
      (d) =>
        !needle ||
        d.title.toLowerCase().includes(needle) ||
        d.body.toLowerCase().includes(needle) ||
        (d.description || '').toLowerCase().includes(needle),
    )
    items.sort((a, b) => Number(Boolean(b.starred)) - Number(Boolean(a.starred)))
    return items
  }, [project.documents, noteQuery])
  return (
    <div className="page">
      <h1>Документы</h1>
      <p className="lede">Требования, заметки, файлы компонентов и спецификация.</p>
      <div className="tabs" style={{ marginBottom: 18 }}>
        {(
          [
            ['requirements', 'Требования'],
            ['notes', 'Заметки'],
            ['files', 'Прикреплённые файлы'],
            ['bom', 'Спецификация'],
          ] as const
        ).map(([id, label]) => (
          <button key={id} className={`tab ${tab === id ? 'active' : ''}`} type="button" onClick={() => setTab(id)}>
            {label}
          </button>
        ))}
      </div>
      {tab === 'requirements' ? <RequirementsView embedded /> : null}
      {tab === 'bom' ? <BomView embedded /> : null}
      {tab === 'files' ? (
        <div className="attached-files-page">
          <div className="req-toolbar">
            <SearchField placeholder="Поиск файлов" value={fileQuery} onChange={setFileQuery} />
          </div>
          {attached.length === 0 ? (
            <p className="hint">К компонентам пока не прикреплены файлы.</p>
          ) : files.length === 0 ? (
            <p className="hint">Нет файлов по запросу.</p>
          ) : (
            files.map(({ file, component }) => (
              <AttachedFileRow
                key={file.id}
                file={file}
                projectId={project.id}
                componentName={component.name}
                onPreview={setPreview}
              />
            ))
          )}
          {preview ? <StlPreview url={preview} /> : null}
        </div>
      ) : null}
      {tab === 'notes' ? (
        <>
      <div className="notes-toolbar">
        <SearchField placeholder="Поиск заметок" value={noteQuery} onChange={setNoteQuery} />
        <button
          className="btn primary"
          type="button"
          onClick={() =>
            mutate((p) => {
              p.documents.push({
                id: uid(),
                title: 'Без названия',
                body: '',
                component_id: null,
                protocol_id: null,
                kind: 'markdown',
                url: '',
                description: '',
                starred: false,
              })
            })
          }
        >
          Новая заметка
        </button>
      </div>
      <div className="notes-grid">
        {notes.length === 0 ? (
          <p className="hint">{noteQuery.trim() ? 'Нет заметок по запросу.' : 'Пока нет заметок.'}</p>
        ) : null}
        {notes.map((d) => (
          <article className="card" key={d.id}>
            <div className="note-card-head">
              <input
                value={d.title}
                onChange={(e) =>
                  mutate((p) => {
                    const x = p.documents.find((i) => i.id === d.id)
                    if (x) x.title = e.target.value
                  })
                }
                style={{ fontWeight: 600, fontSize: 16, border: 'none', background: 'transparent', width: '100%' }}
              />
              <button
                className={`icon-btn note-star ${d.starred ? 'on' : ''}`}
                type="button"
                title={d.starred ? 'Убрать из избранного' : 'Добавить в избранное'}
                aria-label={d.starred ? 'Убрать из избранного' : 'Добавить в избранное'}
                onClick={() =>
                  mutate((p) => {
                    const x = p.documents.find((i) => i.id === d.id)
                    if (x) x.starred = !x.starred
                  })
                }
              >
                <Star size={16} fill={d.starred ? 'currentColor' : 'none'} />
              </button>
            </div>
            <MarkdownField
              label="Текст"
              value={d.body}
              onChange={(v) =>
                mutate((p) => {
                  const x = p.documents.find((i) => i.id === d.id)
                  if (x) x.body = v
                })
              }
              extraActions={
                <button
                  className="tab tab-danger"
                  type="button"
                  onClick={() => {
                    if (settings.confirm_delete && !window.confirm(`Удалить заметку «${d.title}»?`)) return
                    mutate((p) => {
                      p.documents = p.documents.filter((item) => item.id !== d.id)
                    })
                  }}
                >
                  Удалить
                </button>
              }
            />
          </article>
        ))}
      </div>
        </>
      ) : null}
    </div>
  )
}
