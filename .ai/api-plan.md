# REST API Plan

## 1. Resources

- **Users**: Managed by Supabase Auth. These represent the authenticated users interacting with the system.
- **GenerationProcess**: Represents AI generation process metadata. (Corresponds to the `generation_process` table) Contains fields such as `id`, `user_id`, `duration`, `model`, `generated_count`, `source_text_hash`, and `created_at`.
- **GenerationProcessErrorLogs**: Stores error logs for AI tasks proposals generation. (Corresponds to the `generation_process_error_logs` table) Contains fields such as `id`, `user_id`, `model`, `source_text_hash`, `error_code`, `error_message`, and `created_at`.
- **Tasks**: Represents tasks and subtasks (up to 2 levels of nesting). (Corresponds to the `tasks` table) Key fields include `id`, `user_id`, `generation_id`, `parent_task_id`, `position`, `source`, `title`, `description`, `created_at`, `completed`, and `completed_at`.

## 2. Endpoints

### AI Generation Endpoints

Endpoints for managing AI-assisted tasks generations.

- **POST /generations**
  - **Description**: Generate tasks proposals with AI. Accepts a description of the goal/problem and triggers an LLM API call to generate task proposals.
  - **Request Body**:
    ```json
    {
      "description": "Detailed goal or problem description."
    }
    ```
  - **Response**:
    ```json
    {
      "id": "uuid",
      "tasks": [
         { "title": "Task proposal", "description": "...", "source": "ai-full" },
         ...
      ],
      "generated_count": 5,
      "createdAt": "timestamp"
    }
    ```
  - **Success Codes**: 201 Created
  - **Error Codes**: 400 Bad Request, 500 Internal Server Error (if LLM processing fails)


- **GET /generations/{generationId}**
  - **Description**: Retrieve detailed information of a specific generation including its tasks.
  - **Response**:
    ```json
    {
        "id": "uuid",
        "tasks": [ ... ],
        "createdAt": "timestamp"
    }
    ```
  - **Success Codes**: 200 OK
  - **Error Codes**: 404 Not Found, 401 Unauthorized

### Tasks Endpoints

Endpoints for creating, retrieving, updating, deleting, and managing tasks and subtasks.

- **GET /tasks**
  - **Description**: Retrieves a list of tasks for the authenticated user.
  - **Query Parameters** (optional):
    - `page`: for pagination
    - `limit`: number of tasks per page
    - `sortBy`: e.g., `createdAt`
    - `filter`: e.g., `completed` status or text search
  - **Response**:
    ```json
    {
      "tasks": [
         {
           "id": "uuid",
           "title": "Task title",
           "description": "Details...",
           "source": "ai_full" | "ai_edited" | "manual",
           "completed": false,
           "createdAt": "timestamp",
           "subtasks": [ ... ]
         },
         ...
      ],
      "pagination": { "page": 1, "limit": 10, "total": 100 }
    }
    ```
  - **Success Codes**: 200 OK
  - **Error Codes**: 401 Unauthorized
  
- **GET /tasks/{taskId}**
  - **Description**: Retrieves a specific task with its subtasks for the authenticated user.
  - **Response**:
    ```json
    {
      "id": "uuid",
      "title": "Task title",
      "description": "Details...",
      "source": "ai_full" | "ai_edited" | "manual",
      "completed": false,
      "createdAt": "timestamp",
      "subtasks": [
        {
          "id": "uuid",
          "title": "Subtask title",
          "description": "Details...",
          "source": "ai_full" | "ai_edited" | "manual",
          "completed": false,
          "createdAt": "timestamp"
        },
        ...
      ]
    }
    ```
  - **Success Codes**: 200 OK
  - **Error Codes**: 401 Unauthorized, 404 Not Found

