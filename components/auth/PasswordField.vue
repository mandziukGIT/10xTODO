<script setup lang="ts">
import { ref } from 'vue'

const props = withDefaults(defineProps<{
  modelValue?: string
  id?: string
  placeholder?: string
  error?: string
  required?: boolean
}>(), {
  modelValue: '',
  id: undefined,
  placeholder: 'Password',
  error: '',
  required: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const showPassword = ref(false)
const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const inputId = props.id || 'password-field'
</script>

<template>
  <div class="relative">
    <input
      :id="inputId"
      :type="showPassword ? 'text' : 'password'"
      :value="modelValue"
      :placeholder="placeholder || 'Password'"
      :required="required"
      class="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] pr-10"
      @input="(e: Event) => emit('update:modelValue', (e.target as HTMLInputElement).value)"
    >
    <button
      type="button"
      class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 focus:outline-none"
      @click="togglePasswordVisibility"
    >
      <span v-if="showPassword" class="text-sm">Hide</span>
      <span v-else class="text-sm">Show</span>
    </button>
    <p v-if="error" class="mt-1 text-sm text-red-600">{{ error }}</p>
  </div>
</template>
