<template>
  <div class="border rounded-md p-4 space-y-4">
    <!-- Tryb edycji -->
    <div v-if="proposal.isEditing" class="space-y-4">
      <!-- Tytuł -->
      <div>
        <label for="title" class="text-sm font-medium">
          Tytuł zadania
        </label>
        <Input
          id="title"
          v-model="editedTitle"
          placeholder="Wprowadź tytuł zadania"
          :class="{ 'border-red-500': titleError }"
        />
        <p v-if="titleError" class="mt-1 text-xs text-red-500">
          Tytuł nie może być pusty
        </p>
      </div>
      
      <!-- Opis -->
      <div>
        <label for="description" class="text-sm font-medium">
          Opis zadania (opcjonalny)
        </label>
        <Textarea
          id="description"
          v-model="editedDescription"
          placeholder="Wprowadź opis zadania"
          rows="3"
        />
      </div>
      
      <!-- Przyciski akcji -->
      <div class="flex justify-end space-x-2">
        <Button 
          variant="outline" 
          @click="cancelEdit"
        >
          Anuluj
        </Button>
        <Button 
          :disabled="!isValid"
          @click="saveEdit"
        >
          Zapisz
        </Button>
      </div>
    </div>
    
    <!-- Tryb podglądu -->
    <div v-else>
      <!-- Tytuł -->
      <h3 class="text-lg font-medium">{{ proposal.title }}</h3>
      
      <!-- Opis (jeśli istnieje) -->
      <p v-if="proposal.description" class="text-sm text-gray-600">
        {{ proposal.description }}
      </p>
      
      <!-- Przyciski akcji -->
      <div class="flex justify-end space-x-2 pt-2">
        <Button 
          variant="outline" 
          size="sm"
          @click="startEdit"
        >
          Edytuj
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          @click="handleDelete"
        >
          Usuń
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { GenerationProposalViewModel } from '~/stores/generation'

// Props
const props = defineProps<{
  proposal: GenerationProposalViewModel
}>()

// Emits
const emit = defineEmits<{
  update: [proposal: GenerationProposalViewModel]
  delete: [tempId: string]
}>()

// Stan lokalny dla edycji
const editedTitle = ref(props.proposal.title)
const editedDescription = ref(props.proposal.description || '')
const titleError = ref(false)

// Computed
const isValid = computed(() => {
  return editedTitle.value.trim().length > 0
})

// Metody
const startEdit = () => {
  // Resetujemy stan edycji
  editedTitle.value = props.proposal.title
  editedDescription.value = props.proposal.description || ''
  titleError.value = false
  
  // Emitujemy zdarzenie aktualizacji, aby ustawić flagę isEditing
  emit('update', {
    ...props.proposal,
    isEditing: true
  })
}

const saveEdit = () => {
  // Sprawdzamy poprawność
  if (!isValid.value) {
    titleError.value = true
    return
  }
  
  // Emitujemy zdarzenie aktualizacji
  emit('update', {
    ...props.proposal,
    title: editedTitle.value.trim(),
    description: editedDescription.value.trim() || undefined,
    isEdited: true,
    isEditing: false
  })
}

const cancelEdit = () => {
  // Emitujemy zdarzenie aktualizacji, aby wyłączyć tryb edycji
  emit('update', {
    ...props.proposal,
    isEditing: false
  })
}

const handleDelete = () => {
  emit('delete', props.proposal.tempId)
}
</script>