- **POST /tasks**
  - **Description**: Creates a new task or subtask.
  - **Request Body**:
    ```json
    {
      "title": "Task Title",
      "description": "Optional description",
      "parentTaskId": "uuid or null",
      "source": "ai_full" | "ai_edited" | "manual",
      "generationId": "uuid (for source: ai_full | ai_edited) or null (for source: manual)"
    }
    ```
  - **Response**:
    ```json
    {
      "id": "uuid",
      "title": "Task Title",
      "description": "Optional description",
      "source": "ai_full" | "ai_edited" | "manual",
      "createdAt": "timestamp"
    }
    ```
  - **Success Codes**: 201 Created
  - **Error Codes**: 400 Bad Request (e.g., exceeding task limits), 401 Unauthorized

- **PUT /tasks/{taskId}**
  - **Description**: Updates a task's basic data (title, description). Note: This endpoint only modifies the task's own data and does NOT trigger any cascading completion logic for subtasks. For completing a task with its subtasks, use the PATCH /complete endpoint instead.
  - **Request Body**:
    ```json
    {
      "title": "Updated Title",
      "description": "Updated description"
    }
    ```
  - **Response**:
    ```json
    {
      "id": "uuid",
      "title": "Updated Title",
      "description": "Updated description",
      "updatedAt": "timestamp"
    }
    ```
  - **Success Codes**: 200 OK
  - **Error Codes**: 400 Bad Request, 401 Unauthorized, 404 Not Found

- **DELETE /tasks/{taskId}**
  - **Description**: Deletes a task. If the task has subtasks, they are either cascaded for deletion or an error is returned if constraints are violated.
  - **Response**:
    ```json
    {
      "message": "Task deleted successfully."
    }
    ```
  - **Success Codes**: 200 OK
  - **Error Codes**: 400 Bad Request, 401 Unauthorized, 404 Not Found

- **PATCH /tasks/{taskId}/complete**
  - **Description**: - **Description**: Marks a task as complete and triggers cascading completion of all its subtasks. This is the recommended way to complete tasks as it ensures proper handling of the task hierarchy. The action is enforced by database triggers to maintain data consistency.
    ```json
    {
      "message": "Task and its subtasks have been marked as complete."
    }
    ```
  - **Success Codes**: 200 OK
  - **Error Codes**: 400 Bad Request, 401 Unauthorized, 404 Not Found

### (Optional) Error Logs Endpoint

- **GET /generation-error-logs**
  - **Description**: Retrieves error logs for AI tasks generation process. This endpoint is typically restricted to admin or support users.
  - **Response**:
    ```json
    {
      "errorLogs": [
         { "id": "uuid", "errorCode": "code", "errorMessage": "message", "createdAt": "timestamp" },
         ...
      ]
    }
    ```
  - **Success Codes**: 200 OK
  - **Error Codes**: 401 Unauthorized, 403 Forbidden

## 3. Authentication and Authorization

- All endpoints (except for registration and login) require authentication.
- Use JWT tokens issued by Supabase Auth, which should be provided in the `Authorization` header as a Bearer token.
- Authorization logic must ensure that the `user_id` of any resource matches the authenticated user’s ID.
- Sensitive endpoints (e.g., error logs) may require additional role-based access control.

## 4. Validation and Business Logic

- **Input Validation**:
  - Validate required fields and data types in request payloads (e.g., non-empty task titles, valid email formats).
  - For tasks, ensure that the `source` field is one of: `ai_full`, `ai_edited`, or `manual`, and that any provided `position` is a positive integer.
  - For AI generation sessions, ensure that the provided description is non-empty and meets complexity requirements.

- **Business Logic**:
  - **AI Planning Session**: On creation, an LLM API is called to generate 4–8 task proposals. The session (handled on client-side) remains active until the user either accepts (commits tasks to the main list) or rejects (discarding the proposals) the session.
  - **Task Limits Enforcement**: Enforce a maximum of 10 top-level subtasks. Although database triggers enforce this constraint, the API should validate input and return immediate feedback if exceeded.
  - **Cascade Completion**: Marking a task complete should automatically cascade completion to its subtasks, as enforced at the database level.
  - **Task Splitting**: An endpoint allows further breaking down a task into subtasks via an AI-assisted process.

- **Error Handling**:
  - Return clear error messages and appropriate HTTP status codes (e.g., 400 for validation errors, 401 for unauthorized access, 404 for not found).
  - Log internal errors, particularly those arising from LLM API calls or database constraint violations.
