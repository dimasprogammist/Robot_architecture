import { useState } from 'react'
import { uid } from '../lib/ids'
import { MarkdownField } from './MarkdownField'
import { StlPreview } from './StlPreview'
import { Toggle } from './Toggle'
import { useProjectStore } from '../store/useProjectStore'
import { api } from '../lib/api'
import { emptyMechanical, emptyPrint, emptyTable } from '../model/defaults'
import type { AttachedFile, Component, DocumentationItem, TableColumn } from '../types'

export function fileExt(filename: string) {
  const i = filename.lastIndexOf('.')
  return i >= 0 ? filename.slice(i + 1).toUpperCase() : ''
}

export function projectFileUrl(projectId: string, fileId: string) {
  return `/api/projects/${projectId}/files/${fileId}`
}

const INLINE_EXTS = new Set(['pdf', 'png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'txt', 'md', 'json', 'csv'])

export async function openAttachedFile(projectId: string, file: AttachedFile, onPreview?: (url: string) => void) {
  const ext = fileExt(file.filename).toLowerCase()
  const blob = await api.fileBlob(projectId, file.id)
  const url = URL.createObjectURL(blob)
  if ((file.kind === 'stl' || ext === 'stl') && onPreview) {
    onPreview(url)
    return
  }
  if (file.kind === 'pdf' || INLINE_EXTS.has(ext) || blob.type.startsWith('image/') || blob.type === 'application/pdf') {
    window.open(url, '_blank', 'noopener,noreferrer')
    return
  }
  const link = document.createElement('a')
  link.href = url
  link.download = file.filename
  link.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
}

export function DocsPanel({ component }: { component: Component }) {
  const updateComponent = useProjectStore((s) => s.updateComponent)
  const add = (kind: string) => {
    const item: DocumentationItem = {
      id: uid(),
      title:
        kind === 'link' || kind === 'official'
          ? 'Официальная документация'
          : kind === 'datasheet'
            ? 'Datasheet'
              : kind === 'manual'
              ? 'Руководство'
              : kind === 'pdf'
                ? 'PDF'
                : 'Заметка',
      kind,
      url: '',
      body: '',
      description: '',
      component_id: component.id,
      protocol_id: component.protocol_id,
    }
    updateComponent(component.id, { docs: [...(component.docs || []), item] })
  }
  const patch = (id: string, next: Partial<DocumentationItem>) => {
    updateComponent(component.id, {
      docs: (component.docs || []).map((d) => (d.id === id ? { ...d, ...next } : d)),
    })
  }
  return (
    <div>
      <p className="hint">Документы привязаны к этому блоку и видны в экспорте по желанию.</p>
      <div className="row" style={{ flexWrap: 'wrap', marginBottom: 10 }}>
        <button className="btn" type="button" onClick={() => add('markdown')}>Markdown</button>
        <button className="btn" type="button" onClick={() => add('link')}>Ссылка</button>
        <button className="btn" type="button" onClick={() => add('official')}>Официальная</button>
        <button className="btn" type="button" onClick={() => add('manual')}>Руководство</button>
        <button className="btn" type="button" onClick={() => add('pdf')}>PDF / файл</button>
      </div>
      {(component.docs || []).map((d) => (
        <div key={d.id} className="field">
          <input value={d.title} onChange={(e) => patch(d.id, { title: e.target.value })} />
          {d.kind === 'link' || d.kind === 'datasheet' || d.kind === 'official' || d.kind === 'manual' || d.kind === 'pdf' ? (
            <input placeholder="https://" value={d.url} onChange={(e) => patch(d.id, { url: e.target.value })} />
          ) : (
            <MarkdownField label="" value={d.body} onChange={(v) => patch(d.id, { body: v })} />
          )}
          <input placeholder="Описание" value={d.description} onChange={(e) => patch(d.id, { description: e.target.value })} />
        </div>
      ))}
    </div>
  )
}

export function MechPanel({ component }: { component: Component }) {
  const updateComponent = useProjectStore((s) => s.updateComponent)
  const m = component.mechanical || emptyMechanical()
  const set = (patch: Partial<typeof m>) => updateComponent(component.id, { mechanical: { ...m, ...patch } })
  const setPrint = (patch: Partial<typeof m.print>) =>
    updateComponent(component.id, { mechanical: { ...m, print: { ...(m.print || emptyPrint()), ...patch } } })
  return (
    <div>
      <div className="field"><label>Материал</label><input value={m.material} onChange={(e) => set({ material: e.target.value })} /></div>
      <div className="field"><label>Размеры</label><input value={m.dimensions} onChange={(e) => set({ dimensions: e.target.value })} /></div>
      <div className="field"><label>Масса</label><input value={m.weight} onChange={(e) => set({ weight: e.target.value })} /></div>
      <div className="field"><label>Количество</label><input type="number" value={m.quantity} onChange={(e) => set({ quantity: Number(e.target.value) || 1 })} /></div>
      <div className="field"><label>Ед.</label><input value={m.unit} onChange={(e) => set({ unit: e.target.value })} /></div>
      <div className="field"><label>Производитель</label><input value={m.manufacturer} onChange={(e) => set({ manufacturer: e.target.value })} /></div>
      <div className="field"><label>Артикул</label><input value={m.part_number} onChange={(e) => set({ part_number: e.target.value })} /></div>
      <p className="hint">3D-печать (необязательно)</p>
      <div className="field"><label>Сопло</label><input value={m.print.nozzle_size} onChange={(e) => setPrint({ nozzle_size: e.target.value })} /></div>
      <div className="field"><label>Слой</label><input value={m.print.layer_height} onChange={(e) => setPrint({ layer_height: e.target.value })} /></div>
      <div className="field"><label>Материал печати</label><input value={m.print.material} onChange={(e) => setPrint({ material: e.target.value })} /></div>
      <div className="field"><label>Заполнение</label><input value={m.print.infill} onChange={(e) => setPrint({ infill: e.target.value })} /></div>
      <div className="field"><label>Поддержки</label><input value={m.print.supports} onChange={(e) => setPrint({ supports: e.target.value })} /></div>
      <div className="field"><label>Ориентация</label><input value={m.print.print_orientation} onChange={(e) => setPrint({ print_orientation: e.target.value })} /></div>
      <div className="field"><label>Принтер</label><input value={m.print.printer} onChange={(e) => setPrint({ printer: e.target.value })} /></div>
      <div className="field"><label>Свои поля (ключ: значение)</label>
        <textarea
          value={Object.entries(m.extra_fields || {}).map(([k, v]) => `${k}: ${v}`).join('\n')}
          onChange={(e) => {
            const extra_fields: Record<string, string> = {}
            for (const line of e.target.value.split('\n')) {
              const i = line.indexOf(':')
              if (i === -1) continue
              extra_fields[line.slice(0, i).trim()] = line.slice(i + 1).trim()
            }
            set({ extra_fields })
          }}
        />
      </div>
    </div>
  )
}

export function TablePanel({ component }: { component: Component }) {
  const updateComponent = useProjectStore((s) => s.updateComponent)
  const table = component.table || emptyTable()
  const [activeId, setActiveId] = useState<string | null>(table.columns[0]?.id ?? null)
  const set = (next: typeof table) => updateComponent(component.id, { table: next, entity_kind: 'table' })
  const addCol = () => {
    const col: TableColumn = {
      id: uid(),
      name: 'column',
      type: 'TEXT',
      nullable: true,
      default: '',
      primary_key: false,
      unique: false,
      foreign_key: '',
      description: '',
    }
    set({ ...table, columns: [...table.columns, col] })
    setActiveId(col.id)
  }
  const active = table.columns.find((c) => c.id === activeId) || null
  const patchCol = (id: string, patch: Partial<TableColumn>) =>
    set({ ...table, columns: table.columns.map((c) => (c.id === id ? { ...c, ...patch } : c)) })
  const types = [
    'INT',
    'INTEGER',
    'BIGINT',
    'SMALLINT',
    'TINYINT',
    'DECIMAL',
    'NUMERIC',
    'FLOAT',
    'REAL',
    'DOUBLE',
    'BOOLEAN',
    'BIT',
    'CHAR',
    'VARCHAR',
    'TEXT',
    'DATE',
    'TIME',
    'DATETIME',
    'TIMESTAMP',
    'BINARY',
    'VARBINARY',
    'BLOB',
    'JSON',
    'UUID',
  ]
  return (
    <div className="table-inspector">
      <div className="field">
        <label>Описание</label>
        <textarea value={component.description} onChange={(e) => updateComponent(component.id, { description: e.target.value })} />
      </div>
      <div className="col-list">
        {table.columns.map((col) => (
          <button
            key={col.id}
            type="button"
            className={`col-list-item ${col.id === activeId ? 'active' : ''}`}
            onClick={() => setActiveId(col.id)}
          >
            <span>{col.name || 'колонка'}</span>
            <span className="hint">{col.type}</span>
          </button>
        ))}
      </div>
      <button className="btn" type="button" onClick={addCol}>Добавить колонку</button>
      {active ? (
        <div className="col-editor">
          <p className="prop-kicker">Колонка</p>
          <div className="field">
            <label>Имя</label>
            <input value={active.name} onChange={(e) => patchCol(active.id, { name: e.target.value })} />
          </div>
          <div className="field">
            <label>Тип</label>
            <select value={types.includes(active.type) ? active.type : active.type} onChange={(e) => patchCol(active.id, { type: e.target.value })}>
              {types.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
              {types.includes(active.type) ? null : <option value={active.type}>{active.type}</option>}
            </select>
          </div>
          <div className="field">
            <label>По умолчанию</label>
            <input value={active.default} onChange={(e) => patchCol(active.id, { default: e.target.value })} />
          </div>
          <div className="field">
            <label>Связь</label>
            <input value={active.foreign_key} placeholder="таблица.колонка" onChange={(e) => patchCol(active.id, { foreign_key: e.target.value })} />
          </div>
          <div className="field">
            <label>Комментарий</label>
            <input value={active.description} onChange={(e) => patchCol(active.id, { description: e.target.value })} />
          </div>
          <div className="table-toggles">
          <Toggle
            label="Можно не заполнять"
            checked={active.nullable}
            onChange={(v) => patchCol(active.id, { nullable: v, primary_key: v ? false : active.primary_key })}
          />
          <Toggle
            label="Первичный ключ"
            checked={active.primary_key}
            onChange={(v) => patchCol(active.id, { primary_key: v, nullable: v ? false : active.nullable })}
          />
          <Toggle
            label="Уникальные значения"
            checked={active.unique}
            onChange={(v) => patchCol(active.id, { unique: v })}
          />
          </div>
          <button
            className="btn danger"
            type="button"
            onClick={() => {
              set({ ...table, columns: table.columns.filter((c) => c.id !== active.id) })
              setActiveId(table.columns.find((c) => c.id !== active.id)?.id ?? null)
            }}
          >
            Удалить колонку
          </button>
        </div>
      ) : null}
    </div>
  )
}

export function FilesPanel({ component }: { component: Component }) {
  const project = useProjectStore((s) => s.project)!
  const updateComponent = useProjectStore((s) => s.updateComponent)
  const [preview, setPreview] = useState<string | null>(null)
  return (
    <div>
      <label className="btn">
        Добавить файл
        <input
          type="file"
          hidden
          accept=".stl,.step,.stp,.obj,.pdf,.md"
          onChange={async (e) => {
            const file = e.target.files?.[0]
            if (!file) return
            const meta = await api.uploadFile(project.id, file, component.id)
            updateComponent(component.id, { files: [...(component.files || []), { ...meta, component_id: component.id }] })
            e.target.value = ''
          }}
        />
      </label>
      {(component.files || []).map((f) => (
        <AttachedFileRow
          key={f.id}
          file={f}
          projectId={project.id}
          onPreview={setPreview}
        />
      ))}
      {preview ? <StlPreview url={preview} /> : null}
    </div>
  )
}

export function AttachedFileRow({
  file,
  projectId,
  componentName,
  onPreview,
}: {
  file: AttachedFile
  projectId: string
  componentName?: string
  onPreview?: (id: string) => void
}) {
  const ext = fileExt(file.filename) || file.kind
  return (
    <div className="row attached-file-row">
      <button
        className="btn ghost attached-file-open"
        type="button"
        title={file.filename}
        onClick={() => {
          void openAttachedFile(projectId, file, onPreview).catch((error) => {
            window.alert(error instanceof Error ? error.message : 'Не удалось открыть файл')
          })
        }}
      >
        <span className="attached-file-name">{file.filename}</span>
        {componentName ? <span className="hint">{componentName}</span> : null}
        {ext ? <span className="tag">{ext}</span> : null}
      </button>
    </div>
  )
}
