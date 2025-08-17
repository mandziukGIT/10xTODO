# Specyfikacja modułu uwierzytelniania (rejestracja, logowanie, odzyskiwanie hasła)

## 1. Architektura interfejsu użytkownika

### 1.1 Strony Nuxt
- **`/pages/auth/register.vue`** – formularz rejestracji z polami `email`, `password` i przyciskiem „Zarejestruj się`.
- **`/pages/auth/login.vue`** – formularz logowania z polami `email`, `password` i przyciskiem „Zaloguj się”.
- **`/pages/auth/forgot-password.vue`** – formularz odzyskiwania hasła z polem `email` i przyciskiem „Wyślij link resetujący”.
- **`/pages/auth/reset-password/[token].vue`** – formularz ustawienia nowego hasła: pola `newPassword`, `confirmPassword`, przycisk „Zmień hasło”.
- **`/pages/index.vue`** – główny widok listy zadań, chroniony middlewarem auth.

### 1.2 Layouty
- **`layouts/default.vue`** – główny layout z nagłówkiem; jeśli użytkownik zalogowany, wyświetla przycisk wylogowania (`Logout`) i nawigację.
- **`layouts/auth.vue`** – uproszczony layout dla stron `/auth/*`, bez elementów listy zadań, z możliwością nawigacji do logowania/rejestracji.

### 1.3 Komponenty i composables
- **Komponenty UI**: wykorzystanie istniejących `components/ui/Input.vue`, `Button.vue`, `Dialog` itp.
- **Nowe komponenty**:
  - `AuthForm.vue` – wrapper obsługujący wspólne funkcje (spinner, błędy, przekierowania).
  - `PasswordField.vue` – komponent pola hasła z możliwością pokazania/ukrycia.
- **Composables**:
  - `composables/useAuth.ts` – logika rejestracji, logowania, wylogowania, stan użytkownika.
  - `composables/useFormValidation.ts` – reguły walidacji (email regex, min 6 znaków dla hasła).

### 1.4 Walidacja i komunikaty błędów
- Email: sprawdzenie formatu (`/^[^@\s]+@[^@\s]+\.[^@\s]+$/`), komunikat: „Podaj poprawny adres e-mail”.
- Hasło: min. 6 znaków, komunikat: „Hasło musi mieć co najmniej 6 znaków”.
- W widoku błędy wyświetlane pod odpowiednim polem, czerwony kolor (Tailwind `text-red-600`).
- Globalne błędy API (np. użytkownik już istnieje, niepoprawne dane) wyświetlane nad formularzem.

### 1.5 Scenariusze użytkownika
1. Rejestracja pomyślna → przekierowanie do `/` (lista zadań).
2. Rejestracja nieudana (email zajęty) → komunikat błędu.
3. Logowanie udane → przekierowanie do `/`.
4. Logowanie nieudane (niepoprawne dane) → komunikat błędu.
5. Wysłanie linku resetującego → komunikat „Sprawdź e-mail, aby zresetować hasło”.
6. Zmiana hasła przez link → komunikat „Hasło zostało zmienione”, przekierowanie do `/auth/login`.

## 2. Logika backendowa

### 2.1 Endpointy w `server/api/auth/`
- **`register.post.ts`** (POST `/api/auth/register`)
  - Body: `{ email: string; password: string }`.
  - Walidacja Zod w `server/validation/auth.schema.ts`.
  - `supabase.auth.signUp({ email, password })`, zwraca `{ user, session }` lub błąd.
- **`login.post.ts`** (POST `/api/auth/login`)
  - Body: `{ email: string; password: string }`.
  - `supabase.auth.signInWithPassword(...)`.
- **`logout.post.ts`** (POST `/api/auth/logout`)
  - `supabase.auth.signOut()`.
- **`reset-password.post.ts`** (POST `/api/auth/reset-password`)
  - Body: `{ access_token: string; new_password: string }`.
  - `supabase.auth.updateUser({ access_token, password: new_password })`.
- **`delete-account.delete.ts`** (DELETE `/api/auth/delete-account`)
  - Requires authentication.
  - Deletes the current user and related data via `supabase.auth.deleteUser()`.

### 2.2 Modele danych
- Brak dodatkowych tabel – wykorzystanie wbudowanej tabeli `auth.users` w Supabase.

### 2.3 Mechanizm walidacji
- Schematy Zod w `server/validation/auth.schema.ts`:
  - `registerSchema`, `loginSchema`, `forgotSchema`, `resetSchema`.
- Walidacja na wejściu, błędy zwracane jako status 400 z opisem.

### 2.4 Obsługa wyjątków
- Early return przy nieprzechodzącej walidacji.
- Obsługa błędów z Supabase (`error?.message`) → odpowiedź JSON `{ error: message }` z odpowiednim kodem HTTP.
- Nieznane błędy → catch-all i status 500.

## 3. System autentykacji

### 3.1 Wykorzystanie Supabase Auth
- **Rejestracja**: `signUp`, opcja weryfikacji email w panelu Supabase.
- **Logowanie**: `signInWithPassword` zwraca `access_token` i `refresh_token`.
- **Wylogowanie**: `signOut`, usunięcie sesji.
- **Odzyskanie hasła**: `supabase.auth.resetPasswordForEmail(email, { redirectTo: '<frontend_url>/auth/reset-password' })`.
- **Usuwanie konta**: `supabase.auth.deleteUser()`.

### 3.2 Zarządzanie sesją
- W front-endzie `composables/useAuth.ts` pobiera sesję (`supabase.auth.getSession`) i udostępnia reactive `user`.
- Zapis `access_token` jako ciasteczko HTTPOnly (plugin Supabase automatycznie). 

### 3.3 Middleware Nuxt
- **`/middleware/auth.ts`** – blokuje dostęp do stron chronionych (`defineNuxtRouteMiddleware`).
- Konfiguracja w `nuxt.config.ts`:
  ```ts
  export default defineNuxtConfig({
    routeRules: {
      '/auth/**': { noAuth: true },
      '/**': { auth: true }
    }
  })
  ```

### 3.4 Integracja w UI
- We wszystkich requestach do API używanie `$fetch('/api/auth/...')` z obsługą loading i błędów.
- W nagłówku głównego layoutu przycisk „Wyloguj się” wywołujący `useAuth().logout()`.
