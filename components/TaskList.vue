<script setup lang="ts">
import type { TaskViewModel } from '~/types'
import TaskCard from '~/components/TaskCard.vue'

// Define props
defineProps<{
  tasks: TaskViewModel[]
}>()

// Define emits for task interactions
const emit = defineEmits<{
  (e: 'complete' | 'delete' | 'edit' | 'cancel', taskId: string): void
  (e: 'save', taskId: string, title: string, description: string | null): void
}>()
</script>

<template>
  <div class="task-list space-y-4">
    <TaskCard
      v-for="task in tasks" 
      :key="task.id"
      :task="task"
      @complete="(id) => emit('complete', id)"
      @delete="(id) => emit('delete', id)"
      @edit="(id) => emit('edit', id)"
      @save="(id, title, description) => emit('save', id, title, description)"
      @cancel="(id) => emit('cancel', id)"
    />
  </div>
</template>
