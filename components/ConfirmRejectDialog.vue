<template>
  <Dialog :open="isOpen" @update:open="handleUpdateOpen">
    <DialogContent class="sm:max-w-[400px]">
      <DialogHeader>
        <DialogTitle>Zakończyć sesję?</DialogTitle>
        <DialogDescription>
          Czy na pewno chcesz zakończyć sesję? Wszystkie wygenerowane propozycje zostaną utracone.
        </DialogDescription>
      </DialogHeader>
      
      <!-- Przyciski -->
      <div class="mt-6 flex justify-end space-x-3">
        <Button 
          variant="outline" 
          @click="$emit('cancel')"
        >
          Kontynuuj sesję
        </Button>
        <Button 
          variant="destructive" 
          @click="$emit('confirm')"
        >
          Zakończ sesję
        </Button>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  confirm: []
  cancel: []
  'update:open': [value: boolean]
}>()

// Obsługa zmiany stanu otwarcia dialogu
const handleUpdateOpen = (value: boolean) => {
  if (!value) {
    emit('cancel')
  }
}
</script>
