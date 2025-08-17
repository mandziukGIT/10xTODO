# Architektura UI dla Planer AI wspomaganego LLM

## 1. Przegląd struktury UI
Aplikacja składa się z czterech głównych widoków oraz globalnych komponentów i modali, przygotowanych w Nuxt 3 z wykorzystaniem Tailwind 4 i shadcn/vue. Obsługa stanu odbywa się przez Pinia. Kluczowe elementy: komponenty TaskCard, TaskList, AiSessionModal, ConfirmDialog, LoadingSkeleton.

## 2. Lista widoków

1. Ekran logowania/rejestracji
   - Ścieżka: `/auth`
   - Cel: uwierzytelnienie użytkownika
   - Kluczowe informacje: pola email i hasło, przyciski Logowanie/Rejestracja, komunikaty walidacyjne
   - Kluczowe komponenty: `AuthForm`, `InputField`, `Button`, `InlineValidationMessage`
   - UX: walidacja przy submit, fokus na pierwsze pole, disabled przy braku danych; dostępność: aria-label; bezpieczeństwo: typ password, throttle prób

2. Główny widok listy zadań
   - Ścieżka: `/`
   - Cel: zarządzanie zadaniami i podzadaniami
   - Kluczowe informacje: lista zadań zagnieżdżonych, stan ukończenia, opcje CRUD, przycisk „Nowe zadanie”, przycisk „Sesja AI”
   - Kluczowe komponenty: `TaskList`, `TaskCard`, `AddTaskButton`, `SessionTrigger`, `LoadingSkeleton`, `EmptyList`
   - UX: skeleton podczas ładowania, stan pustej listy, responsywność; dostępność: aria-live dla listy, keyboard nav; bezpieczeństwo: ochrona endpointów auth

3. Modal sesji planowania AI
   - Element globalny (używany w głównym widoku)
   - Cel: generowanie i edycja propozycji zadań przez AI
   - Kluczowe informacje: pole `description` (100–500 zn.), przycisk „Generuj zadania”, stany: Loading (spinner), Results (4–8 propozycji), Error (timeout lub błąd LLM)
   - Kluczowe komponenty: `Modal`, `TextArea`, `Button`, `Spinner`, `ProposalList`, `ProposalItem` (inline-edit, delete), `ConfirmDialog`, `LoadingSkeleton`
   - UX: focus trap, debounce auto-save, disabled przy duplikowaniu clicków; dostępność: aria-modal, rolle dialog, opisy błędów; bezpieczeństwo: brak sekretów w localStorage

4. Ustawienia konta
   - Ścieżka: `/settings`
   - Cel: zarządzanie podstawowymi danymi konta i wylogowaniem
   - Kluczowe informacje: email użytkownika, przycisk Wyloguj (przyszłe opcje: usuń konto)
   - Kluczowe komponenty: `SettingsForm`, `Button`, `ConfirmDialog`
   - UX: potwierdzenie wylogowania, komunikaty statusu; dostępność: opis przycisków; bezpieczeństwo: placeholder auth

## 3. Mapa podróży użytkownika
1. Użytkownik nieautoryzowany → ekran `/auth` → rejestracja/logowanie
2. Po loginie → przekierowanie do `/` → główny widok listy zadań
3. Klik „Sesja AI” → otwarcie `SessionModal` → wpisanie opisu → „Generuj zadania” (Loading) → wyświetlenie propozycji (Results)
4. Edycja/usunięcie propozycji inline + auto-save w Pinia/localStorage
5. Klik „Akceptuj wszystkie” → walidacja limitów → bulk insert do `/tasks` → powrót do widoku listy z odświeżonymi zadaniami
6. Operacje CRUD w `TaskCard` (add, edit, delete, complete) → optimistic UI + background sync (`PATCH /tasks/{id}/complete`)

## 4. Układ i struktura nawigacji
- Globalny `Header` z logo i linkami: Lista zadań (sticky), Ustawienia
- Na urządzeniach mobilnych: hamburger menu toggleujące nawigację
- Modale (`SessionModal`, `ConfirmDialog`) jako nakładki z focus-trap
- Ikony statusu synchronizacji w rogu ekranu

## 5. Kluczowe komponenty
- TaskCard: checkbox, tytuł (inline-edit), opis (inline-edit), ikony akcji (edytuj/usun/add-subtask)
- TaskList: renderuje zagnieżdżoną listę `TaskCard` z drag-disabled powyżej limitów
- SessionModal: form, loading, lista propozycji, akcje inline
- Modal & ConfirmDialog: uniwersalne modale z focus-trap i aria
- LoadingSkeleton & EmptyList: czytelne stany podczas ładowania i pustej listy
- InlineTextEditor: edycja z debounce auto-save i a11y
- Header/NavBar: responsywna nawigacja, aria landmarks
