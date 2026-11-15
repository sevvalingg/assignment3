import { describe, expect, it } from 'vitest'
import { countByFilter, filterTasks } from './filter'
import { taskReducer, initialState, type Task } from './taskReducer'

const tasks: Task[] = [
  { id: '1', title: 'One', status: 'todo' },
  { id: '2', title: 'Two', status: 'in-progress' },
  { id: '3', title: 'Three', status: 'done' },
  { id: '4', title: 'Four', status: 'todo' },
]

describe('filterTasks', () => {
  it('all returns every task', () => {
    expect(filterTasks(tasks, 'all')).toEqual(tasks)
  })

  it('returns only the tasks with the chosen status, in order', () => {
    expect(filterTasks(tasks, 'todo').map((t) => t.id)).toEqual(['1', '4'])
    expect(filterTasks(tasks, 'in-progress').map((t) => t.id)).toEqual(['2'])
    expect(filterTasks(tasks, 'done').map((t) => t.id)).toEqual(['3'])
  })

  it('returns an empty list when nothing matches', () => {
    expect(filterTasks(tasks.slice(0, 1), 'done')).toEqual([])
    expect(filterTasks([], 'all')).toEqual([])
  })

  it('does not change the input array', () => {
    const copy = [...tasks]
    filterTasks(tasks, 'todo')
    expect(tasks).toEqual(copy)
  })
})

describe('countByFilter', () => {
  it('counts every filter', () => {
    expect(countByFilter(tasks)).toEqual({ all: 4, todo: 2, 'in-progress': 1, done: 1 })
  })

  it('gives zeros for an empty list', () => {
    expect(countByFilter([])).toEqual({ all: 0, todo: 0, 'in-progress': 0, done: 0 })
  })

  it('is right after a delete', () => {
    const s = taskReducer({ ...initialState, tasks }, { type: 'remove', id: '1' })
    expect(countByFilter(s.tasks)).toEqual({ all: 3, todo: 1, 'in-progress': 1, done: 1 })
  })
})
