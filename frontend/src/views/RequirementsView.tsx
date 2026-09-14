import { useState } from 'react'
import { useProjectStore } from '../store/useProjectStore'
import { useUiStore } from '../store/useUiStore'

export function RequirementsView() {
  const project = useProjectStore((s) => s.project)!
  const addRequirement = useProjectStore((s) => s.addRequirement)
  const updateRequirement = useProjectStore((s) => s.updateRequirement)
  const deleteRequirement = useProjectStore((s) => s.deleteRequirement)
  const select = useProjectStore((s) => s.select)
  const goToArchitecture = useProjectStore((s) => s.goToArchitecture)
  const setNav = useUiStore((s) => s.setNav)
  const [text, setText] = useState('Робот должен работать офлайн.')

  return (
    <div className="page">
      <h1>Требования</h1>
      <p className="lede">Ограничения, которые можно связать с компонентами и соединениями.</p>
      <div className="create-bar">
        <input
          value={text}
          placeholder="Робот должен работать офлайн."
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              if (!text.trim()) return
              addRequirement(text.trim())
              setText('')
            }
          }}
        />
        <button
          className="btn primary"
          type="button"
          onClick={() => {
            if (!text.trim()) return
            addRequirement(text.trim())
            setText('')
          }}
        >
          Добавить
        </button>
      </div>
      <table className="table">
        <thead>
          <tr>
            <th>Код</th>
            <th>Текст</th>
            <th>Приоритет</th>
            <th>Связи</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {project.requirements.map((r) => (
            <tr key={r.id}>
              <td>{r.code}</td>
              <td>
                <input value={r.text} onChange={(e) => updateRequirement(r.id, { text: e.target.value })} />
              </td>
              <td>
                <select value={r.priority} onChange={(e) => updateRequirement(r.id, { priority: e.target.value })}>
                  <option value="must">обязательно</option>
                  <option value="should">желательно</option>
                  <option value="could">можно</option>
                </select>
              </td>
              <td>
                {r.component_ids.map((id) => {
                  const c = project.components.find((x) => x.id === id)
                  return (
                    <button
                      key={id}
                      className="tag"
                      type="button"
                      onClick={() => {
                        if (!c) return
                        goToArchitecture(c.architecture_id)
                        select([c.id])
                        setNav('architecture')
                      }}
                    >
                      {c?.name || id}
                    </button>
                  )
                })}
                <select
                  value=""
                  onChange={(e) => {
                    const id = e.target.value
                    if (!id) return
                    updateRequirement(r.id, { component_ids: Array.from(new Set([...r.component_ids, id])) })
                  }}
                >
                  <option value="">Связать компонент…</option>
                  {project.components.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </td>
              <td>
                <button className="btn ghost danger" type="button" onClick={() => deleteRequirement(r.id)}>
                  Удалить
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
