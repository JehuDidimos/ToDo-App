import { useCallback, useEffect, useState } from 'react'
import './App.css'
import { EnterNewTaskForm } from './components/EnterNewTaskForm'
import { OverviewStatus } from './components/OverviewStatus'
import { TaskList } from './components/TaskList'
import { ApiError } from './services/apiClient'
import { createTask, deleteTask, listTasks, updateTask, type ApiTask } from './services/tasksApi'
import type { Todo } from './types/todo'

type Cmyk = {
  c: number
  m: number
  y: number
  k: number
}

type Rgb = {
  r: number
  g: number
  b: number
}

function mapApiTaskToTodo(task: ApiTask): Todo {
  return {
    id: task.id,
    text: task.title,
    completed: task.completed,
    createdAt: task.createdAt,
  }
}

function describeError(err: unknown): string {
  if (err instanceof ApiError) return err.message
  if (err instanceof Error) return err.message
  return 'Something went wrong'
}

function cmykToRgb(cmyk: Cmyk): Rgb {
  const c = cmyk.c / 100
  const m = cmyk.m / 100
  const y = cmyk.y / 100
  const k = cmyk.k / 100

  return {
    r: Math.round(255 * (1 - c) * (1 - k)),
    g: Math.round(255 * (1 - m) * (1 - k)),
    b: Math.round(255 * (1 - y) * (1 - k)),
  }
}

const cmykSliderConfig: Array<{ key: keyof Cmyk; label: string }> = [
  { key: 'c', label: 'C' },
  { key: 'm', label: 'M' },
  { key: 'y', label: 'Y' },
  { key: 'k', label: 'K' },
]

