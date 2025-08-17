<template>
  <div class="space-y-4">
    <div class="flex items-center justify-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"/>
    </div>
    
    <p class="text-center text-gray-500">Generowanie propozycji zadań...</p>
    
    <!-- Symulacja wyglądu przyszłej listy zadań -->
    <div class="space-y-4 mt-6">
      <div v-for="i in 3" :key="i" class="border rounded-md p-4">
        <Skeleton class="h-6 w-3/4 mb-4" />
        <Skeleton class="h-4 w-full mb-2" />
        <Skeleton class="h-4 w-5/6" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Skeleton } from '@/components/ui/skeleton'
</script>
