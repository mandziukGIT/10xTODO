import type { SupabaseClient } from '@supabase/supabase-js'
import { createError, H3Error } from 'h3'
import type {
  CompleteTaskResponseDTO,
  CreateTaskCommand,
  CreateTaskResponseDTO,
  DeleteTaskResponseDTO,
  GetTasksResponseDTO,
  SubtaskListItemDTO,
  TaskInsert,
  TaskListItemDTO,
  UpdateTaskCommand,
  UpdateTaskResponseDTO,
} from '~/types'
import type { Database } from '~/db/database.types'

/**
 * Service class for task-related operations
 */
export class TaskService {
  private supabase: SupabaseClient<Database>

  constructor(supabase: SupabaseClient<Database>) {
    this.supabase = supabase
  }

  /**
   * Retrieves all tasks for the authenticated user
   *
   * @param userId Authenticated user ID
   * @param page Page number for pagination (1-based)
   * @param limit Number of items per page
   * @returns Tasks with their subtasks and pagination info
   */
  async getTasks(
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<GetTasksResponseDTO> {
    // Validate pagination parameters
    if (page < 1) page = 1
    if (limit < 1) limit = 20
    if (limit > 100) limit = 100

    // Calculate offset
    const offset = (page - 1) * limit

    try {
      // 1. Get count of parent tasks (for pagination)
      const { count: totalCount, error: countError } = await this.supabase
        .from('tasks')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .is('parent_task_id', null) // Only count parent tasks

      if (countError) {
        console.error('Error counting tasks:', countError)
        throw createError({
          statusCode: 500,
          statusMessage: 'Failed to count tasks',
        })
      }

      // 2. Get parent tasks with pagination
      const { data: parentTasks, error: parentTasksError } = await this.supabase
        .from('tasks')
        .select('id, title, description, source, completed, created_at')
        .eq('user_id', userId)
        .is('parent_task_id', null)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (parentTasksError) {
        console.error('Error fetching parent tasks:', parentTasksError)
        throw createError({
          statusCode: 500,
          statusMessage: 'Failed to fetch tasks',
        })
      }

      // 3. Get all subtasks for these parent tasks in a single query
      const parentIds = parentTasks.map(task => task.id)

      const { data: allSubtasks, error: subtasksError } = await this.supabase
        .from('tasks')
        .select(
          'id, title, description, source, completed, created_at, parent_task_id'
        )
        .eq('user_id', userId)
        .in('parent_task_id', parentIds)
        .order('created_at', { ascending: false })

      if (subtasksError) {
        console.error('Error fetching subtasks:', subtasksError)
        throw createError({
          statusCode: 500,
          statusMessage: 'Failed to fetch subtasks',
        })
      }

      // 4. Group subtasks by parent_task_id
      const subtasksByParentId: Record<string, SubtaskListItemDTO> = {}

      allSubtasks.forEach(subtask => {
        if (!subtask.parent_task_id) return

        if (!subtasksByParentId[subtask.parent_task_id])
          subtasksByParentId[subtask.parent_task_id] = []

        subtasksByParentId[subtask.parent_task_id].push({
          id: subtask.id,
          title: subtask.title,
          description: subtask.description,
          source: subtask.source,
          completed: subtask.completed,
          createdAt: subtask.created_at,
        })
      })

      // 5. Map parent tasks with their subtasks
      const tasks: TaskListItemDTO[] = parentTasks.map(task => ({
        id: task.id,
        title: task.title,
        description: task.description,
        source: task.source,
        completed: task.completed,
        createdAt: task.created_at,
        subtasks: subtasksByParentId[task.id] || [],
      }))

      // Return tasks with pagination info
      return {
        tasks,
        pagination: {
          page,
          limit,
          total: totalCount || 0,
        },
      }
    } catch (error) {
      if (error instanceof Error)
        console.error('Error in getTasks:', error?.message)

      // Re-throw if it's already an H3Error
      if (error && typeof error === 'object' && 'statusCode' in error)
        throw error

      // Otherwise, wrap in a generic server error
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to retrieve tasks',
      })
    }
  }

  /**
   * Creates a new task for the authenticated user
   *
   * @param command Task creation command with validated data
   * @param userId Authenticated user ID
   * @returns The newly created task
   */
  async createTask(
    command: CreateTaskCommand,
    userId: string
  ): Promise<CreateTaskResponseDTO> {
    // Check if parentTaskId exists and belongs to the user
    if (command.parentTaskId) {
      const { data: parentTask, error: parentTaskError } = await this.supabase
        .from('tasks')
        .select('id, parent_task_id')
        .eq('id', command.parentTaskId)
        .eq('user_id', userId)
        .single()

      if (parentTaskError || !parentTask) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Parent task not found or does not belong to the user',
        })
      }

      // Check nesting level (max 2 levels)
      // TODO: check if this is correct (re-think this)
      if (parentTask.parent_task_id) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Maximum nesting level exceeded (max 2 levels)',
        })
      }
    }

    // Check if generationId exists and belongs to the user (when required)
    if (command.generationId) {
      const { data: generation, error: generationError } = await this.supabase
        .from('generation_process')
        .select('id')
        .eq('id', command.generationId)
        .eq('user_id', userId)
        .single()

      if (generationError || !generation) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Generation not found or does not belong to the user',
        })
      }
    }

    // Calculate position
    let position = 1

    if (command.parentTaskId) {
      // This is a subtask
      const { data: parentTask } = await this.supabase
        .from('tasks')
        .select('parent_task_id')
        .eq('id', command.parentTaskId)
        .single()

      // If parent has its own parent (is a subtask itself), position = 2, otherwise position = 1
      position = parentTask?.parent_task_id ? 3 : 2
    }

    // Prepare task data for insertion
    const taskData: TaskInsert = {
      title: command.title,
      description: command.description || null,
      parent_task_id: command.parentTaskId,
      source: command.source,
      generation_id: command.generationId,
      user_id: userId,
      position,
      completed: false,
    }

    // Insert the task
    const { data, error } = await this.supabase
      .from('tasks')
      .insert(taskData)
      .select('id, title, description, source, created_at')
      .single()

    if (error) {
      console.error('Error creating task:', error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to create task',
      })
    }

    if (!data) {
      throw createError({
        statusCode: 500,
        statusMessage: 'No data returned after task creation',
      })
    }

    // Map to response DTO
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      source: data.source,
      createdAt: data.created_at,
    }
  }

  /**
   * Deletes a task and its subtasks
   *
   * @param taskId ID of the task to delete
   * @param userId Authenticated user ID
   * @returns Success message
   */
  async deleteTask(
    taskId: string,
    userId: string
  ): Promise<DeleteTaskResponseDTO> {
    try {
      // 1. Check if task exists and belongs to the user
      const { data: task, error: taskError } = await this.supabase
        .from('tasks')
        .select('id, parent_task_id')
        .eq('id', taskId)
        .eq('user_id', userId)
        .single()

      if (taskError || !task) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Task not found or does not belong to the user',
        })
      }

      // 2. Begin transaction to delete task and its subtasks
      // Note: Supabase client doesn't support transactions directly, so we'll do this in steps

      // First, delete any subtasks if this is a parent task
      if (!task.parent_task_id) {
        const { error: subtasksDeleteError } = await this.supabase
          .from('tasks')
          .delete()
          .eq('parent_task_id', taskId)

        if (subtasksDeleteError) {
          console.error('Error deleting subtasks:', subtasksDeleteError)
          throw createError({
            statusCode: 500,
            statusMessage: 'Failed to delete subtasks',
          })
        }
      }

      // Then delete the task itself
      const { error: taskDeleteError } = await this.supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)
        .eq('user_id', userId)

      if (taskDeleteError) {
        console.error('Error deleting task:', taskDeleteError)
        throw createError({
          statusCode: 500,
          statusMessage: 'Failed to delete task',
        })
      }

      // Return success response
      return {
        message: 'Task deleted successfully',
      }
    } catch (error) {
      // Re-throw if it's already an H3Error
      if (error && typeof error === 'object' && 'statusCode' in error)
        throw error

      // Log and wrap other errors
      console.error('Error in deleteTask:', error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to delete task',
      })
    }
  }

  /**
   * Toggles the completion status of a task
   *
   * @param taskId ID of the task to toggle completion status
   * @param userId Authenticated user ID
   * @returns Success message
   */
  async updateTask(
    taskId: string,
    command: UpdateTaskCommand,
    userId: string
  ): Promise<UpdateTaskResponseDTO> {
    try {
      // Check if task exists and belongs to the user
      const { data: existingTask, error: fetchError } = await this.supabase
        .from('tasks')
        .select('id')
        .eq('id', taskId)
        .eq('user_id', userId)
        .single()

      if (fetchError || !existingTask) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Task not found',
        })
      }

      // Update the task
      const { data: updatedTask, error: updateError } = await this.supabase
        .from('tasks')
        .update({
          title: command.title,
          description: command.description,
        })
        .eq('id', taskId)
        .eq('user_id', userId)
        .select('id, title, description')
        .single()

      if (updateError) {
        console.error('Error updating task:', updateError)
        throw createError({
          statusCode: 500,
          statusMessage: 'Failed to update task',
        })
      }

      return {
        id: updatedTask.id,
        title: updatedTask.title,
        description: updatedTask.description,
        updatedAt: new Date().toISOString(),
      }
    } catch (error) {
      // Re-throw H3Error
      if (error instanceof H3Error) throw error

      console.error('Unexpected error in updateTask:', error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Internal server error',
      })
    }
  }

  async completeTask(
    taskId: string,
    userId: string
  ): Promise<CompleteTaskResponseDTO> {
    try {
      // 1. Check if task exists and belongs to the user
      const { data: task, error: taskError } = await this.supabase
        .from('tasks')
        .select('id, parent_task_id, completed')
        .eq('id', taskId)
        .eq('user_id', userId)
        .single()

      if (taskError || !task) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Task not found or does not belong to the user',
        })
      }

      // 2. Toggle the completion status
      const newCompletionStatus = !task.completed

      // Update the task itself
      const { error: taskUpdateError } = await this.supabase
        .from('tasks')
        .update({ completed: newCompletionStatus })
        .eq('id', taskId)
        .eq('user_id', userId)

      if (taskUpdateError) {
        console.error('Error updating task completion status:', taskUpdateError)
        throw createError({
          statusCode: 500,
          statusMessage: 'Failed to update task completion status',
        })
      }

      // 3. If completing a parent task, also complete all its subtasks
      if (newCompletionStatus && !task.parent_task_id) {
        const { error: subtasksUpdateError } = await this.supabase
          .from('tasks')
          .update({ completed: true })
          .eq('parent_task_id', taskId)
          .eq('user_id', userId)

        if (subtasksUpdateError) {
          console.error(
            'Error updating subtasks completion status:',
            subtasksUpdateError
          )
          throw createError({
            statusCode: 500,
            statusMessage: 'Failed to update subtasks completion status',
          })
        }
      }

      // Return success response
      return {
        message: 'Task completion status updated successfully',
      }
    } catch (error) {
      // Re-throw if it's already an H3Error
      if (error && typeof error === 'object' && 'statusCode' in error)
        throw error

      // Log and wrap other errors
      console.error('Error in completeTask:', error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to update task completion status',
      })
    }
  }
}
