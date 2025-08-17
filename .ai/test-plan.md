# Plan Testów dla Aplikacji 10X-TODO

## 1. Wprowadzenie i cele testowania

### 1.1. Wprowadzenie

Niniejszy dokument opisuje plan testów dla aplikacji webowej 10X-TODO, narzędzia do zarządzania zadaniami zintegrowanego ze sztuczną inteligencją. Plan obejmuje strategię, zakres, zasoby i harmonogram działań testowych mających na celu zapewnienie wysokiej jakości, niezawodności i bezpieczeństwa aplikacji.

### 1.2. Cele testowania

Główne cele procesu testowania to:
- Weryfikacja, czy wszystkie funkcjonalności aplikacji działają zgodnie ze specyfikacją.
- Zapewnienie bezpieczeństwa danych użytkowników i integralności systemu.
- Identyfikacja i zaraportowanie defektów przed wdrożeniem produkcyjnym.
- Ocena wydajności i użyteczności aplikacji.
- Zapewnienie stabilności integracji z usługami zewnętrznymi (Supabase, Openrouter.ai).
- Potwierdzenie, że aplikacja spełnia kryteria akceptacji.

## 2. Zakres testów

### 2.1. Funkcjonalności objęte testami

- **Moduł autentykacji:** Rejestracja, logowanie, wylogowanie, ochrona tras.
- **Zarządzanie zadaniami (CRUD):** Tworzenie, odczyt, aktualizacja (edycja, oznaczanie jako ukończone) i usuwanie zadań.
- **Generowanie zadań przez AI:** Inicjowanie sesji generowania, wprowadzanie celu, otrzymywanie i akceptowanie propozycji zadań.
- **Interfejs użytkownika:** Wyświetlanie listy zadań, obsługa pustej listy, stany ładowania i błędów.
- **Walidacja danych:** Sprawdzanie poprawności danych wejściowych w formularzach i na poziomie API.

### 2.2. Funkcjonalności wyłączone z testów

- Testy wewnętrznej infrastruktury Supabase i Openrouter.ai (zakładamy ich niezawodność, testujemy jedynie integrację z nimi).
- Testy kompatybilności z nieobsługiwanymi przeglądarkami i systemami operacyjnymi.

## 3. Typy testów

- **Testy jednostkowe (Unit Tests):** Weryfikacja poszczególnych komponentów Vue, funkcji `composables`, akcji i getterów w sklepach Pinia oraz logiki w endpointach API w izolacji.
- **Testy integracyjne (Integration Tests):** Sprawdzanie współpracy między komponentami (np. formularz i sklep Pinia), a także integracji warstwy API z bazą danych Supabase.
- **Testy End-to-End (E2E):** Symulacja rzeczywistych scenariuszy użycia aplikacji przez użytkownika w przeglądarce, obejmująca całe przepływy, np. od logowania, przez dodanie zadania, aż do wylogowania.
- **Testy API (API Tests):** Bezpośrednie testowanie endpointów `server/api/` w celu weryfikacji logiki biznesowej, walidacji, kodów odpowiedzi HTTP i formatu danych.
- **Testy bezpieczeństwa (Security Tests):** Weryfikacja mechanizmów autentykacji i autoryzacji, w szczególności ochrona przed dostępem do danych innych użytkowników (testowanie reguł RLS).
- **Testy wydajnościowe (Performance Tests):** Ocena czasu odpowiedzi API pod obciążeniem, zwłaszcza dla operacji pobierania dużej liczby zadań.

## 4. Scenariusze testowe dla kluczowych funkcjonalności

### 4.1. Autentykacja
- **TC-AUTH-01:** Użytkownik może pomyślnie zarejestrować nowe konto.
- **TC-AUTH-02:** Użytkownik nie może zarejestrować konta z już istniejącym adresem e-mail.
- **TC-AUTH-03:** Użytkownik może pomyślnie zalogować się przy użyciu poprawnych danych.
- **TC-AUTH-04:** Użytkownik nie może zalogować się przy użyciu niepoprawnych danych.
- **TC-AUTH-05:** Niezalogowany użytkownik jest przekierowywany na stronę logowania przy próbie dostępu do chronionej trasy.
- **TC-AUTH-06:** Zalogowany użytkownik może się pomyślnie wylogować.

### 4.2. Zarządzanie zadaniami
- **TC-TASK-01:** Zalogowany użytkownik może utworzyć nowe zadanie.
- **TC-TASK-02:** Utworzone zadanie jest poprawnie wyświetlane na liście.
- **TC-TASK-03:** Użytkownik może oznaczyć zadanie jako ukończone.
- **TC-TASK-04:** Użytkownik może edytować istniejące zadanie.
- **TC-TASK-05:** Użytkownik może usunąć istniejące zadanie.
- **TC-TASK-06:** Użytkownik widzi tylko swoje zadania.

