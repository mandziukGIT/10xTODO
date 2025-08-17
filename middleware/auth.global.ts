export default defineNuxtRouteMiddleware((to) => {
  const user = useSupabaseUser()

  // Lista ścieżek, które są dostępne tylko dla niezalogowanych użytkowników
  const authRoutes = ['/auth/login', '/auth/register', '/auth/forgot-password']

  // Jeśli użytkownik jest zalogowany
  if (user.value) {
    // I próbuje uzyskać dostęp do stron logowania/rejestracji, przekieruj go na stronę główną
    if (authRoutes.includes(to.path) || to.path.startsWith('/auth/reset-password'))
      return navigateTo('/')
  }
  // Jeśli użytkownik nie jest zalogowany
  else {
    // I próbuje uzyskać dostęp do innej strony niż logowanie/rejestracja, przekieruj go na stronę logowania
    if (!authRoutes.includes(to.path) && !to.path.startsWith('/auth/reset-password'))
      return navigateTo('/auth/login')
  }
})
