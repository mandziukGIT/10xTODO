import { setActivePinia, createPinia } from 'pinia'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useTasks } from '~/stores/tasks'
import type { CreateTaskCommand } from '~/types'

const MOCK_TASK_ID = 'mock-task-id'

// Mock global $fetch
const mockFetch = vi.fn()

describe('Tasks Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.stubGlobal('$fetch', mockFetch)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    mockFetch.mockClear()
  })

  it('should create a top-level task', async () => {
    mockFetch.mockResolvedValue({
      id: MOCK_TASK_ID,
      title: 'Test Task',
      description: 'Test Description',
      source: 'manual',
      completed: false,
      createdAt: '2023-01-01T00:00:00Z',
      parentTaskId: null,
      subtasks: []
    })

    const store = useTasks()
    const command: CreateTaskCommand = {
      title: 'Test Task',
      description: 'Test Description',
      source: 'manual',
      parentTaskId: null,
      generationId: null
    }

    await store.createTask(command)

    expect(store.tasks).toHaveLength(1)
    expect(store.tasks[0].title).toBe('Test Task')
    expect(store.tasks[0].id).toBe(MOCK_TASK_ID)
    expect(mockFetch).toHaveBeenCalledWith('/api/tasks', {
      method: 'POST',
      body: command
    })
  })

  it('should delete a top-level task', async () => {
    const store = useTasks()

    // Setup initial state
    store.tasks = [
      {
        id: 'task-1',
        title: 'Task 1',
        subtasks: [],
        completed: false,
        createdAt: '',
        isEdited: false,
        description: null,
        source: 'manual'
      },
      {
        id: 'task-2',
        title: 'Task 2',
        subtasks: [],
        completed: false,
        createdAt: '',
        isEdited: false,
        description: null,
        source: 'manual'
      }
    ]

    await store.deleteTask('task-1')

    expect(store.tasks).toHaveLength(1)
    expect(store.tasks[0].id).toBe('task-2')
    expect(mockFetch).toHaveBeenCalledWith('/api/tasks/task-1', {
      method: 'DELETE'
    })
  })
})
