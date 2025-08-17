<template>
  <Dialog :open="isModalOpen" @update:open="updateModalState">
    <DialogContent class="sm:max-w-[600px] sm:max-h-[80vh]">
      <DialogHeader>
        <DialogTitle>Planowanie zadań z AI</DialogTitle>
        <DialogDescription>
          Opisz swój cel, a AI wygeneruje dla Ciebie listę zadań.
        </DialogDescription>
      </DialogHeader>

      <!-- Dynamiczne renderowanie zawartości w zależności od stanu sesji -->
      <DialogScrollContent class="py-4">
        <GenerationForm 
          v-if="session.status === 'idle'"
          :is-loading="false"
          @generate="handleGenerate"
        />

        <LoadingState 
          v-else-if="session.status === 'loading'"
        />

        <ErrorState 
          v-else-if="session.status === 'error'"
          :error-message="session.error"
          @retry="handleRetry"
        />

        <ProposalList 
          v-else-if="session.status === 'proposals'"
          :proposals="session.proposals"
          @accept-all="handleAcceptAll"
          @reject="handleReject"
        />

        <div 
          v-else-if="session.status === 'submitting'"
          class="flex flex-col items-center justify-center py-8"
        >
          <Skeleton class="h-12 w-12 rounded-full" />
          <p class="mt-4 text-sm text-gray-500">Zapisywanie zadań...</p>
        </div>
      </DialogScrollContent>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogScrollContent } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { useGenerationStore } from '~/stores/generation'
import { storeToRefs } from 'pinia'
import type { CreateGenerationCommand } from '~/types'

// Pobieramy store i jego reaktywne właściwości
const generationStore = useGenerationStore()
const { session, isModalOpen } = storeToRefs(generationStore)

// Metody obsługujące interakcje użytkownika
const updateModalState = (isOpen: boolean) => {
  if (isOpen) {
    generationStore.openModal()
  } else {
    generationStore.closeModal()
  }
}

const handleGenerate = (payload: CreateGenerationCommand) => {
  generationStore.generateProposals(payload.description)
}

const handleRetry = () => {
  if (session.value.description) {
    generationStore.generateProposals(session.value.description)
  }
}

const handleAcceptAll = () => {
  generationStore.acceptProposals()
}

const handleReject = () => {
  generationStore.rejectSession()
}
</script>
