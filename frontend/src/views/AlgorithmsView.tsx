import { useProjectStore } from '../store/useProjectStore'
import { useUiStore } from '../store/useUiStore'
import { AlgorithmCanvas } from '../components/canvas/AlgorithmCanvas'
import { uid } from '../lib/ids'

export function AlgorithmsView() {
  const project = useProjectStore((s) => s.project)!
  const selectedIds = useProjectStore((s) => s.selectedIds)
  const ensureAlgorithm = useProjectStore((s) => s.ensureAlgorithm)
  const select = useProjectStore((s) => s.select)
  const updateAlgorithm = useProjectStore((s) => s.updateAlgorithm)
  const setInspectorTab = useUiStore((s) => s.setInspectorTab)
  const setNav = useUiStore((s) => s.setNav)
  const alg =
    project.algorithms.find((a) => selectedIds.includes(a.component_id)) || project.algorithms[0]

  return (
    <div className="page" style={{ display: 'grid', gridTemplateRows: 'auto auto 1fr', height: '100%', paddingBottom: 16 }}>
      <h1>Алгоритмы</h1>
      <p className="lede">Поведение, шаги и конечные автоматы, привязанные к архитектурным блокам.</p>
      <div className="row" style={{ marginBottom: 12, flexWrap: 'wrap' }}>
        {project.algorithms.map((a) => {
          const owner = project.components.find((c) => c.id === a.component_id)
          return (
            <button
              key={a.id}
              className={`btn ${alg?.id === a.id ? 'primary' : ''}`}
              type="button"
              onClick={() => select([a.component_id])}
            >
              {a.name}
              <span className="hint"> · {owner?.name}</span>
            </button>
          )
        })}
        <button
          className="btn"
          type="button"
          onClick={() => {
            const c = project.components.find((x) => selectedIds.includes(x.id)) || project.components[0]
            if (!c) return
            ensureAlgorithm(c.id)
            select([c.id])
            setInspectorTab('algorithm')
          }}
        >
          Новый алгоритм
        </button>
      </div>
      {alg ? (
        <>
          <div className="row" style={{ marginBottom: 8 }}>
            <button
              className="btn"
              type="button"
              onClick={() =>
                updateAlgorithm(alg.id, {
                  canvas_nodes: [
                    ...alg.canvas_nodes,
                    { id: uid(), kind: 'action', label: 'Шаг', position: { x: 80 + alg.canvas_nodes.length * 20, y: 80 } },
                  ],
                })
              }
            >
              Добавить узел
            </button>
            <button
              className="btn ghost"
              type="button"
              onClick={() => {
                setNav('architecture')
                setInspectorTab('algorithm')
              }}
            >
              Редактировать детали
            </button>
          </div>
          <AlgorithmCanvas algorithmId={alg.id} />
        </>
      ) : (
        <p className="hint">Выберите компонент и создайте алгоритм.</p>
      )}
    </div>
  )
}
