<script setup lang="ts">
import { ref, reactive } from 'vue'
import type { ResetPasswordInput } from '~/server/validation/auth.schema'
import PasswordField from '~/components/auth/PasswordField.vue'

// Set the layout for this page
definePageMeta({
  layout: 'auth',
  noAuth: true
})

const route = useRoute()
const token = route.params.token as string

const { resetPassword, isLoading, error: authError } = useAuth()
const { validateResetPassword } = useFormValidation()

const formData = reactive<Omit<ResetPasswordInput, 'token'>>({
  newPassword: '',
  confirmPassword: ''
})

const errors = reactive<Record<string, string>>({})
const isSubmitted = ref(false)

const handleSubmit = async () => {
  // Reset form error
  errors.form = ''
  
  // Validate form using Zod
  const validation = validateResetPassword({
    token,
    ...formData
  })
  
  if (!validation.success) {
    // Update errors object with validation errors
    Object.assign(errors, validation.errors)
    return
  }
  
  try {
    await resetPassword(token, formData.newPassword)
    isSubmitted.value = true
    
    // Redirect to login page after 3 seconds
    setTimeout(() => {
      navigateTo('/auth/login')
    }, 3000)
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
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Hasło zmienione pomyślnie</h2>
        <p class="text-gray-600 mb-6">
          Twoje hasło zostało zaktualizowane. Za chwilę zostaniesz przekierowany do strony logowania.
        </p>
        <NuxtLink to="/auth/login" class="inline-block text-primary-600 hover:text-primary-500">
          Przejdź do logowania
        </NuxtLink>
      </div>
    </div>
    
    <!-- Password reset form -->
    <AuthForm 
      v-else
      title="Ustaw nowe hasło" 
      subtitle="Wprowadź swoje nowe hasło poniżej"
      :is-submitting="isLoading"
      :error="errors.form"
      @submit="handleSubmit"
    >
      <div>
        <label for="newPassword" class="block text-sm font-medium text-gray-700">Nowe hasło</label>
        <div class="mt-1">
          <PasswordField
            id="newPassword"
            v-model="formData.newPassword"
            required
            placeholder="Minimum 6 znaków"
            :error="errors.newPassword"
          />
        </div>
      </div>
      
      <div>
        <label for="confirmPassword" class="block text-sm font-medium text-gray-700">Potwierdź hasło</label>
        <div class="mt-1">
          <PasswordField
            id="confirmPassword"
            v-model="formData.confirmPassword"
            required
            placeholder="Powtórz hasło"
            :error="errors.confirmPassword"
          />
        </div>
      </div>
      
      <template #submit-text>
        Zmień hasło
      </template>
    </AuthForm>
  </div>
</template>