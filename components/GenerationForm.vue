<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <div class="space-y-2">
      <label for="description" class="text-sm font-medium">
        Opisz swój cel lub problem
      </label>
      <Textarea
        id="description"
        v-model="description"
        placeholder="Np. Chcę zorganizować wyjazd integracyjny dla zespołu 10 osób na weekend..."
        :class="{ 'border-red-500': isError }"
        :disabled="isLoading"
        rows="6"
      />
      
      <div class="flex justify-between text-xs text-gray-500">
        <span v-if="isError" class="text-red-500">
          Opis musi zawierać od 100 do 500 znaków
        </span>
        <span v-else>
          Minimum 100 znaków
        </span>
        <span :class="{ 'text-red-500': description.length > 500 }">
          {{ description.length }}/500
        </span>
      </div>
    </div>

    <div class="flex justify-end">
      <Button 
        type="submit" 
        :disabled="!isValid || isLoading"
      >
        Generuj zadania
      </Button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import type { CreateGenerationCommand } from '~/types'

// Props
const props = defineProps<{
  isLoading: boolean
}>()

// Emits
const emit = defineEmits<{
  generate: [payload: CreateGenerationCommand]
}>()

// Stan formularza
const description = ref('')

// Walidacja
const isValid = computed(() => {
  return description.value.length >= 100 && description.value.length <= 500
})

const isError = computed(() => {
  // Pokazujemy błąd tylko gdy użytkownik zaczął pisać i przekroczył limity
  return description.value.length > 0 && 
         (description.value.length < 100 || description.value.length > 500)
})

// Obsługa wysłania formularza
const handleSubmit = () => {
  if (!isValid.value) return
  
  emit('generate', {
    description: description.value
  })
}
</script>
