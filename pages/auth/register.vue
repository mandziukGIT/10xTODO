<script setup lang="ts">
import { reactive } from 'vue'
import type { RegisterInput } from '~/server/validation/auth.schema'
import PasswordField from '~/components/auth/PasswordField.vue'

// Set the layout for this page
definePageMeta({
  layout: 'auth',
  noAuth: true
})

const { register, loginWithGithub, isLoading, error: authError } = useAuth()
const { validateRegister } = useFormValidation()

const formData = reactive<RegisterInput>({
  email: '',
  password: '',
  confirmPassword: ''
})

const errors = reactive<Record<string, string>>({})

const handleSubmit = async () => {
  // Reset form error
  errors.form = ''
  
  // Validate form using Zod
  const validation = validateRegister(formData)
  
  if (!validation.success) {
    // Update errors object with validation errors
    Object.assign(errors, validation.errors)
    return
  }
  
  try {
    await register(formData.email, formData.password)
    // Success will be handled by the useAuth composable (redirect to home)
  } catch (err) {
    errors.form = authError.value || 'Wystąpił błąd podczas rejestracji'
  }
}

const handleGithubLogin = async () => {
  await loginWithGithub()
}
</script>

<template>
  <AuthForm 
    title="Utwórz konto" 
    subtitle="Zacznij efektywnie zarządzać zadaniami"
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
          placeholder="Minimum 6 znaków"
          :error="errors.password"
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
      Zarejestruj się
    </template>
    
    <template #footer>
      <p class="text-center text-sm text-gray-600 mt-2">
        Masz już konto?
        <NuxtLink to="/auth/login" class="font-medium text-primary-600 hover:text-primary-500">
          Zaloguj się
        </NuxtLink>
      </p>
    </template>

    <template #social-buttons>
      <Button @click="handleGithubLogin" variant="outline" class="w-full">
        <Icon name="mdi:github" class="mr-2 h-4 w-4" />
        GitHub
      </Button>
    </template>
  </AuthForm>
</template>