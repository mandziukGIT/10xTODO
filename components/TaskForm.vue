<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

const emit = defineEmits<{
  (e: 'save', title: string, description: string | null): void
  (e: 'cancel'): void
}>()

const titleInput = ref<InstanceType<typeof Input> | null>(null)

const editForm = reactive({
  title: '',
  description: ''
})

const formError = ref<string | null>(null)

const validateForm = (): boolean => {
  if (!editForm.title.trim()) {
    formError.value = 'Title is required'
    return false
  }
  return true
}

const handleSave = () => {
  if (!validateForm()) return
  emit('save', editForm.title.trim(), editForm.description.trim() || null)
  // Reset form after saving
  editForm.title = ''
  editForm.description = ''
  formError.value = null
}

const handleCancel = () => {
  // Reset form
  editForm.title = ''
  editForm.description = ''
  formError.value = null
  emit('cancel')
}

onMounted(() => {
  nextTick(() => {
    titleInput.value?.focus()
  })
})
</script>

<template>
  <div class="task-card p-4 border rounded-md shadow-sm">
    <div class="space-y-4">
      <div>
        <label for="new-task-title" class="block text-sm font-medium mb-1">Title</label>
        <Input
          id="new-task-title"
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
        <label for="new-task-description" class="block text-sm font-medium mb-1">Description (optional)</label>
        <Textarea
          id="new-task-description"
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
  </div>
</template>
