<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { useGenerationStore } from '~/stores/generation'

// Pobieramy store generacji
const generationStore = useGenerationStore()
</script>

<template>
  <div>
    <Button 
      variant="outline" 
      class="flex items-center gap-2"
      @click="generationStore.openModal"
    >
      <span class="i-heroicons-sparkles h-5 w-5"></span>
      <span>Plan with AI</span>
    </Button>
  </div>
</template>