function App() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [newText, setNewText] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingText, setEditingText] = useState('')
  const [editingOriginalText, setEditingOriginalText] = useState('')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [cmyk, setCmyk] = useState<Cmyk>({ c: 48, m: 28, y: 0, k: 14 })

  const [isLoadingList, setIsLoadingList] = useState(true)
  const [isMutating, setIsMutating] = useState(false)
  const [pendingIds, setPendingIds] = useState<Set<number>>(() => new Set())
  const [error, setError] = useState<string | null>(null)

  const hasTodos = todos.length > 0
  const remainingCount = todos.reduce((acc, t) => acc + (t.completed ? 0 : 1), 0)
  const focusTodo = todos.find((t) => !t.completed) ?? null
  const otherTodos = focusTodo ? todos.filter((t) => t.id !== focusTodo.id) : todos
  const previewRgb = cmykToRgb(cmyk)

  useEffect(() => {
    if (!isMenuOpen) return

    function onWindowKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsMenuOpen(false)
      }
    }

    window.addEventListener('keydown', onWindowKeyDown)
    return () => window.removeEventListener('keydown', onWindowKeyDown)
  }, [isMenuOpen])

  function clearEditingState() {
    setEditingId(null)
    setEditingText('')
    setEditingOriginalText('')
  }

  async function withPendingId(id: number, fn: () => Promise<void>) {
    setPendingIds((prev) => {
      const next = new Set(prev)
      next.add(id)
      return next
    })

    try {
      await fn()
    } finally {
      setPendingIds((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }
  }

  function isTodoBusy(id: number) {
    return pendingIds.has(id) || isMutating
  }

  const loadTodos = useCallback(async () => {
    setIsLoadingList(true)
    setError(null)
    try {
      const tasks = await listTasks()
      setTodos(tasks.map(mapApiTaskToTodo))
    } catch (err) {
      setError(describeError(err))
    } finally {
      setIsLoadingList(false)
    }
  }, [])

  useEffect(() => {
    void loadTodos()
  }, [loadTodos])

  async function recoverFromMutationError(err: unknown) {
    setError(describeError(err))
    await loadTodos()
  }

  async function addTodo() {
    const text = newText.trim()
    if (!text) return
    if (isLoadingList) return

    setIsMutating(true)
    setError(null)
    try {
      const created = await createTask({ title: text })
      setTodos((prev) => [mapApiTaskToTodo(created), ...prev])
      setNewText('')
    } catch (err) {
      setError(describeError(err))
    } finally {
      setIsMutating(false)
    }
  }

  async function deleteTodo(id: number) {
    setError(null)
    try {
      await withPendingId(id, async () => {
        await deleteTask(id)
        setTodos((prev) => prev.filter((t) => t.id !== id))
        if (editingId === id) clearEditingState()
      })
    } catch (err) {
      await recoverFromMutationError(err)
    }
  }

  async function toggleTodo(id: number) {
    const existing = todos.find((t) => t.id === id)
    if (!existing) return

    setError(null)
    try {
      await withPendingId(id, async () => {
        const updated = await updateTask(id, {
          title: existing.text,
          completed: !existing.completed,
        })
        const mapped = mapApiTaskToTodo(updated)
        setTodos((prev) => prev.map((t) => (t.id === id ? mapped : t)))
      })
    } catch (err) {
      await recoverFromMutationError(err)
    }
  }

  function startEdit(todo: Todo) {
    setEditingId(todo.id)
    setEditingText(todo.text)
    setEditingOriginalText(todo.text)
  }

  function cancelEdit() {
    clearEditingState()
  }

  async function saveEdit(id: number) {
    const text = editingText.trim()
    if (!text) return

    const existing = todos.find((t) => t.id === id)
    if (!existing) return

    setError(null)
    try {
      await withPendingId(id, async () => {
        const updated = await updateTask(id, { title: text, completed: existing.completed })
        const mapped = mapApiTaskToTodo(updated)
        setTodos((prev) => prev.map((t) => (t.id === id ? mapped : t)))
        clearEditingState()
      })
    } catch (err) {
      await recoverFromMutationError(err)
    }
  }

  function updateCmykValue(channel: keyof Cmyk, nextValue: number) {
    setCmyk((prev) => ({
      ...prev,
      [channel]: nextValue,
    }))
  }

  return (
    <div className="luxShell">
      <div className="cmykMenu">
        <button
          type="button"
          className={`cmykMenu__toggle${isMenuOpen ? ' is-open' : ''}`}
          aria-label="Toggle CMYK preview menu"
          aria-expanded={isMenuOpen}
          aria-controls="cmyk-preview-panel"
          onClick={() => setIsMenuOpen((prev) => !prev)}
        >
          <span className="srOnly">Open CMYK preview controls</span>
          <span className="cmykMenu__line" aria-hidden="true" />
          <span className="cmykMenu__line" aria-hidden="true" />
          <span className="cmykMenu__line" aria-hidden="true" />
        </button>

        {isMenuOpen ? (
          <section
            id="cmyk-preview-panel"
            className="cmykMenu__panel"
            role="dialog"
            aria-label="CMYK preview controls"
          >
            <p className="cmykMenu__title">CMYK preview</p>

            <div className="cmykMenu__sliderStack">
              {cmykSliderConfig.map(({ key, label }) => (
                <label key={key} className="cmykMenu__sliderRow">
                  <span className="cmykMenu__sliderLabel">{label}</span>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={cmyk[key]}
                    onChange={(event) => updateCmykValue(key, Number(event.currentTarget.value))}
                  />
                  <output className="cmykMenu__sliderValue">
                    {cmyk[key]}
                  </output>
                </label>
              ))}
            </div>

            <div
              className="cmykMenu__previewSwatch"
              style={{ backgroundColor: `rgb(${previewRgb.r}, ${previewRgb.g}, ${previewRgb.b})` }}
            />
            <p className="cmykMenu__previewValue">
              rgb({previewRgb.r}, {previewRgb.g}, {previewRgb.b})
            </p>
          </section>
        ) : null}
      </div>

      <div className="luxBackdrop" aria-hidden="true">
        <div className="luxBackdrop__wash" />
        <div className="luxBackdrop__blob luxBackdrop__blob--a" />
        <div className="luxBackdrop__blob luxBackdrop__blob--c" />
        <div className="luxBackdrop__blob luxBackdrop__blob--b" />
        <div className="luxBackdrop__sheen" />
      </div>

      <div className="luxContent">
        <div className="todoApp">
          <header className="luxEditorialHeader">
            <div className="luxKicker">Notes &amp; rituals</div>
            <h1 className="luxTitle">Todo List:</h1>
            <p className="luxSubtitle">
              Things to do today.
            </p>
          </header>

          <header className="todoHeader">
            <div className="titleRow">
              <h2 className="title luxSectionTitle">Overview</h2>
              <OverviewStatus
                error={error}
                hasTodos={hasTodos}
                isLoading={isLoadingList}
                remainingCount={remainingCount}
                totalCount={todos.length}
                onRetry={() => void loadTodos()}
              />
            </div>

            <EnterNewTaskForm
              value={newText}
              onChange={setNewText}
              onSubmit={() => void addTodo()}
              disabled={isLoadingList || isMutating}
            />
          </header>

          <TaskList
            focusTodo={focusTodo}
            otherTodos={otherTodos}
            editingId={editingId}
            editingText={editingText}
            editingOriginalText={editingOriginalText}
            onEditingTextChange={setEditingText}
            isLoadingList={isLoadingList}
            isTodoBusy={isTodoBusy}
            onToggle={(id) => void toggleTodo(id)}
            onStartEdit={startEdit}
            onCancelEdit={cancelEdit}
            onSaveEdit={(id) => void saveEdit(id)}
            onDelete={(id) => void deleteTodo(id)}
          />
        </div>
      </div>
    </div>
  )
}

export default App
