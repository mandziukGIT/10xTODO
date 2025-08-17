<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { CreateTaskCommand } from '~/types'
import { useTasks } from '~/stores/tasks'

const tasksStore = useTasks()
const isFormOpen = ref(false)
const isSubmitting = ref(false)
const formError = ref<string | null>(null)

const newTask = reactive<{
  title: string
  description: string
}>({
  title: '',
  description: ''
})

const resetForm = () => {
  newTask.title = ''
  newTask.description = ''
  formError.value = null
}

const openForm = () => {
  resetForm()
  isFormOpen.value = true
}

const closeForm = () => {
  isFormOpen.value = false
}

const validateForm = (): boolean => {
  if (!newTask.title.trim()) {
    formError.value = 'Title is required'
    return false
  }
  return true
}

const submitForm = async () => {
  if (!validateForm()) return
  
  isSubmitting.value = true
  formError.value = null
  
  try {
    const command: CreateTaskCommand = {
      title: newTask.title.trim(),
      description: newTask.description.trim() || null,
      parentTaskId: null, // This is a top-level task
      source: 'manual',
      generationId: null,
      position: 1 // Top-level task
    }
    
    await tasksStore.createTask(command)
    closeForm()
  } catch (err) {
    formError.value = 'Failed to create task. Please try again.'
    console.error('Error creating task:', err)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div>
    <Button v-if="!isFormOpen" @click="openForm" class="flex items-center gap-2">
      <span class="i-heroicons-plus-circle h-5 w-5"></span>
      <span>Add New Task</span>
    </Button>
    
    <div v-else class="border rounded-md p-4 bg-white shadow-sm">
      <form @submit.prevent="submitForm">
        <div class="space-y-4">
          <div>
            <label for="title" class="block text-sm font-medium mb-1">Title</label>
            <Input
              id="title"
              v-model="newTask.title"
              placeholder="Task title"
              :class="{ 'border-red-500': formError && formError.includes('Title') }"
              autofocus
            />
            <p v-if="formError && formError.includes('Title')" class="text-red-500 text-xs mt-1">
              {{ formError }}
            </p>
          </div>
          
          <div>
            <label for="description" class="block text-sm font-medium mb-1">Description (optional)</label>
            <Textarea
              id="description"
              v-model="newTask.description"
              placeholder="Task description"
              rows="3"
            />
          </div>
          
          <div class="flex justify-end gap-2">
            <Button 
              type="button" 
              variant="outline" 
              @click="closeForm"
              :disabled="isSubmitting"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              :disabled="isSubmitting"
            >
              {{ isSubmitting ? 'Creating...' : 'Create Task' }}
            </Button>
          </div>
          
          <p v-if="formError && !formError.includes('Title')" class="text-red-500 text-sm">
            {{ formError }}
          </p>
        </div>
      </form>
    </div>
  </div>
</template>
