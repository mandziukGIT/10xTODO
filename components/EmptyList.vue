<script setup lang="ts">
import AddTaskButton from '~/components/AddTaskButton.vue'
</script>

<template>
  <div class="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
    <h3 class="text-xl font-medium text-gray-500">No tasks yet</h3>
    <p class="mt-2 text-gray-400">Create your first task to get started</p>
    
    <div class="mt-6">
      <AddTaskButton />
    </div>
  </div>
</template>
