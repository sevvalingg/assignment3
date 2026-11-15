// The state lives in App with useReducer and goes down as props.
import { useReducer } from 'react'
import type { Dispatch } from 'react'
import { taskReducer, initialState, type Task, type Action } from './taskReducer'
import { FILTERS, filterTasks, countByFilter, type Filter } from './filter'
import TaskRow from './TaskRow'

const LABELS: Record<Filter, string> = {
  all: 'All',
  todo: 'To do',
  'in-progress': 'In progress',
  done: 'Done',
}

function AddForm({ dispatch }: { dispatch: Dispatch<Action> }) {
  function addTask(formData: FormData) {
    const title = String(formData.get('title') ?? '').trim()
    // The id is created here, in the event handler, so the reducer stays pure.
    if (title) dispatch({ type: 'add', id: crypto.randomUUID(), title })
  }
  return (
    <form action={addTask} style={{ display: 'flex', gap: 8 }}>
      <input name="title" placeholder="New task" />
      <button type="submit">Add</button>
    </form>
  )
}

type FilterBarProps = {
  filter: Filter
  counts: Record<Filter, number>
  dispatch: Dispatch<Action>
}

function FilterBar({ filter, counts, dispatch }: FilterBarProps) {
  return (
    <div role="group" aria-label="Filter tasks" style={{ display: 'flex', gap: 8, margin: '16px 0' }}>
      {FILTERS.map((f) => {
        const active = f === filter
        return (
          <button
            key={f}
            type="button"
            aria-pressed={active}
            onClick={() => dispatch({ type: 'setFilter', filter: f })}
            style={{
              padding: '4px 10px',
              borderRadius: 6,
              border: '1px solid #1a58a5',
              background: active ? '#1a58a5' : 'white',
              color: active ? 'white' : '#1a58a5',
              fontWeight: active ? 700 : 400,
              cursor: 'pointer',
            }}
          >
            {LABELS[f]} ({counts[f]})
          </button>
        )
      })}
    </div>
  )
}

function TaskList({ tasks, dispatch }: { tasks: Task[]; dispatch: Dispatch<Action> }) {
  if (tasks.length === 0) return <p><em>No tasks here.</em></p>
  return (
    <ul style={{ paddingLeft: 0, listStyle: 'none' }}>
      {tasks.map((t) => (
        <TaskRow
          key={t.id}
          task={t}
          onNext={() => dispatch({ type: 'advance', id: t.id })}
          onDelete={() => dispatch({ type: 'remove', id: t.id })}
        />
      ))}
    </ul>
  )
}

export default function App() {
  const [state, dispatch] = useReducer(taskReducer, initialState)

  // Derived while rendering, never stored in state (R6).
  const visible = filterTasks(state.tasks, state.filter)
  const counts = countByFilter(state.tasks)

  return (
    <main style={{ maxWidth: 560, margin: '40px auto', fontFamily: 'system-ui, sans-serif' }}>
      <h1>Task Manager</h1>
      <AddForm dispatch={dispatch} />
      <FilterBar filter={state.filter} counts={counts} dispatch={dispatch} />
      <TaskList tasks={visible} dispatch={dispatch} />
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          type="button"
          onClick={() => dispatch({ type: 'clearDone' })}
          disabled={counts.done === 0}
        >
          Clear done
        </button>
      </div>
    </main>
  )
}
