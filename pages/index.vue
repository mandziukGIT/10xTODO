<script setup lang="ts">
import { useTasks } from '~/stores/tasks'
import LoadingSkeleton from '~/components/LoadingSkeleton.vue'
import EmptyList from '~/components/EmptyList.vue'
import TaskList from '~/components/TaskList.vue'
import AddTaskButton from '~/components/AddTaskButton.vue'
import SessionTrigger from '~/components/SessionTrigger.vue'
import GenerationSessionModal from '~/components/GenerationSessionModal.vue'

// Initialize the tasks store
const tasksStore = useTasks()

// Fetch tasks on component mount
onMounted(async () => {
  await tasksStore.fetchTasks()
})

// Handler for adding subtasks
const handleAddSubtask = (parentId: string) => {
  // This will be implemented later with a modal or inline form
  console.log('Add subtask to parent:', parentId)
  
  // For now, we'll just create a simple subtask
  tasksStore.createTask({
    title: 'New subtask',
    description: '',
    parentTaskId: parentId,
    source: 'manual',
    generationId: null,
    position: 1
  })
}
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <header class="mb-8 flex justify-between items-center">
      <h1 class="text-3xl font-bold">Tasks</h1>
      <div class="flex gap-4">
        <SessionTrigger />
        
        <AddTaskButton />
      </div>
    </header>
    
    <!-- Modal sesji planowania AI -->
    <GenerationSessionModal />
    
    <main>
      <!-- Conditional rendering based on loading state and tasks availability -->
      <div v-if="tasksStore.isLoading" class="loading-skeleton">
        <LoadingSkeleton />
      </div>
      
      <div v-else-if="tasksStore.error" class="error-state">
        <div class="p-4 bg-red-100 border border-red-400 text-red-700 rounded mb-4">
          {{ tasksStore.error }}
          <button 
            class="ml-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            @click="tasksStore.fetchTasks()" 
          >
            Try Again
          </button>
        </div>
      </div>
      
      <div v-else-if="tasksStore.tasks.length === 0" class="empty-list">
        <EmptyList />
      </div>
      
      <div v-else class="task-list">
        <TaskList 
          :tasks="tasksStore.tasks"
          @complete="tasksStore.completeTask"
          @delete="tasksStore.deleteTask"
          @edit="tasksStore.setEditingState($event, true)"
          @save="(id, title, description) => tasksStore.updateTask(id, { title, description })"
          @cancel="(id) => tasksStore.setEditingState(id, false)"
          @add-subtask="handleAddSubtask"
        />
      </div>
    </main>
  </div>
</template>
