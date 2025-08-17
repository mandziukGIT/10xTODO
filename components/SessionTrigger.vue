<script setup lang="ts">
import { Brain } from 'lucide-vue-next'
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
      <Brain :size="20" />
      <span>Plan with AI</span>
    </Button>
  </div>
</template>
