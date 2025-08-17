<script setup lang="ts">
import { Skeleton } from '@/components/ui/skeleton'
// No props or state needed for this component
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center space-x-4">
      <Skeleton class="h-6 w-6 rounded-full" />
      <Skeleton class="h-6 w-3/4" />
    </div>
    
    <div class="ml-10 space-y-3">
      <div class="flex items-center space-x-4">
        <Skeleton class="h-5 w-5 rounded-full" />
        <Skeleton class="h-5 w-2/3" />
      </div>
      <div class="flex items-center space-x-4">
        <Skeleton class="h-5 w-5 rounded-full" />
        <Skeleton class="h-5 w-1/2" />
      </div>
    </div>
    
    <div class="flex items-center space-x-4">
      <Skeleton class="h-6 w-6 rounded-full" />
      <Skeleton class="h-6 w-2/3" />
    </div>
    
    <div class="flex items-center space-x-4">
      <Skeleton class="h-6 w-6 rounded-full" />
      <Skeleton class="h-6 w-3/4" />
    </div>
  </div>
</template>
