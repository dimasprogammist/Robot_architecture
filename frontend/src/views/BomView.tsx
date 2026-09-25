import { useProjectStore } from '../store/useProjectStore'

export function BomView() {
  const project = useProjectStore((s) => s.project)!
  const rows = project.components.filter((c) => c.category === 'HARDWARE' || c.category === 'MECHANICS')
  return (
    <div className="page">
      <h1>BOM</h1>
      <p className="lede">Инженерный список hardware- и механических компонентов текущей семантической модели. Складской учёт не ведётся.</p>
      <table className="table">
        <thead>
          <tr>
            <th>Компонент</th>
            <th>Категория</th>
            <th>Производитель</th>
            <th>Артикул</th>
            <th>Кол-во</th>
            <th>Ед.</th>
            <th>Заметки</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((c) => (
            <tr key={c.id}>
              <td>{c.name}</td>
              <td>{c.category}</td>
              <td>{c.mechanical?.manufacturer || project.hardware.find((h) => h.id === c.hardware_id)?.manufacturer || ''}</td>
              <td>{c.mechanical?.part_number || ''}</td>
              <td>{c.mechanical?.quantity ?? 1}</td>
              <td>{c.mechanical?.unit || 'шт'}</td>
              <td>{c.mechanical?.notes || c.notes}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {!rows.length ? <p className="hint">Добавьте железо или механику на холст — строки появятся здесь.</p> : null}
    </div>
  )
}