### 4.3. Generowanie zadań przez AI
- **TC-GEN-01:** Użytkownik może otworzyć modal generowania zadań.
- **TC-GEN-02:** Użytkownik może wysłać zapytanie o wygenerowanie zadań i zobaczyć stan ładowania.
- **TC-GEN-03:** Po pomyślnym wygenerowaniu, użytkownik widzi listę proponowanych zadań.
- **TC-GEN-04:** Użytkownik może zaakceptować wybrane propozycje, które następnie są dodawane do jego głównej listy zadań.
- **TC-GEN-05:** W przypadku błędu generowania, użytkownik otrzymuje stosowny komunikat.

## 5. Środowisko testowe

- **Baza danych:** Dedykowana, odizolowana instancja bazy danych Supabase/PostgreSQL dla celów testowych, regularnie czyszczona przed uruchomieniem testów.
- **API usług zewnętrznych:** Rzeczywiste API Supabase. API Openrouter.ai będzie mockowane w testach jednostkowych/integracyjnych, a testowane na żywo w testach E2E na środowisku Staging.
- **Środowisko uruchomieniowe:** Testy jednostkowe i integracyjne uruchamiane w środowisku Node.js. Testy E2E uruchamiane w kontenerze Docker z przeglądarką Chrome.

## 6. Narzędzia do testowania

- **Framework do testów jednostkowych i integracyjnych:** Vitest
- **Biblioteka do testowania komponentów Vue:** Vue Test Utils
- **Framework do testów E2E:** Playwright
- **Narzędzie do testów API:** "Supertest + MSW (Mock Service Worker) dla mockowania"
- **CI/CD:** GitHub Actions (do automatycznego uruchamiania testów po każdym pushu do repozytorium)

## 7. Kryteria akceptacji testów

### 7.1. Kryteria wejścia
- Kod źródłowy jest dostępny w repozytorium.
- Środowisko testowe jest skonfigurowane i dostępne.
- Wszystkie zależności projektu są zainstalowane.

### 7.2. Kryteria wyjścia
- Co najmniej 95% testów jednostkowych i integracyjnych kończy się sukcesem.
- 100% testów E2E dla krytycznych ścieżek użytkownika kończy się sukcesem.
- Brak nierozwiązanych błędów o priorytecie krytycznym lub wysokim.
- Pokrycie kodu testami (code coverage) na poziomie co najmniej 80% dla kluczowych modułów (API, sklepy Pinia).

## 8. Role i odpowiedzialności

- **Deweloperzy:** Odpowiedzialni za pisanie testów jednostkowych i integracyjnych dla tworzonego przez siebie kodu.
- **Inżynier QA:** Odpowiedzialny za tworzenie i utrzymanie planu testów, pisanie testów E2E, przeprowadzanie testów manualnych, raportowanie i weryfikację błędów.
- **Product Owner:** Odpowiedzialny za zdefiniowanie kryteriów akceptacji i ostateczne zatwierdzenie funkcjonalności.

## 9. Procedury raportowania błędów

1.  **Zgłaszanie błędów:** Wszystkie znalezione defekty muszą być raportowane w systemie do śledzenia zadań (np. GitHub Issues).
2.  **Format zgłoszenia:** Każde zgłoszenie powinno zawierać:
    - Tytuł: Zwięzły opis problemu.
    - Opis: Szczegółowy opis błędu, w tym kroki do jego odtworzenia.
    - Oczekiwany rezultat: Jak aplikacja powinna się zachować.
    - Rzeczywisty rezultat: Co faktycznie się stało.
    - Środowisko: Wersja przeglądarki, system operacyjny.
    - Priorytet: (Krytyczny, Wysoki, Średni, Niski).
    - Załączniki: Zrzuty ekranu, nagrania wideo, logi konsoli.
3.  **Cykl życia błędu:**
    - `Nowy`: Zgłoszony błąd.
    - `W trakcie analizy`: Deweloper analizuje problem.
    - `Do poprawy`: Błąd zaakceptowany do naprawy.
    - `W trakcie naprawy`: Deweloper pracuje nad poprawką.
    - `Do weryfikacji`: Poprawka zaimplementowana i gotowa do testów.
    - `Zamknięty`: Błąd zweryfikowany i poprawnie rozwiązany.
    - `Odrzucony`: Zgłoszenie nie jest błędem.