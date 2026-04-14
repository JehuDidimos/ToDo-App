import type { Todo } from '../types/todo'

type TodoRowProps = {
  todo: Todo
  editingId: number | null
  editingText: string
  editingOriginalText: string
  onEditingTextChange: (next: string) => void
  busy: boolean
  onToggle: (id: number) => void
  onStartEdit: (todo: Todo) => void
  onCancelEdit: () => void
  onSaveEdit: (id: number) => void
  onDelete: (id: number) => void
}

export function TodoRow({
  todo,
  editingId,
  editingText,
  editingOriginalText,
  onEditingTextChange,
  busy,
  onToggle,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
}: TodoRowProps) {
  const isEditing = editingId === todo.id
  const canSave = isEditing && editingText.trim().length > 0 && editingText !== editingOriginalText

  return (
    <li className={todo.completed ? 'todoItem completedRow' : 'todoItem'}>
      <label className="checkWrap">
        <input
          type="checkbox"
          checked={todo.completed}
          disabled={busy}
          onChange={() => void onToggle(todo.id)}
          aria-label={`Mark "${todo.text}" as ${todo.completed ? 'not completed' : 'completed'}`}
        />
      </label>

      <div className="content">
        {isEditing ? (
          <input
            className="editInput"
            value={editingText}
            autoFocus
            disabled={busy}
            onChange={(e) => onEditingTextChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') void onSaveEdit(todo.id)
              if (e.key === 'Escape') onCancelEdit()
            }}
            aria-label="Edit task"
          />
        ) : (
          <span className={todo.completed ? 'text completed' : 'text'} title={todo.text}>
            {todo.text}
          </span>
        )}
      </div>

      <div className="actions">
        {isEditing ? (
          <>
            <button
              type="button"
              className="luxPillButton luxPillButton--primary"
              onClick={() => void onSaveEdit(todo.id)}
              aria-label="Save changes"
              title="Save"
              disabled={!canSave || busy}
            >
              Save
            </button>
            <button
              type="button"
              className="luxPillButton luxPillButton--quiet"
              onClick={onCancelEdit}
              aria-label="Cancel changes"
              title="Cancel"
              disabled={busy}
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              className="luxPillButton luxPillButton--quiet"
              onClick={() => onStartEdit(todo)}
              aria-label="Edit task"
              title="Edit"
              disabled={busy}
            >
              Edit
            </button>
            <button
              type="button"
              className="luxPillButton luxPillButton--danger"
              onClick={() => void onDelete(todo.id)}
              aria-label="Delete task"
              title="Delete"
              disabled={busy}
            >
              Delete
            </button>
          </>
        )}
      </div>
    </li>
  )
}
