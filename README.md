# Assignment 3: Task Manager with a Reducer

**Name:** Şevval Boyraz
**Student number:** 2200004208
**Course:** SEN0415 Advanced Web Programming, Fall 2026

A Task Manager built with React, TypeScript and `useReducer`. The state is
`{ tasks, filter, past }`. A filter bar shows live counts, a Clear done button removes
finished tasks and an Undo button reverts the last change to the tasks.

## Run it

Needs Node.js 20.19 or newer.

```
npm install
npm run dev       # open the address it prints
npm run build     # type check (strict) and build
npm test          # run the Vitest tests
```

## Files

```
src/
  taskReducer.ts       State, Action, initialState, taskReducer (R1 to R3, Bonus 1)
  filter.ts            Filter, FILTERS, filterTasks, countByFilter (R4)
  TaskRow.tsx          one row: title, status, Next, Delete
  App.tsx              useReducer; AddForm, FilterBar, TaskList get props (R5, R6)
  taskReducer.test.ts  reducer tests (Bonus 2)
  filter.test.ts       filterTasks and countByFilter tests (Bonus 2)
screenshots/
  all.png  todo.png  in-progress.png  done.png
```

## Bonuses claimed

I did all four bonuses: Bonus 1, Bonus 2, Bonus 3 and Bonus 4.

---

## Bonus 1: Undo

The state is `{ tasks: Task[]; filter: Filter; past: Task[][] }`. `past` is a stack of
earlier task lists, newest last: every action that really changes `tasks` (`add`,
`advance`, `remove`, `clearDone`) pushes the old list onto it through one helper,
`withTasks`, and `{ type: 'undo' }` pops the last list back into `tasks`. `setFilter`
does not touch `past`, so changing the filter is not undoable. An action that changes
nothing, such as removing an unknown id or `clearDone` with no done tasks, returns the
same state and adds no undo step. The Undo button is disabled while `past` is empty.

## Bonus 2: Tests

Tests are written with Vitest in `src/taskReducer.test.ts` and `src/filter.test.ts`.
They cover every action, `advance` three times back to `todo`, a deep-frozen state
that must not change, undo, `filterTasks`, `countByFilter`, and edge cases: an unknown
id, an empty list, `clearDone` with nothing done and counts after a delete.

Output of `npx vitest run --reporter=verbose` (`npm test` runs the same tests):

```
 RUN  v5.1.0 assignment3

 ✓ src/taskReducer.test.ts > taskReducer > starts with no tasks and the filter all
 ✓ src/taskReducer.test.ts > taskReducer > add appends a todo task with the given id
 ✓ src/taskReducer.test.ts > taskReducer > advance moves todo to in-progress to done
 ✓ src/taskReducer.test.ts > taskReducer > advance three times returns to todo
 ✓ src/taskReducer.test.ts > taskReducer > advance changes only the matching task
 ✓ src/taskReducer.test.ts > taskReducer > remove deletes the task with that id
 ✓ src/taskReducer.test.ts > taskReducer > setFilter stores the filter and keeps the same tasks
 ✓ src/taskReducer.test.ts > taskReducer > clearDone removes every done task and keeps the filter
 ✓ src/taskReducer.test.ts > taskReducer > never changes the old state
 ✓ src/taskReducer.test.ts > taskReducer > returns a new state object and a new tasks array when tasks change
 ✓ src/taskReducer.test.ts > taskReducer edge cases > advance with an unknown id changes nothing
 ✓ src/taskReducer.test.ts > taskReducer edge cases > remove with an unknown id changes nothing
 ✓ src/taskReducer.test.ts > taskReducer edge cases > remove on an empty list keeps it empty
 ✓ src/taskReducer.test.ts > taskReducer edge cases > clearDone with nothing done changes nothing
 ✓ src/taskReducer.test.ts > undo (Bonus 1) > does nothing when there is nothing to undo
 ✓ src/taskReducer.test.ts > undo (Bonus 1) > reverts the last change to the tasks
 ✓ src/taskReducer.test.ts > undo (Bonus 1) > brings the cleared tasks back after clearDone
 ✓ src/taskReducer.test.ts > undo (Bonus 1) > does not undo a filter change
 ✓ src/filter.test.ts > filterTasks > all returns every task
 ✓ src/filter.test.ts > filterTasks > returns only the tasks with the chosen status, in order
 ✓ src/filter.test.ts > filterTasks > returns an empty list when nothing matches
 ✓ src/filter.test.ts > filterTasks > does not change the input array
 ✓ src/filter.test.ts > countByFilter > counts every filter
 ✓ src/filter.test.ts > countByFilter > gives zeros for an empty list
 ✓ src/filter.test.ts > countByFilter > is right after a delete

 Test Files  2 passed (2)
      Tests  25 passed (25)
```

## Bonus 3: Explain your reducer

A reducer must be pure because React decides whether to re-render by comparing the old
state with the new one by reference. If the reducer mutated the old array, for example
with `state.tasks.push(task)`, and returned the same object, React would see the same
reference and skip the render, so the screen would not update. Mutation also breaks
anything that keeps old states, such as my Undo stack, because the "old" list would
silently change too. In development, StrictMode calls the reducer twice to catch this,
so a reducer with side effects would also run them twice.

The caller creates the id with `crypto.randomUUID()` because the same state and action
must always give the same result. If the reducer made the id, calling it twice (as
StrictMode does) would give two different ids, and tests could not predict the output.
Putting the random value inside the action keeps the reducer deterministic.

The filtered list and the counts are derived from `state.tasks` during rendering
instead of being stored, so there is one source of truth. If I stored `counts`, I would
have to update it in every action. Forgetting it in one place, for example in
`remove`, would leave "Done (2)" on the button after deleting a done task, and the
number would no longer match the list.

Moving the filter into the reducer state made Undo easier: the reducer sees `tasks`,
`filter` and `past` together, so it can decide that `setFilter` is not undoable while
every task change is. It also kept every state rule in one tested function. The cost
is that changing the filter now goes through `dispatch` and an action type, which is
more code than a simple `useState` setter.

## Bonus 4: Git repository

Repository: https://github.com/sevvalingg/assignment3

The history has one commit per step (starter, state shape, filter functions, filter bar,
undo, tests, README and screenshots). `node_modules` and `dist` are in `.gitignore`.
The project runs after `git clone`, `npm install` and `npm run dev`.
