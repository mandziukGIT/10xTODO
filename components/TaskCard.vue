<script setup lang="ts">
import { Pencil, Trash2, PlusCircle } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import type { TaskViewModel } from '~/types'
import { useTasks } from '~/stores/tasks'
import TaskForm from '~/components/TaskForm.vue'

const props = defineProps<{
  task: TaskViewModel
  isSubtask?: boolean
}>()

const emit = defineEmits<{
  (e: 'complete' | 'delete' | 'cancel' | 'edit', taskId: string): void
  (e: 'save', taskId:string, title: string, description: string | null): void
}>()

const tasksStore = useTasks()
const showSubtaskForm = ref(false)

const editForm = reactive({
  title: props.task.title,
  description: props.task.description || ''
})

const formError = ref<string | null>(null)
const titleInput = ref<InstanceType<typeof Input> | null>(null)

const validateForm = (): boolean => {
  if (!editForm.title.trim()) {
    formError.value = 'Title is required'
    return false
  }
  return true
}

const handleSave = () => {
  if (!validateForm()) return
  emit('save', props.task.id, editForm.title.trim(), editForm.description.trim() || null)
}

const handleCancel = () => {
  // Reset form to original values
  editForm.title = props.task.title
  editForm.description = props.task.description || ''
  formError.value = null
  
  emit('cancel', props.task.id)
}

watch(() => props.task.isEdited, (isEditing) => {
  if (isEditing) {
    nextTick(() => {
      titleInput.value?.focus()
    })
  }
})

const confirmDelete = () => {
  if (confirm('Are you sure you want to delete this task?')) {
    emit('delete', props.task.id)
  }
}

const handleCreateSubtask = (title: string, description: string | null) => {
  tasksStore.createTask({
    title,
    description,
    parentTaskId: props.task.id,
    source: 'manual',
    generationId: null,
    position: 1
  })
  showSubtaskForm.value = false
}
</script>

<template>
  <div class="task-card p-4 border rounded-md shadow-sm" :class="{ 'bg-gray-50': task.completed }">
    <!-- View mode -->
    <div v-if="!task.isEdited" class="flex items-center gap-2">
      <Checkbox
        class="h-5 w-5"
        :model-value="task.completed"
        @update:model-value="() => emit('complete', task.id)"
      />
      
      <div class="flex-grow">
        <h3 class="text-lg font-medium" :class="{ 'line-through text-gray-400': task.completed }">
          {{ task.title }}
        </h3>
        <p v-if="task.description" class="text-sm text-gray-500">
          {{ task.description }}
        </p>
      </div>
      
      <div class="flex gap-2">
        <Button 
          :disabled="task.completed"
          variant="ghost" 
          size="sm"
          class="p-1 text-gray-500 hover:text-gray-700"
          @click="emit('edit', task.id)"
        >
          <Pencil :size="20" />
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm"
          class="p-1 text-red-500 hover:text-red-700"
          @click="confirmDelete"
        >
          <Trash2 :size="20" />
        </Button>
      </div>
    </div>
    
    <!-- Edit mode -->
    <div v-else class="space-y-4">
      <div>
        <label for="edit-title" class="block text-sm font-medium mb-1">Title</label>
        <Input
          id="edit-title"
          ref="titleInput"
          v-model="editForm.title"
          placeholder="Task title"
          :class="{ 'border-red-500': formError && formError.includes('Title') }"
        />
        <p v-if="formError && formError.includes('Title')" class="text-red-500 text-xs mt-1">
          {{ formError }}
        </p>
      </div>
      
      <div>
        <label for="edit-description" class="block text-sm font-medium mb-1">Description (optional)</label>
        <Textarea
          id="edit-description"
          v-model="editForm.description"
          placeholder="Task description"
          rows="3"
        />
      </div>
      
      <div class="flex justify-end gap-2">
        <Button 
          type="button" 
          variant="outline" 
          @click="handleCancel"
        >
          Cancel
        </Button>
        <Button 
          type="button"
          @click="handleSave"
        >
          Save
        </Button>
      </div>
    </div>
    
    <!-- Subtasks -->
    <div v-if="task.subtasks && task.subtasks.length > 0" class="mt-4 ml-6 space-y-2">
      <TaskCard
        v-for="subtask in task.subtasks"
        :key="subtask.id"
        :task="subtask"
        :is-subtask="true"
        @complete="(id) => emit('complete', id)"
        @delete="(id) => emit('delete', id)"
        @edit="(id) => emit('edit', id)"
        @save="(id, title, description) => emit('save', id, title, description)"
        @cancel="(id) => emit('cancel', id)"
      />
    </div>
    
    <!-- Add subtask button -->
    <div v-if="!task.isEdited && !task.completed && !isSubtask && (task.subtasks?.length ?? 0) < 10" class="mt-2 ml-6">
      <Button
        v-if="!showSubtaskForm"
        variant="link"
        size="sm"
        class="text-sm text-blue-500 hover:text-blue-700 p-0"
        @click="showSubtaskForm = true"
      >
        <PlusCircle :size="16" class="mr-1" />
        Add subtask
      </Button>
      <TaskForm 
        v-else
        class="mt-2"
        @save="handleCreateSubtask"
        @cancel="showSubtaskForm = false"
      />
    </div>
  </div>
</template>
