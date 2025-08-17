<script setup lang="ts">
import { ref, reactive } from 'vue'
import type { ForgotPasswordInput } from '~/server/validation/auth.schema'

// Set the layout for this page
definePageMeta({
  layout: 'auth',
  noAuth: true
})

const { forgotPassword, isLoading, error: authError } = useAuth()
const { validateForgotPassword } = useFormValidation()

const formData = reactive<ForgotPasswordInput>({
  email: ''
})

const errors = reactive<Record<string, string>>({})
const isSubmitted = ref(false)

const handleSubmit = async () => {
  // Reset form error
  errors.form = ''
  
  // Validate form using Zod
  const validation = validateForgotPassword(formData)
  
  if (!validation.success) {
    // Update errors object with validation errors
    Object.assign(errors, validation.errors)
    return
  }
  
  try {
    await forgotPassword(formData.email)
    isSubmitted.value = true
  } catch {
    errors.form = authError.value || 'Wystąpił błąd'
  }
}
</script>

<template>
  <div>
    <!-- Success message after submission -->
    <div v-if="isSubmitted" class="bg-white p-8 rounded-lg shadow mt-8">
      <div class="text-center">
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Sprawdź swoją skrzynkę</h2>
        <p class="text-gray-600 mb-6">
          Wysłaliśmy link do resetowania hasła na adres <strong>{{ formData.email }}</strong>.
          Sprawdź swoją skrzynkę i postępuj zgodnie z instrukcjami.
        </p>
        <NuxtLink to="/auth/login" class="inline-block text-primary-600 hover:text-primary-500">
          Wróć do logowania
        </NuxtLink>
      </div>
    </div>
    
    <!-- Password reset request form -->
    <AuthForm 
      v-else
      title="Zresetuj hasło" 
      subtitle="Wyślemy Ci link do zresetowania hasła"
      :is-submitting="isLoading"
      :error="errors.form"
      @submit="handleSubmit"
    >
      <div>
        <label for="email" class="block text-sm font-medium text-gray-700">Adres email</label>
        <div class="mt-1">
          <Input
            id="email"
            v-model="formData.email"
            type="email"
            autocomplete="email"
            required
            placeholder="twoj@email.com"
          />
          <p v-if="errors.email" class="mt-1 text-sm text-red-600">{{ errors.email }}</p>
        </div>
      </div>
      
      <template #submit-text>
        Wyślij link resetujący
      </template>
      
      <template #footer>
        <p class="text-center text-sm text-gray-600 mt-2">
          Pamiętasz swoje hasło?
          <NuxtLink to="/auth/login" class="font-medium text-primary-600 hover:text-primary-500">
            Zaloguj się
          </NuxtLink>
        </p>
      </template>
    </AuthForm>
  </div>
</template>