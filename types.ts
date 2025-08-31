/**
 * DTO and Command Model Type Definitions
 *
 * All types are derived from the database entity definitions in `db/database.types.ts`.
 * We expose camelCase API fields while anchoring primitive types to DB rows/enums to
 * guarantee consistency between API DTOs and the underlying schema.
 */

import type { Tables, TablesInsert, Enums } from './db/database.types'

// -----------------------------------------------------------------------------
// Entity aliases (DB-anchored)
// -----------------------------------------------------------------------------

type TaskRow = Tables<'tasks'>
type TaskInsert = TablesInsert<'tasks'>
type GenerationProcessRow = Tables<'generation_process'>
type GenerationProcessErrorLogRow = Tables<'generation_process_error_logs'>

export type TaskSource = Enums<'task_source'>

// -----------------------------------------------------------------------------
// Shared helpers
// -----------------------------------------------------------------------------

/**
 * Base representation for a task-like object in API space (camelCase),
 * derived from `TaskRow`. We intentionally omit internal fields such as
 * `user_id`, `generation_id`, `parent_task_id` from the
 * public API surface.
 */
export type TaskDTOBase = {
  id: TaskRow['id']
  title: TaskRow['title']
  description: TaskRow['description']
  source: TaskRow['source']
  completed: TaskRow['completed']
  createdAt: TaskRow['created_at']
}

/**
 * A subtask item as returned by the API. It mirrors a `tasks` row (camelCase)
 * but does not include nested `subtasks` nor internal relation fields.
 */
export type SubtaskListItemDTO = TaskDTOBase[]

/**
 * A top-level task item with nested subtasks collection.
 */
export type TaskListItemDTO = TaskDTOBase & {
  subtasks: SubtaskListItemDTO
}

// -----------------------------------------------------------------------------
// Pagination DTO
// -----------------------------------------------------------------------------

export type PaginationDTO = {
  page: number
  limit: number
  total: number
}

// -----------------------------------------------------------------------------
// Tasks: Responses
// -----------------------------------------------------------------------------

/**
 * GET /tasks response
 */
export type GetTasksResponseDTO = {
  tasks: TaskListItemDTO[]
  pagination: PaginationDTO
}

/**
 * GET /tasks/{taskId} response
 */
export type GetTaskDetailsResponseDTO = TaskListItemDTO

/**
 * POST /tasks response
 */
export type CreateTaskResponseDTO = {
  id: TaskRow['id']
  title: TaskRow['title']
  description: TaskRow['description']
  source: TaskRow['source']
  createdAt: TaskRow['created_at']
}

/**
 * PUT /tasks/{taskId} response
 */
export type UpdateTaskResponseDTO = {
  id: TaskRow['id']
  title: TaskRow['title']
  description: TaskRow['description']
  /**
   * Note: `updatedAt` is an API-level timestamp. It is not stored explicitly
   * in the current DB schema and may be synthesized by the server.
   */
  updatedAt: string
}

/**
 * DELETE /tasks/{taskId} response
 */
export type DeleteTaskResponseDTO = {
  message: string
}

/**
 * PATCH /tasks/{taskId}/complete response
 */
export type CompleteTaskResponseDTO = {
  message: string
}

// -----------------------------------------------------------------------------
// Tasks: Commands (Requests)
// -----------------------------------------------------------------------------

/**
 * POST /tasks request body
 * - Anchored to `TaskInsert` property types while exposing camelCase fields.
 * - The server is responsible for setting internal fields such as `user_id` and (optionally) `generation_id`.
 */
export type CreateTaskCommand = {
  title: TaskInsert['title']
  description?: TaskInsert['description']
  parentTaskId: TaskInsert['parent_task_id'] | null
  source: TaskInsert['source']
  generationId: TaskInsert['generation_id'] | null
}

/**
 * PUT /tasks/{taskId} request body
 * - We allow `description` to be nullable to support clearing the description.
 */
export type UpdateTaskCommand = {
  title: TaskRow['title']
  description: TaskRow['description']
}

/**
 * PATCH /tasks/{taskId}/complete request body (no payload)
 */
export type CompleteTaskCommand = Record<never, never>

// -----------------------------------------------------------------------------
// Generations: DTOs & Commands
// -----------------------------------------------------------------------------

/**
 * POST /generations request body
 */
export type CreateGenerationCommand = {
  description: string
}

/**
 * A single AI task proposal in a generation response. Derived from `TaskInsert`
 * types (no `id` yet; not persisted), keeping API camelCase. `source` should
 * generally be `"ai_full"`, but we type it as `TaskSource` for completeness.
 */
export type GenerationProposalTaskDTO = {
  title: TaskInsert['title']
  description?: TaskInsert['description']
  source: 'ai_full' // Zawężamy typ do konkretnej wartości, ponieważ AI zawsze generuje z source="ai_full"
}

/**
 * POST /generations response
 */
export type CreateGenerationResponseDTO = {
  generationId: GenerationProcessRow['id']
  tasks: GenerationProposalTaskDTO[]
  generated_count: GenerationProcessRow['generated_count']
  createdAt: GenerationProcessRow['created_at']
}

/**
 * GET /generations/{generationId} response
 * Mirrors POST response shape in the plan.
 */
export type GetGenerationDetailsResponseDTO = {
  generationId: GenerationProcessRow['id']
  tasks: GenerationProposalTaskDTO[]
  createdAt: GenerationProcessRow['created_at']
}

// -----------------------------------------------------------------------------
// Generation Error Logs: DTOs
// -----------------------------------------------------------------------------

export type GenerationErrorLogItemDTO = {
  id: GenerationProcessErrorLogRow['id']
  errorCode: GenerationProcessErrorLogRow['error_code']
  errorMessage: GenerationProcessErrorLogRow['error_message']
  createdAt: GenerationProcessErrorLogRow['created_at']
}

export type GetGenerationErrorLogsResponseDTO = {
  errorLogs: GenerationErrorLogItemDTO[]
}

// -----------------------------------------------------------------------------
// Frontend View Models
// -----------------------------------------------------------------------------

/**
 * Extends the task DTO with UI state properties
 * to facilitate managing edit mode and loading states for each task card.
 */
export interface TaskViewModel extends TaskListItemDTO {
  isEdited?: boolean
  subtasks: TaskViewModel[]
}

// -----------------------------------------------------------------------------
// Utility re-exports (optional convenience)
// -----------------------------------------------------------------------------

// -----------------------------------------------------------------------------
// Auth Types
// -----------------------------------------------------------------------------

export interface LoginInput {
  email: string
  password: string
}

export interface RegisterInput {
  email: string
  password: string
  confirmPassword: string
}

export interface ForgotPasswordInput {
  email: string
}

export interface ResetPasswordInput {
  token: string
  newPassword: string
  confirmPassword: string
}

export type {
  TaskRow,
  TaskInsert,
  GenerationProcessRow,
  GenerationProcessErrorLogRow
}
