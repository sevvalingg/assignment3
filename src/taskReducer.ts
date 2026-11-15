// Şevval Boyraz, Student number: 2200004208
// SEN0415 Advanced Web Programming, Assignment 3
import type { Filter } from './filter'

export type Status = 'todo' | 'in-progress' | 'done'
export type Task = { id: string; title: string; status: Status }

/**
 * tasks: the current list. filter: which tasks the screen shows.
 * past: earlier task lists, newest last, for Undo (Bonus 1).
 */
export type State = { tasks: Task[]; filter: Filter; past: Task[][] }

export const initialState: State = { tasks: [], filter: 'all', past: [] }

export type Action =
  | { type: 'add'; id: string; title: string }
  | { type: 'advance'; id: string }
  | { type: 'remove'; id: string }
  | { type: 'setFilter'; filter: Filter }
  | { type: 'clearDone' }
  | { type: 'undo' }

const NEXT: Record<Status, Status> = {
  todo: 'in-progress',
  'in-progress': 'done',
  done: 'todo',
}

/** Replace the task list and remember the old one so it can be undone. */
function withTasks(state: State, tasks: Task[]): State {
  return { ...state, tasks, past: [...state.past, state.tasks] }
}

export function taskReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'add':
      return withTasks(state, [
        ...state.tasks,
        { id: action.id, title: action.title, status: 'todo' },
      ])
    case 'advance':
      // Unknown id: nothing changes, so return the same state and add no undo step.
      if (!state.tasks.some((t) => t.id === action.id)) return state
      return withTasks(
        state,
        state.tasks.map((t) => (t.id === action.id ? { ...t, status: NEXT[t.status] } : t)),
      )
    case 'remove': {
      const tasks = state.tasks.filter((t) => t.id !== action.id)
      return tasks.length === state.tasks.length ? state : withTasks(state, tasks)
    }
    case 'clearDone': {
      const tasks = state.tasks.filter((t) => t.status !== 'done')
      return tasks.length === state.tasks.length ? state : withTasks(state, tasks)
    }
    case 'setFilter':
      // Changing the filter is not undoable, so past stays the same.
      return { ...state, filter: action.filter }
    case 'undo': {
      if (state.past.length === 0) return state
      return {
        ...state,
        tasks: state.past[state.past.length - 1],
        past: state.past.slice(0, -1),
      }
    }
    default: {
      // If a new action type is added and not handled above, this line stops compiling.
      const unhandled: never = action
      return unhandled
    }
  }
}
