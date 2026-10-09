import { SearchField } from '../../components/SearchField'
import { JOINT_TOOLS, KIND_LABEL, MECH_GROUPS } from '../../model/mechanics/catalog'
import type { MechJointKind, MechKind } from '../../model/mechanics/types'

export function MechanicsLibrary({
  query,
  onQuery,
  connectKind,
  onTool,
  onAdd,
}: {
  query: string
  onQuery: (v: string) => void
  connectKind: MechJointKind | null
  onTool: (kind: MechJointKind | null) => void
  onAdd: (kind: MechKind) => void
}) {
  const q = query.trim().toLowerCase()
  return (
    <aside className="library-rail mech-lib">
      <h3>Каталог механики</h3>
      <SearchField placeholder="Поиск элементов" value={query} onChange={onQuery} />
      <section className="lib-group">
        <p className="hint" style={{ margin: '8px 0 4px' }}>
          Шарниры и направляющие
        </p>
        {JOINT_TOOLS.filter((t) => !q || t.title.toLowerCase().includes(q)).map((tool) => (
          <button
            key={tool.id}
            type="button"
            className={`lib-item ${connectKind === tool.id ? 'on' : ''}`}
            title={tool.hint}
            onClick={() => onTool(connectKind === tool.id ? null : tool.id)}
          >
            {tool.title}
          </button>
        ))}
      </section>
      {MECH_GROUPS.filter((g) => g.kinds.length).map((group) => {
        const kinds = group.kinds.filter((k) => !q || KIND_LABEL[k].toLowerCase().includes(q) || k.includes(q))
        if (!kinds.length) return null
        return (
          <section className="lib-group" key={group.id}>
            <p className="hint" style={{ margin: '8px 0 4px' }}>
              {group.title}
            </p>
            {kinds.map((kind) => (
              <button key={kind} type="button" className="lib-item" onClick={() => onAdd(kind)}>
                {KIND_LABEL[kind]}
              </button>
            ))}
          </section>
        )
      })}
      <p className="hint">Сначала добавьте звенья, затем выберите тип соединения и кликните две точки крепления.</p>
    </aside>
  )
}
