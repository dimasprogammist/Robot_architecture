import { useEffect, useState } from 'react'
import { CodeEditor } from '../components/CodeEditor'
import { Toggle } from '../components/Toggle'
import { api } from '../lib/api'
import { useUiStore } from '../store/useUiStore'

type Catalog = Awaited<ReturnType<typeof api.exercises>>
type Item = Catalog['sections'][number]['items'][number]

export function ExercisesView() {
  const [data, setData] = useState<Catalog | null>(null)
  const [error, setError] = useState('')
  const storedSection = useUiStore((s) => s.exercisesSectionId)
  const setStoredSection = useUiStore((s) => s.setExercisesSectionId)
  const tutorialLessonId = useUiStore((s) => s.tutorialLessonId)
  const setNav = useUiStore((s) => s.setNav)
  const [sectionId, setSectionId] = useState(storedSection || 'python')

  const load = () =>
    api
      .exercises()
      .then((d) => {
        setData(d)
        setError('')
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Не удалось загрузить задачник'))

  useEffect(() => {
    load()
  }, [])

  useEffect(() => {
    if (storedSection) setSectionId(storedSection)
  }, [storedSection])

  const section = data?.sections.find((s) => s.id === sectionId) || data?.sections[0]
  const done = new Set(data?.completed_ids || [])

  return (
    <div className="page learning-page exercises-page">
      <aside className="learning-nav">
        <h1>Задачник</h1>
        <p className="lede" style={{ maxWidth: 'none' }}>
          Практические разделы. Код Python и SQL выполняется в ограниченной среде. C++ — только при наличии компилятора.
        </p>
        {error ? <p className="hint">{error}</p> : null}
        <p className="hint">{data ? `${data.done} / ${data.total} заданий` : 'Загрузка…'}</p>
        {(data?.sections || []).map((s) => {
          const total = s.items.length
          const got = s.items.filter((i) => done.has(i.id)).length
          const open = section?.id === s.id
          return (
            <section key={s.id} className="learning-cat">
              <button
                className={`learning-cat-btn learning-leaf-btn ${open ? 'is-active' : ''}`}
                type="button"
                onClick={() => {
                  setSectionId(s.id)
                  setStoredSection(s.id)
                }}
              >
                <span>{s.title}</span>
                <span className="hint">
                  {got}/{total}
                </span>
              </button>
            </section>
          )
        })}
      </aside>
      <article className="learning-article exercises-article">
        {tutorialLessonId ? (
          <p className="hint">
            <button
              className="btn ghost"
              type="button"
              onClick={() => setNav('tutorial')}
            >
              Вернуться к уроку
            </button>
          </p>
        ) : null}
        {section ? (
          <>
            <h1>{section.title}</h1>
            <p className="hint">{section.intro}</p>
            <div className="exercises-stack">
              {section.items.map((item, idx) => (
                <ExerciseCard
                  key={item.id}
                  item={item}
                  index={idx}
                  done={done.has(item.id)}
                  state={data?.states?.[item.id]}
                  onReload={load}
                />
              ))}
            </div>
          </>
        ) : (
          <p className="lede">Выберите раздел слева.</p>
        )}
      </article>
    </div>
  )
}

function ExerciseCard({
  item,
  index,
  done,
  state,
  onReload,
}: {
  item: Item
  index: number
  done: boolean
  state: Catalog['states'][string] | undefined
  onReload: () => void
}) {
  const draft = state?.draft || item.starter || ''
  const [option, setOption] = useState(item.kind === 'choice' && item.options?.some((o) => o.id === draft) ? draft : '')
  const [options, setOptions] = useState(item.kind === 'multi' && draft ? draft.split(',').filter(Boolean) : [])
  const [text, setText] = useState(item.kind === 'text' || item.kind === 'math' ? draft : '')
  const [code, setCode] = useState(item.kind === 'code' || item.kind === 'sql' ? draft : '')
  const [revealedHints, setRevealedHints] = useState<string[]>([])
  const [hintsOpen, setHintsOpen] = useState(false)
  const [result, setResult] = useState<{
    ok: boolean
    message: string
    explain: string
    output?: string
    error?: string
    available?: boolean
  } | null>(null)
  const hintCount = item.hint_count ?? (item.hints?.length || (item.hint ? 1 : 0))

  useEffect(() => {
    setResult(null)
    setHintsOpen(false)
    setRevealedHints([])
    const next = state?.draft || item.starter || ''
    if (item.kind === 'choice') {
      setOption(item.options?.some((o) => o.id === next) ? next : '')
      setOptions([])
      setText('')
      setCode('')
    } else if (item.kind === 'multi') {
      setOption('')
      setOptions(next ? next.split(',').filter(Boolean) : [])
      setText('')
      setCode('')
    } else if (item.kind === 'code' || item.kind === 'sql') {
      setCode(next)
      setText('')
      setOption('')
      setOptions([])
    } else {
      setText(next)
      setCode('')
      setOption('')
      setOptions([])
    }
  }, [item.id])

  const persistDraft = (value: string) => {
    api.exerciseDraft(item.id, value)
  }

  const submit = async () => {
    const body =
      item.kind === 'choice'
        ? { option }
        : item.kind === 'multi'
          ? { options }
          : item.kind === 'code' || item.kind === 'sql'
            ? { code }
            : { text }
    const res = await api.exerciseCheck(item.id, body)
    setResult({
      ok: res.ok,
      message: res.message,
      explain: res.explain,
      output: res.output,
      error: res.error,
      available: res.available,
    })
    onReload()
  }

  return (
    <section className="exercise-block">
      <h2>
        {index + 1}. {item.title}
        <span className="hint">
          {' '}
          · уровень {item.level} · {item.kind}
          {item.lang ? `/${item.lang}` : ''}
        </span>
      </h2>
      <p>{item.prompt}</p>
      <Toggle
        label={done ? 'Отмечено выполненным' : 'Отметить выполненным'}
        checked={done}
        onChange={(v) => {
          api.exerciseComplete(item.id, v).then(onReload)
        }}
      />
      {item.kind === 'choice' ? (
        <ul className="exercises-options">
          {(item.options || []).map((o) => (
            <li key={o.id}>
              <label>
                <input
                  type="radio"
                  name={`ex-${item.id}`}
                  checked={option === o.id}
                  onChange={() => {
                    setOption(o.id)
                    persistDraft(o.id)
                    setResult(null)
                  }}
                />
                {o.text}
              </label>
            </li>
          ))}
        </ul>
      ) : null}
      {item.kind === 'multi' ? (
        <ul className="exercises-options">
          {(item.options || []).map((o) => (
            <li key={o.id}>
              <label>
                <input
                  type="checkbox"
                  checked={options.includes(o.id)}
                  onChange={() => {
                    const next = options.includes(o.id) ? options.filter((x) => x !== o.id) : [...options, o.id]
                    setOptions(next)
                    persistDraft(next.join(','))
                    setResult(null)
                  }}
                />
                {o.text}
              </label>
            </li>
          ))}
        </ul>
      ) : null}
      {item.kind === 'text' || item.kind === 'math' ? (
        <div className="field">
          <label>Ответ</label>
          <input
            value={text}
            onChange={(e) => {
              setText(e.target.value)
              setResult(null)
            }}
            onBlur={() => persistDraft(text)}
          />
        </div>
      ) : null}
      {item.kind === 'code' || item.kind === 'sql' ? (
        <div className="field">
          <label>{item.kind === 'sql' ? 'SQL' : `Код (${item.lang || 'text'})`}</label>
          <CodeEditor
            value={code}
            lang={item.lang || item.kind}
            rows={12}
            label={item.kind === 'sql' ? 'SQL' : item.lang || 'код'}
            onChange={(next) => {
              setCode(next)
              setResult(null)
            }}
            onBlur={() => persistDraft(code)}
          />
          {item.run_note ? <p className="hint">{item.run_note}</p> : null}
          {!item.runnable && item.lang === 'cpp' ? (
            <p className="hint">Запуск C++ зависит от компилятора на сервере. Кнопка не показывает выдуманный вывод.</p>
          ) : null}
        </div>
      ) : null}
      <div className="exercises-actions">
        <button
          className="btn primary"
          type="button"
          onClick={submit}
          disabled={
            item.kind === 'choice'
              ? !option
              : item.kind === 'multi'
                ? options.length === 0
                : item.kind === 'code' || item.kind === 'sql'
                  ? !code.trim()
                  : !text.trim()
          }
        >
          {item.kind === 'code' || item.kind === 'sql' ? 'Запустить и проверить' : 'Проверить'}
        </button>
        {hintCount ? (
          <button
            className="btn"
            type="button"
            onClick={() => {
              const more = revealedHints.length < hintCount
              if (hintsOpen && !more) {
                setHintsOpen(false)
                return
              }
              if (hintsOpen && more) {
                api.exerciseHint(item.id).then((h) => {
                  setRevealedHints(h.hints || [])
                  setHintsOpen(true)
                  onReload()
                })
                return
              }
              if (!hintsOpen && revealedHints.length) {
                setHintsOpen(true)
                return
              }
              api.exerciseHint(item.id).then((h) => {
                setRevealedHints(h.hints || [])
                setHintsOpen(true)
                onReload()
              })
            }}
          >
            {hintsOpen && revealedHints.length < hintCount
              ? 'Ещё подсказка'
              : hintsOpen
                ? 'Скрыть подсказку'
                : 'Показать подсказку'}
          </button>
        ) : null}
      </div>
      {hintsOpen && revealedHints.length ? (
        <ol className="exercises-hints">
          {revealedHints.map((h, i) => (
            <li key={i}>{h}</li>
          ))}
        </ol>
      ) : null}
      {result ? (
        <div className={`card ${result.ok ? 'is-ok' : ''}`} style={{ marginTop: 16 }}>
          <p>
            <strong>{result.message}</strong>
          </p>
          {result.output ? <pre className="code-out">{result.output}</pre> : null}
          {result.error ? <pre className="code-out is-err">{result.error}</pre> : null}
          {result.explain ? <p className="hint">{result.explain}</p> : null}
          {result.ok && state?.passed ? <p className="hint">Автопроверка пройдена.</p> : null}
          {state?.manual && !state?.passed ? <p className="hint">Отмечено вручную, без прохождения автотестов.</p> : null}
        </div>
      ) : null}
    </section>
  )
}
