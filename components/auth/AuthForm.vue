<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
  isSubmitting?: boolean
  error?: string
}>()

const emit = defineEmits<{
  submit: []
}>()

const handleSubmit = (e: Event) => {
  e.preventDefault()
  emit('submit')
}
</script>

<template>
  <form class="mt-8 space-y-6" @submit="handleSubmit">
    <div class="bg-white p-8 rounded-lg shadow">
      <h2 class="text-center text-2xl font-bold text-gray-900 mb-2">{{ title }}</h2>
      <p v-if="subtitle" class="text-center text-sm text-gray-600 mb-6">{{ subtitle }}</p>
      
      <!-- Global error message -->
      <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
        {{ error }}
      </div>
      
      <!-- Form fields -->
      <div class="space-y-4">
        <slot />
      </div>
      
      <!-- Submit button -->
      <div class="mt-6">
        <Button
          type="submit"
          class="w-full"
          :disabled="isSubmitting"
        >
          <span v-if="isSubmitting" class="flex items-center justify-center">
            <span class="mr-2">Processing</span>
            <div class="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>
          </span>
          <slot v-else name="submit-text">Submit</slot>
        </Button>
      </div>
      
      <!-- Additional content (links, etc.) -->
      <div class="mt-4">
        <slot name="footer" />
      </div>

      <!-- Social login buttons -->
      <div class="mt-6">
        <p class="text-center text-sm text-gray-500">
          Or continue with
        </p>
        <div class="mt-2 grid grid-cols-1 gap-3">
          <slot name="social-buttons" />
        </div>
      </div>
    </div>
  </form>
</template>
