<script setup lang="ts">
// Auth layout for authentication pages
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div class="text-center">
        <h1 class="text-3xl font-bold text-gray-900">TODO-10x</h1>
        <p class="mt-2 text-sm text-gray-600">Manage your tasks efficiently</p>
      </div>
      
      <slot />
      
      <div class="mt-6 text-center">
        <div class="space-x-4">
          <NuxtLink 
            to="/auth/login" 
            class="text-sm font-medium text-primary-600 hover:text-primary-500"
          >
            Login
          </NuxtLink>
          <span class="text-gray-400">|</span>
          <NuxtLink 
            to="/auth/register" 
            class="text-sm font-medium text-primary-600 hover:text-primary-500"
          >
            Register
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
