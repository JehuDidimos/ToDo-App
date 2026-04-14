import type { Todo } from '../types/todo'
import { TodoRow } from './TodoRow'

type TaskListProps = {
  focusTodo: Todo | null
  otherTodos: Todo[]

  editingId: number | null
  editingText: string
  editingOriginalText: string
  onEditingTextChange: (next: string) => void

  isLoadingList: boolean
  isTodoBusy: (id: number) => boolean

  onToggle: (id: number) => void
  onStartEdit: (todo: Todo) => void
  onCancelEdit: () => void
  onSaveEdit: (id: number) => void
  onDelete: (id: number) => void
}

export function TaskList({
  focusTodo,
  otherTodos,
  editingId,
  editingText,
  editingOriginalText,
  onEditingTextChange,
  isLoadingList,
  isTodoBusy,
  onToggle,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
}: TaskListProps) {
  const sharedRowProps = {
    editingId,
    editingText,
    editingOriginalText,
    onEditingTextChange,
    onToggle,
    onStartEdit,
    onCancelEdit,
    onSaveEdit,
    onDelete,
  }

  return (
    <>
      {focusTodo ? (
        <section className="luxHero" aria-label="Focus task">
          <div className="luxHero__meta">
            <span className="luxMicroLabel">Focus</span>
            <span className="luxHero__metaRight">Primary</span>
          </div>
          <ul className="todoList luxHeroList" aria-label="Focus task">
            <TodoRow
              todo={focusTodo}
              busy={isTodoBusy(focusTodo.id) || isLoadingList}
              {...sharedRowProps}
            />
          </ul>
        </section>
      ) : null}

      <main className="todoMain">
        <div className="luxStackHeader">
          <span className="luxMicroLabel">Other tasks</span>
          <span className="luxStackHint">{otherTodos.length} shown</span>
        </div>
        <ul className="todoList" aria-label="Tasks">
          {otherTodos.map((todo) => (
            <TodoRow
              key={todo.id}
              todo={todo}
              busy={isTodoBusy(todo.id) || isLoadingList}
              {...sharedRowProps}
            />
          ))}
        </ul>
      </main>
    </>
  )
}
