<script setup lang="ts">
import { reactive } from 'vue'
import type { LoginInput } from '~/types'
import PasswordField from '~/components/auth/PasswordField.vue'

// Set the layout for this page
definePageMeta({
  layout: 'auth',
  noAuth: true
})

const { login, isLoading, error: authError } = useAuth()
const { validateLogin } = useFormValidation()

const formData = reactive<LoginInput>({
  email: '',
  password: ''
})

const errors = reactive<Record<string, string>>({})

const handleSubmit = async () => {
  // Reset form error
  errors.form = ''
  
  // Validate form using Zod
  const validation = validateLogin(formData)
  
  if (!validation.success) {
    // Update errors object with validation errors
    Object.assign(errors, validation.errors)
    return
  }
  
  try {
    await login(formData.email, formData.password)
    // Success will be handled by the useAuth composable (redirect to home)
  } catch {
    errors.form = authError.value || 'Nieprawidłowy email lub hasło'
  }
}
</script>

<template>
  <AuthForm 
    title="Zaloguj się do konta" 
    subtitle="Zarządzaj swoimi zadaniami efektywnie"
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
    
    <div>
      <label for="password" class="block text-sm font-medium text-gray-700">Hasło</label>
      <div class="mt-1">
        <PasswordField
          id="password"
          v-model="formData.password"
          required
          placeholder="Twoje hasło"
          :error="errors.password"
        />
      </div>
    </div>
    
    <div class="flex items-center justify-end">
      <div class="text-sm">
        <NuxtLink to="/auth/forgot-password" class="font-medium text-primary-600 hover:text-primary-500">
          Zapomniałeś hasła?
        </NuxtLink>
      </div>
    </div>
    
    <template #submit-text>
      Zaloguj się
    </template>
    
    <template #footer>
      <p class="text-center text-sm text-gray-600 mt-2">
        Nie masz konta?
        <NuxtLink to="/auth/register" class="font-medium text-primary-600 hover:text-primary-500">
          Zarejestruj się
        </NuxtLink>
      </p>
    </template>
  </AuthForm>
</template>