import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { 
  PaginationDTO, 
  CreateTaskCommand, 
  UpdateTaskCommand,
  GetTasksResponseDTO,
  TaskViewModel
} from '~/types'

export const useTasks = defineStore('tasks', () => {
  // State
  const tasks = ref<TaskViewModel[]>([])
  const isLoading = ref(true)
  const error = ref<string | null>(null)
  const pagination = ref<PaginationDTO | null>(null)

  // Getters
  const getTaskById = (taskId: string): TaskViewModel | undefined => {
    // Helper function to search recursively through task tree
    const findTaskRecursively = (tasks: TaskViewModel[]): TaskViewModel | undefined => {
      for (const task of tasks) {
        if (task.id === taskId) {
          return task
        }
        
        if (task.subtasks && task.subtasks.length > 0) {
          const found = findTaskRecursively(task.subtasks)
          if (found) {
            return found
          }
        }
      }
      
      return undefined
    }
    
    return findTaskRecursively(tasks.value)
  }

  const canAddSubtask = (parentTaskId: string | null): boolean => {
    // No parent - we're checking if we can add a top-level task
    if (parentTaskId === null) {
      return true // No limit for top-level tasks
    } else {
      const parentTask = getTaskById(parentTaskId)
      if (!parentTask) return false

      // Limit to 10 subtasks per task
      return parentTask.subtasks.length < 10
    }
  }

  // Actions
  const fetchTasks = async () => {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await $fetch<GetTasksResponseDTO>('/api/tasks')
      
      // Transform TaskListItemDTO to TaskViewModel
      tasks.value = response.tasks.map(task => ({
        ...task,
        isEdited: false,
        subtasks: task.subtasks.map(subtask => ({
          ...subtask,
          isEdited: false,
          subtasks: []
        }))
      }))
      
      pagination.value = response.pagination
    } catch (err) {
      error.value = 'Failed to load tasks. Please try again.'
      console.error('Error fetching tasks:', err)
    } finally {
      isLoading.value = false
    }
  }

  const createTask = async (command: CreateTaskCommand) => {
    try {
      // Optimistic update
      const tempId = `temp-${Date.now()}`
      const newTask: TaskViewModel = {
        id: tempId,
        title: command.title,
        description: command.description || null,
        source: command.source,
        completed: false,
        createdAt: new Date().toISOString(),
        isEdited: false,
        subtasks: []
      }

      // Add to appropriate location based on parentTaskId
      if (command.parentTaskId) {
        // Add as subtask
        const parentTask = getTaskById(command.parentTaskId)
        if (parentTask) {
          parentTask.subtasks.push(newTask)
        }
      } else {
        // Add as top-level task
        tasks.value.push(newTask)
      }

      // Call API
      const response = await $fetch('/api/tasks', {
        method: 'POST',
        body: command
      })

      // Update with real ID from response
      if (command.parentTaskId) {
        const parentTask = getTaskById(command.parentTaskId)
        if (parentTask) {
          const index = parentTask.subtasks.findIndex(t => t.id === tempId)
          if (index !== -1) {
            parentTask.subtasks[index].id = response.id
          }
        }
      } else {
        const index = tasks.value.findIndex(t => t.id === tempId)
        if (index !== -1) {
          tasks.value[index].id = response.id
        }
      }

      return response.id
    } catch (err) {
      // Revert optimistic update
      if (command.parentTaskId) {
        const parentTask = getTaskById(command.parentTaskId)
        if (parentTask) {
          parentTask.subtasks = parentTask.subtasks.filter(t => !t.id.startsWith('temp-'))
        }
      } else {
        tasks.value = tasks.value.filter(t => !t.id.startsWith('temp-'))
      }

      error.value = 'Failed to create task. Please try again.'
      console.error('Error creating task:', err)
      throw err
    }
  }

  const updateTask = async (taskId: string, command: UpdateTaskCommand) => {
    const task = getTaskById(taskId)
    if (!task) return

    // Store original values for rollback if needed
    const originalTitle = task.title
    const originalDescription = task.description

    try {
      // Optimistic update
      task.title = command.title
      task.description = command.description

      // Call API
      await $fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        body: command
      })

      // Set editing state to false after successful update
      setEditingState(taskId, false)
    } catch (err) {
      // Rollback on error
      if (task) {
        task.title = originalTitle
        task.description = originalDescription
      }

      error.value = 'Failed to update task. Please try again.'
      console.error('Error updating task:', err)
      throw err
    }
  }

  const deleteTask = async (taskId: string) => {
    // Find if it's a top-level task or a subtask
    const topLevelIndex = tasks.value.findIndex(t => t.id === taskId)
    let parentTask: TaskViewModel | undefined
    let subtaskIndex = -1

    if (topLevelIndex === -1) {
      // It's a subtask, find its parent
      for (const task of tasks.value) {
        subtaskIndex = task.subtasks.findIndex(s => s.id === taskId)
        if (subtaskIndex !== -1) {
          parentTask = task
          break
        }
      }
    }

    // Store task for potential rollback
    let deletedTask: TaskViewModel | undefined
    
    try {
      // Optimistic delete
      if (topLevelIndex !== -1) {
        deletedTask = { ...tasks.value[topLevelIndex] }
        tasks.value.splice(topLevelIndex, 1)
      } else if (parentTask && subtaskIndex !== -1) {
        deletedTask = { ...parentTask.subtasks[subtaskIndex] }
        parentTask.subtasks.splice(subtaskIndex, 1)
      }

      // Call API
      await $fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE'
      })
    } catch (err) {
      // Rollback on error
      if (deletedTask) {
        if (topLevelIndex !== -1) {
          tasks.value.splice(topLevelIndex, 0, deletedTask)
        } else if (parentTask && subtaskIndex !== -1) {
          parentTask.subtasks.splice(subtaskIndex, 0, deletedTask)
        }
      }

      error.value = 'Failed to delete task. Please try again.'
      console.error('Error deleting task:', err)
      throw err
    }
  }

  const completeTask = async (taskId: string) => {
    const task = getTaskById(taskId)
    if (!task) return

    // Store original state for rollback if needed
    const originalState = task.completed

    try {
      // Optimistic update
      task.completed = !task.completed

      // If completing a parent task, complete all subtasks
      if (task.completed && task.subtasks.length > 0) {
        task.subtasks.forEach(subtask => {
          subtask.completed = true
        })
      }

      // Call API
      await $fetch(`/api/tasks/${taskId}/complete`, {
        method: 'PATCH'
      })
    } catch (err) {
      // Rollback on error
      if (task) {
        task.completed = originalState
        
        // Rollback subtasks if needed
        if (task.subtasks.length > 0) {
          task.subtasks.forEach(subtask => {
            subtask.completed = originalState
          })
        }
      }

      error.value = 'Failed to update task status. Please try again.'
      console.error('Error completing task:', err)
      throw err
    }
  }

  const setEditingState = (taskId: string, isEditing: boolean) => {
    const task = getTaskById(taskId)
    if (task) {
      task.isEdited = isEditing
    }
  }

  return {
    // State
    tasks,
    isLoading,
    error,
    pagination,
    
    // Getters
    getTaskById,
    canAddSubtask,
    
    // Actions
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    completeTask,
    setEditingState
  }
})
