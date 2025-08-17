<template>
  <div class="space-y-6">
    <!-- Informacja o wygenerowanych propozycjach -->
    <div class="flex items-center justify-between">
      <p class="text-sm text-gray-500">
        Wygenerowano {{ proposals.length }} {{ proposalsLabel }}
      </p>
      
      <div class="flex items-center space-x-2">
        <Button 
          variant="outline" 
          @click="handleReject"
        >
          Odrzuć
        </Button>
        
        <Button 
          :disabled="proposals.length === 0"
          @click="$emit('accept-all')"
        >
          Akceptuj wszystkie
        </Button>
      </div>
    </div>
    
    <!-- Lista propozycji -->
    <div v-if="proposals.length > 0" class="space-y-4">
      <ProposalItem
        v-for="proposal in proposals"
        :key="proposal.tempId"
        :proposal="proposal"
        @update="handleUpdate"
        @delete="handleDelete"
      />
    </div>
    
    <!-- Brak propozycji -->
    <div v-else class="text-center py-8">
      <p class="text-gray-500">Brak propozycji zadań</p>
    </div>
    
    <!-- Dialog potwierdzenia odrzucenia -->
    <ConfirmRejectDialog
      :is-open="isConfirmDialogOpen"
      @confirm="confirmReject"
      @cancel="cancelReject"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Button } from '@/components/ui/button'
import { useGenerationStore, type GenerationProposalViewModel } from '~/stores/generation'
import ConfirmRejectDialog from './ConfirmRejectDialog.vue'
import ProposalItem from './ProposalItem.vue'

// Props
const props = defineProps<{
  proposals: GenerationProposalViewModel[]
}>()

// Emits
const emit = defineEmits<{
  'accept-all': []
  'reject': []
}>()

// Store
const generationStore = useGenerationStore()

// Stan lokalny
const isConfirmDialogOpen = ref(false)

// Computed
const proposalsLabel = computed(() => {
  const count = props.proposals.length
  if (count === 1) return 'propozycję'
  else if (count >= 2 && count <= 4) return 'propozycje'
  else return 'propozycji'
})

// Metody
const handleUpdate = (proposal: GenerationProposalViewModel) => {
  generationStore.updateProposal(proposal)
}

const handleDelete = (tempId: string) => {
  generationStore.deleteProposal(tempId)
}

const handleReject = () => {
  isConfirmDialogOpen.value = true
}

const confirmReject = () => {
  isConfirmDialogOpen.value = false
  emit('reject')
}

const cancelReject = () => {
  isConfirmDialogOpen.value = false
}
</script>
