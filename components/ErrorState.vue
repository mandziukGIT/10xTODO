<template>
  <div class="flex flex-col items-center justify-center py-8 space-y-4">
    <!-- Ikona błędu -->
    <div class="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
      <span class="text-red-500 text-xl">!</span>
    </div>
    
    <!-- Komunikat błędu -->
    <div class="text-center">
      <h3 class="text-lg font-medium text-gray-900">Wystąpił błąd</h3>
      <p class="mt-1 text-sm text-gray-500">
        {{ errorMessage || 'Nie udało się wygenerować zadań. Spróbuj ponownie.' }}
      </p>
    </div>
    
    <!-- Przycisk ponownej próby -->
    <Button @click="$emit('retry')">
      Spróbuj ponownie
    </Button>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'

defineProps<{
  errorMessage: string | null
}>()

defineEmits<{
  retry: []
}>()
</script>
