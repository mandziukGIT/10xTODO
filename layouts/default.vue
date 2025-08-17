<script setup lang="ts">
const { user, logout, isLoading } = useAuth()

const handleLogout = async () => {
  await logout()
  // Navigation will be handled by the useAuth composable
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <NuxtLink to="/" class="text-xl font-bold text-gray-900">TODO-10x</NuxtLink>
        
        <div v-if="user" class="flex items-center space-x-4">
          <span class="text-sm text-gray-600">{{ user.email }}</span>
          <Button 
            variant="outline" 
            size="sm" 
            :disabled="isLoading" 
            @click="handleLogout"
          >
            <span v-if="isLoading" class="flex items-center">
              <div class="h-3 w-3 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mr-1"/>
              Logging out...
            </span>
            <span v-else>Logout</span>
          </Button>
        </div>
      </div>
    </header>
    
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <slot />
    </main>
  </div>
</template>
