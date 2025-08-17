# API Endpoint Implementation Plan: POST /generations

## 1. Przegląd punktu końcowego
Endpoint `POST /generations` służy do generowania propozycji zadań za pomocą AI na podstawie opisu celu lub problemu przekazanego przez użytkownika. Wywołanie inicjuje proces generacji (tabela `generation_process`) i zwraca wygenerowane zadania wraz z metadanymi.

## 2. Szczegóły żądania
- Metoda HTTP: POST
- Ścieżka: `/generations`
- Parametry URL / Query: brak
- Request Body (JSON):
  ```ts
  interface GenerationRequestDTO {
    description: string; // szczegółowy opis celu/problem
  }
  ```
- Parametry:
  - Wymagane:
    - `description`: string (niepusty, max 1000 znaków)
  - Opcjonalne: brak
- Używane typy:
    - `CreateGenerationCommand` - request body
    - `CreateGenerationResponseDTO` - response body
    - `GenerationProposalTaskDTO` - pojedyncza propozycja zadania w odpowiedzi

## 3. Szczegóły odpowiedzi
- Kody statusu:
  - 201 Created – pomyślna generacja
  - 400 Bad Request – nieprawidłowe dane wejściowe
  - 401 Unauthorized – brak lub nieważny token
  - 500 Internal Server Error – błąd podczas wywołania LLM lub zapisu w bazie
- Response Body (JSON):
  ```ts
  interface GenerationProposalTaskDTO = {
    title: TaskInsert["title"]
    description?: TaskInsert["description"]
    source: "ai_full" // Zawężamy typ do konkretnej wartości, ponieważ AI zawsze generuje z source="ai_full"
  }
  interface GenerationResponseDTO {
    id: string; // UUID procesu generacji
    tasks: GenerationProposalTaskDTO[]; // lista wygenerowanych zadań
    generated_count: number;
    createdAt: string; // ISO timestamp
  }
  ```
- Przykład:
  ```json
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "tasks": [
      { "title": "Zbadaj wymagania", "description": "Przeprowadź wywiad z interesariuszami.", "source": "ai_full" }
      // ...
    ],
    "generated_count": 5,
    "createdAt": "2025-08-06T12:34:56.789Z"
  }
  ```

## 4. Przepływ danych
1. Klient wysyła żądanie do `server/api/generations.post.ts`.
2. Odbiór żądania POST z ciałem zawierającym description
3. Parsowanie i walidacja danych wejściowych (np. użycie Zod).
5. W `GenerationService`:
   - Obliczenie `source_text_hash` (np. SHA256) z pola `description`.
   - Wywołanie LLM API przez Openrouter.ai (model konfigurowalny w env).
   - Pomiar czasu trwania (duration).
   - Zapisanie rekordu w `generation_process` (user_id, model, source_text_hash, duration, generated_count).
   - W razie błędu: zapis w `generation_process_error_logs` z kodem i treścią błędu.
6. Kontroler zwraca `GenerationResponseDTO` z kodem 201.

## 5. Względy bezpieczeństwa
- Uwierzytelnianie: wymagana walidacja JWT z Supabase.
- Autoryzacja: każdy użytkownik może generować tylko własne zasoby.
- Walidacja danych wejściowych: sprawdzenie typów, długości, brak injection.
- Ochrona kluczy API LLM: przechowywać w zmiennych środowiskowych, nie w repozytorium.

## 6. Obsługa błędów
- 400 Bad Request:
  - `description` puste lub przekracza limit.
- 500 Internal Server Error:
  - Błąd komunikacji z LLM API → log do `generation_process_error_logs` i zwrot ogólnej wiadomości.
  - Błąd zapisu w bazie.

## 7. Wydajność
- Timeout dla wywołania AI: 30 sekund na czas oczekiwania, inaczej błąd timeout.
- Asynchroniczne, nieblokujące wywołania LLM.
- Batch insert do tabeli `tasks`.
- Indeks na `generation_process.user_id` i `tasks.generation_id`.

## 8. Kroki implementacji
1. Utworzyć serwis `GenerationService` w `~/server/services/generation.service.ts` który:
  - integruje się z zewnętrznym serwisem AI. Na etapie developmentu skorzystamy z mocków zamiast wywoływania serwisu AI.
  - Obsługuje logikę zapisu do tabeli generations oraz rejestracji błędów w generation_error_logs
2. Stworzyć endpoint w `~/server/api/generations.post.ts` który:
  - implementuje utworzony wcześniej serwis 
  - waliduje ządanie przy użyciu zod
3. Dodanie mechanizmu uwierzytelniania poprzez Supabase Auth.
4. Dodanie szczegółowego logowania akcji i błędów.
