import { describe, expect, it } from 'vitest'
import { initialState, taskReducer, type State, type Task } from './taskReducer'

const a: Task = { id: 'a', title: 'Read slides', status: 'todo' }
const b: Task = { id: 'b', title: 'Write reducer', status: 'in-progress' }
const c: Task = { id: 'c', title: 'Take screenshots', status: 'done' }

function stateWith(tasks: Task[]): State {
  return { ...initialState, tasks }
}

/** Freeze the state and everything inside it, so every mutation throws. */
function deepFreeze(state: State): State {
  state.tasks.forEach((t) => Object.freeze(t))
  state.past.forEach((list) => {
    list.forEach((t) => Object.freeze(t))
    Object.freeze(list)
  })
  Object.freeze(state.tasks)
  Object.freeze(state.past)
  return Object.freeze(state)
}

describe('taskReducer', () => {
  it('starts with no tasks and the filter all', () => {
    expect(initialState).toEqual({ tasks: [], filter: 'all', past: [] })
  })

  it('add appends a todo task with the given id', () => {
    const next = taskReducer(initialState, { type: 'add', id: 'x', title: 'New' })
    expect(next.tasks).toEqual([{ id: 'x', title: 'New', status: 'todo' }])
  })

  it('advance moves todo to in-progress to done', () => {
    let s = stateWith([a])
    s = taskReducer(s, { type: 'advance', id: 'a' })
    expect(s.tasks[0].status).toBe('in-progress')
    s = taskReducer(s, { type: 'advance', id: 'a' })
    expect(s.tasks[0].status).toBe('done')
  })

  it('advance three times returns to todo', () => {
    let s = stateWith([a])
    for (let i = 0; i < 3; i++) s = taskReducer(s, { type: 'advance', id: 'a' })
    expect(s.tasks[0].status).toBe('todo')
  })

  it('advance changes only the matching task', () => {
    const next = taskReducer(stateWith([a, b]), { type: 'advance', id: 'a' })
    expect(next.tasks[1]).toBe(b)
  })

  it('remove deletes the task with that id', () => {
    const next = taskReducer(stateWith([a, b, c]), { type: 'remove', id: 'b' })
    expect(next.tasks).toEqual([a, c])
  })

  it('setFilter stores the filter and keeps the same tasks', () => {
    const s = stateWith([a, b])
    const next = taskReducer(s, { type: 'setFilter', filter: 'done' })
    expect(next.filter).toBe('done')
    expect(next.tasks).toBe(s.tasks)
  })

  it('clearDone removes every done task and keeps the filter', () => {
    const s: State = { ...stateWith([a, c, { ...c, id: 'd' }, b]), filter: 'todo' }
    const next = taskReducer(s, { type: 'clearDone' })
    expect(next.tasks).toEqual([a, b])
    expect(next.filter).toBe('todo')
  })

  it('never changes the old state', () => {
    const s = deepFreeze({ tasks: [a, b, c], filter: 'all', past: [[a]] })
    const copy = structuredClone(s)
    taskReducer(s, { type: 'add', id: 'x', title: 'X' })
    taskReducer(s, { type: 'advance', id: 'a' })
    taskReducer(s, { type: 'remove', id: 'b' })
    taskReducer(s, { type: 'setFilter', filter: 'done' })
    taskReducer(s, { type: 'clearDone' })
    taskReducer(s, { type: 'undo' })
    expect(s).toEqual(copy)
  })

  it('returns a new state object and a new tasks array when tasks change', () => {
    const s = stateWith([a])
    const next = taskReducer(s, { type: 'advance', id: 'a' })
    expect(next).not.toBe(s)
    expect(next.tasks).not.toBe(s.tasks)
    expect(next.tasks[0]).not.toBe(s.tasks[0])
  })
})

describe('taskReducer edge cases', () => {
  it('advance with an unknown id changes nothing', () => {
    const s = stateWith([a])
    expect(taskReducer(s, { type: 'advance', id: 'nope' })).toBe(s)
  })

  it('remove with an unknown id changes nothing', () => {
    const s = stateWith([a])
    expect(taskReducer(s, { type: 'remove', id: 'nope' })).toBe(s)
  })

  it('remove on an empty list keeps it empty', () => {
    expect(taskReducer(initialState, { type: 'remove', id: 'a' }).tasks).toEqual([])
  })

  it('clearDone with nothing done changes nothing', () => {
    const s = stateWith([a, b])
    expect(taskReducer(s, { type: 'clearDone' })).toBe(s)
  })
})

describe('undo (Bonus 1)', () => {
  it('does nothing when there is nothing to undo', () => {
    expect(taskReducer(initialState, { type: 'undo' })).toBe(initialState)
  })

  it('reverts the last change to the tasks', () => {
    let s = taskReducer(initialState, { type: 'add', id: 'a', title: 'A' })
    s = taskReducer(s, { type: 'advance', id: 'a' })
    s = taskReducer(s, { type: 'undo' })
    expect(s.tasks).toEqual([{ id: 'a', title: 'A', status: 'todo' }])
    s = taskReducer(s, { type: 'undo' })
    expect(s.tasks).toEqual([])
    expect(s.past).toEqual([])
  })

  it('brings the cleared tasks back after clearDone', () => {
    const s = stateWith([a, b, c])
    const cleared = taskReducer(s, { type: 'clearDone' })
    expect(taskReducer(cleared, { type: 'undo' }).tasks).toEqual([a, b, c])
  })

  it('does not undo a filter change', () => {
    let s = taskReducer(initialState, { type: 'add', id: 'a', title: 'A' })
    s = taskReducer(s, { type: 'setFilter', filter: 'done' })
    expect(s.past).toHaveLength(1)
    s = taskReducer(s, { type: 'undo' })
    expect(s.tasks).toEqual([])
    expect(s.filter).toBe('done')
  })
})
