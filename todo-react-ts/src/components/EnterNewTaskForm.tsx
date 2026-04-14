type EnterNewTaskFormProps = {
  value: string
  onChange: (next: string) => void
  onSubmit: () => void
  disabled: boolean
}

export function EnterNewTaskForm({
  value,
  onChange,
  onSubmit,
  disabled,
}: EnterNewTaskFormProps) {
  return (
    <div className="addRow luxComposer">
      <label className="srOnly" htmlFor="newTodo">
        New task
      </label>
      <input
        id="newTodo"
        className="textInput"
        value={value}
        placeholder="What needs doing?"
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') void onSubmit()
        }}
      />
      <button
        type="button"
        className="luxPillButton luxPillButton--primary"
        onClick={() => void onSubmit()}
        aria-label="Add task"
        title="Add"
        disabled={disabled}
      >
        Add
      </button>
    </div>
  )
}
