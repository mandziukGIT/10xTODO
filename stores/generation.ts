import { defineStore } from 'pinia'
import { v4 as uuidv4 } from 'uuid'
import { ref } from 'vue'
import { useTasks } from '~/stores/tasks'
import type { 
  GenerationProposalTaskDTO, 
  CreateGenerationResponseDTO,
  CreateTaskCommand
} from '~/types'

// Typy dla widoku modelu
export interface GenerationProposalViewModel extends GenerationProposalTaskDTO {
  tempId: string
  isEdited: boolean
  isEditing: boolean
}

export type GenerationSessionStatus = 'idle' | 'loading' | 'proposals' | 'error' | 'submitting'

export interface GenerationSessionViewModel {
  generationId: string | null
  status: GenerationSessionStatus
  description: string
  proposals: GenerationProposalViewModel[]
  error: string | null
}

// Definicja store'a
export const useGenerationStore = defineStore('generation', () => {
  // Stan
  const session = ref<GenerationSessionViewModel>({
    generationId: null,
    status: 'idle',
    description: '',
    proposals: [],
    error: null
  })
  
  const isModalOpen = ref(false)
  
  // Akcje
  function openModal() {
    isModalOpen.value = true
  }
  
  function closeModal() {
    isModalOpen.value = false
  }
  
  function resetSession() {
    session.value = {
      generationId: null,
      status: 'idle',
      description: '',
      proposals: [],
      error: null
    }
  }
  
  async function generateProposals(description: string) {
    try {
      // Aktualizujemy stan na ładowanie
      session.value = {
        ...session.value,
        status: 'loading',
        description
      }
      
      // Wywołujemy API
      const { data, error } = await useFetch<CreateGenerationResponseDTO>('/api/generations', {
        method: 'POST',
        body: { description }
      })
      
      if (error.value) {
        throw new Error(error.value?.message || 'Wystąpił błąd podczas generowania zadań')
      }
      
      if (!data.value) {
        throw new Error('Nie udało się wygenerować zadań')
      }
      
      // Mapujemy odpowiedź na model widoku
      const proposals: GenerationProposalViewModel[] = data.value.tasks.map(task => ({
        ...task,
        tempId: uuidv4(),
        isEdited: false,
        isEditing: false
      }))
      
      // Aktualizujemy stan
      session.value = {
        generationId: data.value.generationId,
        status: 'proposals',
        description,
        proposals,
        error: null
      }
      } catch (err: unknown) {
    // Obsługa błędów
    const errorMessage = err instanceof Error ? err?.message : 'Wystąpił nieznany błąd podczas generowania zadań'
    session.value = {
      ...session.value,
      status: 'error',
      error: errorMessage
    }
    }
  }
  
  function updateProposal(proposal: GenerationProposalViewModel) {
    const index = session.value.proposals.findIndex(p => p.tempId === proposal.tempId)
    if (index !== -1) {
      // Create a new array to trigger reactivity
      const updatedProposals = [...session.value.proposals]
      // Update the proposal at the specific index
      updatedProposals[index] = {
        ...proposal,
        isEdited: true,
        isEditing: proposal.isEditing
      }
      // Update the session with the new array
      session.value = {
        ...session.value,
        proposals: updatedProposals
      }
    }
  }
  
  function deleteProposal(tempId: string) {
    session.value.proposals = session.value.proposals.filter(p => p.tempId !== tempId)
  }
  
  async function acceptProposals() {
    if (session.value.proposals.length === 0) return
    
    try {
      // Aktualizujemy stan na zapisywanie
      session.value.status = 'submitting'
      
      // Pobieramy store zadań
      const tasksStore = useTasks()
      
      // Zapisujemy każdą propozycję jako zadanie
      for (const proposal of session.value.proposals) {
        const command: CreateTaskCommand = {
          title: proposal.title,
          description: proposal.description,
          parentTaskId: null,
          // Ustawiamy źródło w zależności od tego, czy propozycja była edytowana
          source: proposal.isEdited ? 'ai_edited' : 'ai_full',
          generationId: session.value.generationId,
          position: 0 // Pozycja zostanie ustawiona przez serwer
        }
        
        await tasksStore.createTask(command)
      }
      
      // Odświeżamy listę zadań
      await tasksStore.fetchTasks()
      
      // Zamykamy modal i resetujemy sesję
      resetSession()
      closeModal()
      
    } catch (err: unknown) {
      // Wracamy do stanu z propozycjami i pokazujemy błąd
      const errorMessage = err instanceof Error ? err?.message : 'Wystąpił błąd podczas zapisywania zadań'
      session.value.status = 'proposals'
      session.value.error = errorMessage
    }
  }
  
  function rejectSession() {
    resetSession()
    closeModal()
  }
  
  return {
    session,
    isModalOpen,
    openModal,
    closeModal,
    resetSession,
    generateProposals,
    updateProposal,
    deleteProposal,
    acceptProposals,
    rejectSession
  }
})
