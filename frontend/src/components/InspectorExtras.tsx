import { useState } from 'react'
import { uid } from '../lib/ids'
import { MarkdownField } from './MarkdownField'
import { StlPreview } from './StlPreview'
import { useProjectStore } from '../store/useProjectStore'
import { api } from '../lib/api'
import { emptyMechanical, emptyPrint, emptyTable } from '../model/defaults'
import type { Component, DocumentationItem, TableColumn } from '../types'

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
  const types = ['TEXT', 'INTEGER', 'BIGINT', 'BOOLEAN', 'REAL', 'TIMESTAMP', 'UUID', 'JSON']
  return (
    <div>
      <div className="field">
        <label>Название</label>
        <input value={component.name} onChange={(e) => updateComponent(component.id, { name: e.target.value })} />
      </div>
      <div className="field">
        <label>Описание</label>
        <input value={component.description} onChange={(e) => updateComponent(component.id, { description: e.target.value })} />
      </div>
      <div className="col-table-wrap">
        <table className="col-table">
          <thead>
            <tr>
              <th>Колонка</th>
              <th>Тип</th>
              <th title="Пустое значение допустимо">Пусто</th>
              <th title="Первичный ключ">Ключ</th>
              <th>По умолчанию</th>
              <th>Связь</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {table.columns.map((col) => (
              <tr key={col.id} className={col.id === activeId ? 'active' : ''} onClick={() => setActiveId(col.id)}>
                <td><input value={col.name} onChange={(e) => patchCol(col.id, { name: e.target.value })} /></td>
                <td>
                  <select value={types.includes(col.type) ? col.type : col.type} onChange={(e) => patchCol(col.id, { type: e.target.value })}>
                    {types.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                    {types.includes(col.type) ? null : <option value={col.type}>{col.type}</option>}
                  </select>
                </td>
                <td><input type="checkbox" checked={col.nullable} title="Можно не заполнять" onChange={(e) => patchCol(col.id, { nullable: e.target.checked, primary_key: e.target.checked ? false : col.primary_key })} /></td>
                <td><input type="checkbox" checked={col.primary_key} title="Первичный ключ" onChange={(e) => patchCol(col.id, { primary_key: e.target.checked, nullable: e.target.checked ? false : col.nullable })} /></td>
                <td><input value={col.default} onChange={(e) => patchCol(col.id, { default: e.target.value })} /></td>
                <td><input value={col.foreign_key} placeholder="таблица.колонка" onChange={(e) => patchCol(col.id, { foreign_key: e.target.value })} /></td>
                <td><button className="btn ghost" type="button" title="Удалить колонку" onClick={() => set({ ...table, columns: table.columns.filter((c) => c.id !== col.id) })}>×</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button className="btn" type="button" onClick={addCol}>Добавить колонку</button>
      {active ? (
        <details className="prop-extra" open>
          <summary>Колонка «{active.name}»</summary>
          <label className="row">
            <input type="checkbox" checked={active.unique} onChange={(e) => patchCol(active.id, { unique: e.target.checked })} />
            Уникальные значения
          </label>
          <div className="field">
            <label>Комментарий</label>
            <input value={active.description} onChange={(e) => patchCol(active.id, { description: e.target.value })} />
          </div>
        </details>
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
      <input
        type="file"
        accept=".stl,.step,.stp,.obj,.pdf,.md"
        onChange={async (e) => {
          const file = e.target.files?.[0]
          if (!file) return
          const meta = await api.uploadFile(project.id, file, component.id)
          updateComponent(component.id, { files: [...(component.files || []), { ...meta, component_id: component.id }] })
        }}
      />
      {(component.files || []).map((f) => (
        <div key={f.id} className="row" style={{ marginTop: 8 }}>
          <span>{f.filename}</span>
          {f.kind === 'stl' ? (
            <button className="btn" type="button" onClick={() => setPreview(f.id)}>Просмотр STL</button>
          ) : null}
        </div>
      ))}
      {preview ? <StlPreview url={`/api/projects/${project.id}/files/${preview}`} /> : null}
    </div>
  )
}
