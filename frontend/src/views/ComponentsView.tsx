import { useState } from 'react'
import { ColorSwatches } from '../components/ColorSwatches'
import { IconPicker, TypeIcon } from '../components/TypeIcon'
import { CATEGORY_LABELS } from '../i18n'
import { applyPresetToInstances, emptyLibraryPreset, presetColor } from '../model/library'
import { useProjectStore } from '../store/useProjectStore'
import { useUiStore } from '../store/useUiStore'
import type { LibraryPreset } from '../types'

const STATUS_LABELS: Record<string, string> = {
  planned: 'Запланирован',
  active: 'Активен',
  deprecated: 'Устарел',
}

export function ComponentsView() {
  const project = useProjectStore((s) => s.project)
  const mutate = useProjectStore((s) => s.mutate)
  const addComponent = useProjectStore((s) => s.addComponent)
  const goToArchitecture = useProjectStore((s) => s.goToArchitecture)
  const select = useProjectStore((s) => s.select)
  const setNav = useUiStore((s) => s.setNav)
  const settings = useUiStore((s) => s.settings)
  const [editingId, setEditingId] = useState<string | null>(null)

  if (!project) return null
  const catalog = project.library_presets.filter((item) => item.category !== 'PROTOCOL')
  const catalogCategories = Object.keys(CATEGORY_LABELS).filter((id) => id !== 'PROTOCOL')
  const groupedCatalog = catalogCategories
    .map((category) => ({
      category,
      title: CATEGORY_LABELS[category] || category,
      items: catalog.filter((item) => item.category === category).sort((a, b) => a.name.localeCompare(b.name, 'ru')),
    }))
    .filter((group) => group.items.length > 0)
  const draft = catalog.find((item) => item.id === editingId)

  return (
    <div className="page catalog-page">
      <section className="settings-card">
        <h2
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 16,
            flexWrap: 'nowrap',
          }}
        >
          <span>Компоненты</span>
          <button
            className="btn primary"
            type="button"
            style={{ whiteSpace: 'nowrap' }}
            onClick={() =>
              addComponent({
                name: 'Новый компонент',
                type: 'Свой компонент',
                category: 'OTHER',
              })
            }
          >
            Добавить на канву
          </button>
        </h2>
        <table className="table">
          <thead>
            <tr>
              <th>Название</th>
              <th>Тип</th>
              <th>Технология</th>
              <th>Статус</th>
              <th>Владелец</th>
            </tr>
          </thead>
          <tbody>
            {project.components.map((c) => (
              <tr
                key={c.id}
                onClick={() => {
                  goToArchitecture(c.architecture_id)
                  select([c.id])
                  setNav('architecture')
                }}
              >
                <td>{c.name}</td>
                <td>{c.type}</td>
                <td>{c.technology}</td>
                <td>{STATUS_LABELS[c.status] || c.status}</td>
                <td>{c.owner}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="settings-card" style={{ marginTop: 24 }}>
        <h2
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 16,
            flexWrap: 'nowrap',
          }}
        >
          <span>Каталог железа</span>
          <button
            className="btn primary"
            type="button"
            style={{ whiteSpace: 'nowrap' }}
            onClick={() => {
              const next = emptyLibraryPreset()
              mutate((p) => {
                p.library_presets.push(next)
              })
              setEditingId(next.id || null)
            }}
          >
            Добавить компонент
          </button>
        </h2>
        <p className="hint">Единый каталог канвы. Изменения применяются к библиотеке и к уже добавленным компонентам этого типа.</p>
        {groupedCatalog.map((group) => (
          <section key={group.category} className="catalog-group">
            <h3 className="catalog-group-title">{group.title}</h3>
            <div className="catalog-grid">
              {group.items.map((item) => (
                <button
                  key={item.id || item.name}
                  className={`catalog-card ${editingId === item.id ? 'on' : ''}`}
                  type="button"
                  onClick={() => setEditingId(item.id || null)}
                >
                  <span className="catalog-card-accent" style={{ background: presetColor(item) }} />
                  <TypeIcon name={item.icon} size={16} />
                  <span className="catalog-card-body">
                    <strong>{item.name}</strong>
                    <span className="hint">
                      {item.type} · {CATEGORY_LABELS[item.category] || item.category}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </section>
        ))}
        {draft ? (
          <CatalogEditor
            preset={draft}
            onChange={(patch) =>
              mutate((p) => {
                const row = p.library_presets.find((item) => item.id === draft.id)
                if (!row) return
                const previous = { ...row }
                Object.assign(row, patch)
                applyPresetToInstances(p, row, previous)
              })
            }
            onDelete={() => {
              if (settings.confirm_delete && !window.confirm(`Удалить «${draft.name}» из каталога?`)) return
              mutate((p) => {
                p.library_presets = p.library_presets.filter((item) => item.id !== draft.id)
              })
              setEditingId(null)
            }}
            onClose={() => setEditingId(null)}
          />
        ) : (
          <p className="hint" style={{ marginTop: 12 }}>Выберите карточку, чтобы изменить конфигурацию.</p>
        )}
      </section>
    </div>
  )
}

function CatalogEditor({
  preset,
  onChange,
  onDelete,
  onClose,
}: {
  preset: LibraryPreset
  onChange: (patch: Partial<LibraryPreset>) => void
  onDelete: () => void
  onClose: () => void
}) {
  return (
    <div className="catalog-editor">
      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 12 }}>
        <strong>Конфигурация компонента</strong>
        <button className="btn ghost" type="button" onClick={onClose}>
          Закрыть
        </button>
      </div>
      <div className="catalog-editor-grid">
        <div className="field">
          <label>Название</label>
          <input value={preset.name} onChange={(e) => onChange({ name: e.target.value })} />
        </div>
        <div className="field">
          <label>Тип</label>
          <input value={preset.type} onChange={(e) => onChange({ type: e.target.value })} />
        </div>
        <div className="field">
          <label>Класс</label>
          <select value={preset.category} onChange={(e) => onChange({ category: e.target.value })}>
            {Object.entries(CATEGORY_LABELS)
              .filter(([id]) => id !== 'PROTOCOL')
              .map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
          </select>
        </div>
        <div className="field">
          <label>Иконка</label>
          <IconPicker value={preset.icon} onChange={(icon) => onChange({ icon })} />
        </div>
        <div className="field">
          <label>Технология</label>
          <input value={preset.technology || ''} onChange={(e) => onChange({ technology: e.target.value })} />
        </div>
        <div className="field">
          <label>Вид элемента</label>
          <select
            value={preset.entity_kind || 'component'}
            onChange={(e) => onChange({ entity_kind: e.target.value })}
          >
            <option value="component">Компонент</option>
            <option value="table">Таблица БД</option>
          </select>
        </div>
        <div className="field catalog-editor-color">
          <label>Цвет боковой линии</label>
          <ColorSwatches value={presetColor(preset)} onChange={(color) => onChange({ color })} compact={false} />
        </div>
      </div>
      {!preset.built_in ? (
        <button className="btn danger" type="button" style={{ marginTop: 12 }} onClick={onDelete}>
          Удалить
        </button>
      ) : null}
    </div>
  )
}
