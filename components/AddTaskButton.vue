<script setup lang="ts">
import { Plus } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'

const emit = defineEmits(['click'])
</script>

<template>
  <div>
    <Button class="flex items-center gap-2" @click="emit('click')">
      <Plus :size="20" />
      <span>Add New Task</span>
    </Button>
  </div>
</template>
