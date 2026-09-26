import { useMemo } from 'react'
import { useProjectStore } from '../store/useProjectStore'
import { AlgorithmCanvas } from '../components/canvas/AlgorithmCanvas'
import type { Component, Project } from '../types'

function componentTree(project: Project) {
  const components = project.components.filter((c) => c.entity_kind !== 'table')
  const byId = new Map(components.map((c) => [c.id, c]))
  const parentOf = new Map<string, string | null>()
  for (const c of components) {
    const arch = project.architectures.find((a) => a.id === c.architecture_id)
    const parentId = arch?.parent_component_id || null
    parentOf.set(c.id, parentId && byId.has(parentId) ? parentId : null)
  }
  const children = new Map<string | null, Component[]>()
  for (const c of components) {
    const parent = parentOf.get(c.id) ?? null
    const list = children.get(parent) || []
    list.push(c)
    children.set(parent, list)
  }
  return children
}

export function AlgorithmsView() {
  const project = useProjectStore((s) => s.project)!
  const selectedIds = useProjectStore((s) => s.selectedIds)
  const ensureAlgorithm = useProjectStore((s) => s.ensureAlgorithm)
  const select = useProjectStore((s) => s.select)
  const updateAlgorithm = useProjectStore((s) => s.updateAlgorithm)
  const children = useMemo(() => componentTree(project), [project])
  const selected = project.components.find((c) => c.entity_kind !== 'table' && selectedIds.includes(c.id))
  const alg = selected ? project.algorithms.find((a) => a.component_id === selected.id) : undefined

  const renderLevel = (parent: string | null, depth: number) =>
    (children.get(parent) || [])
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name, 'ru'))
      .map((c) => (
        <div key={c.id}>
          <button
            className={`algo-tree-item ${selected?.id === c.id ? 'active' : ''}`}
            style={{ paddingLeft: 8 + depth * 14 }}
            type="button"
            onClick={() => {
              select([c.id])
              ensureAlgorithm(c.id)
            }}
          >
            {c.name}
          </button>
          {renderLevel(c.id, depth + 1)}
        </div>
      ))

  return (
    <div className="page algo-layout">
      <aside className="algo-tree">
        <h1>Алгоритмы</h1>
        <p className="lede">Алгоритм связан с каждым компонентом системы: от датчика и контроллера до сервера и исполнительного механизма.</p>
        {children.get(null)?.length ? renderLevel(null, 0) : <p className="hint">На холсте архитектуры пока нет компонентов.</p>}
      </aside>
      <div className="algo-canvas">
        {selected && alg ? (
          <>
            <div className="field" style={{ maxWidth: 420 }}>
              <label>Алгоритм · {selected.name}</label>
              <input value={alg.name} onChange={(e) => updateAlgorithm(alg.id, { name: e.target.value })} />
            </div>
            <AlgorithmCanvas algorithmId={alg.id} />
          </>
        ) : (
          <p className="lede">Выберите компонент слева — справа откроется его алгоритм и блок-схема.</p>
        )}
      </div>
    </div>
  )
}
