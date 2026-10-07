const FUTURE_CATEGORIES = [
  'Фундамент',
  'Математика',
  'Python',
  'Сети и протоколы',
  'Архитектура',
  'Робототехника',
]

export function ExercisesView() {
  return (
    <div className="page exercises-page">
      <div className="exercises-scroll">
      <h1>Задачник</h1>
      <p className="lede">
        Задания будут связаны с уроками учебника: тема, решение и прогресс. Сейчас
        здесь только каркас страницы.
      </p>
      <div className="exercises-layout">
        <aside>
          <div className="nav-label" style={{ marginBottom: 8 }}>
            Категории
          </div>
          <div className="exercises-cats">
            {FUTURE_CATEGORIES.map((name) => (
              <button key={name} className="exercises-cat" type="button" aria-disabled="true">
                {name}
              </button>
            ))}
          </div>
        </aside>
        <div className="empty" style={{ height: 'auto', minHeight: 280, border: '1px dashed var(--line)', borderRadius: 'var(--radius)' }}>
          <h2>Задач пока нет</h2>
          <p>
            Выберите урок в учебнике — задания по теме появятся здесь, когда раздел будет
            подключён.
          </p>
        </div>
      </div>
      </div>
    </div>
  )
}
