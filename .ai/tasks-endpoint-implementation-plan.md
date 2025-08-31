# API Endpoint Implementation Plan: POST /tasks

## 1. Przegląd punktu końcowego

Celem punktu końcowego **POST /tasks** jest umożliwienie uwierzytelnionemu użytkownikowi tworzenia nowych zadań oraz podzadań (maximum dwóch poziomów zagnieżdżenia). Endpoint przyjmuje dane w formacie JSON, zapisuje rekord w tabeli `tasks` i zwraca dane nowo utworzonego zadania.

## 2. Szczegóły żądania

- Metoda HTTP: POST
- Ścieżka URL: `/tasks` (Nuxt server route: `server/api/tasks.post.ts`)
- Body (application/json):
  ```json
  {
    "title": "string (max 255 zn.)",
    "description": "string | null",
    "parentTaskId": "uuid | null",
    "source": "ai_full" | "ai_edited" | "manual",
    "generationId": "uuid | null"
  }
  ```
- Parametry:
  - Wymagane:
    - `title` (string)
    - `parentTaskId` (uuid lub null)
    - `source` (enum: `ai_full`, `ai_edited`, `manual`)
    - `generationId` (uuid lub null) – wymagane, gdy `source` = `ai_full` lub `ai_edited`
  - Opcjonalne:
    - `description` (string|null)

## 3. Wykorzystywane typy

- **CreateTaskCommand** – model żądania (w types.ts; należy rozszerzyć o pole `generationId`).
- **TaskInsert** – alias typu zgodnie z `db/database.types.ts`.
- **TaskDTOBase** – bazowy DTO zadania (pola publiczne).
- **CreateTaskResponseDTO** – model odpowiedzi (id, title, description, source, createdAt).

## 4. Szczegóły odpowiedzi

- Kod statusu: **201 Created**
- Body (application/json):
  ```json
  {
    "id": "uuid",
    "title": "string",
    "description": "string | null",
    "source": "ai_full" | "ai_edited" | "manual",
    "createdAt": "timestamp"
  }
  ```
- Kody błędów:
  - **400 Bad Request** – błędy walidacji, przekroczenie limitów, nieprawidłowe UUID, za duże zagnieżdżenie
  - **401 Unauthorized** – brak lub nieprawidłowy token
  - **404 Not Found** – nieistniejący `parentTaskId` lub `generationId` nie należący do użytkownika
  - **500 Internal Server Error** – nieoczekiwane błędy serwera

## 5. Przepływ danych

1. Klient wysyła żądanie do `server/api/generations.post.ts`.
2. Odbiór żądania POST z ciałem zawierającym description i autoryzacja
3. **Walidacja** – parsowanie i weryfikacja ciała żądania za pomocą Zod w `server/validation/task.schema.ts`.
4. **Reguły biznesowe**:
   - Sprawdzenie, czy `parentTaskId` (jeśli nie null) istnieje i należy do zalogowanego użytkownika.
   - Weryfikacja poziomu zagnieżdżenia (max 2 poziomy).
   - Sprawdzenie, czy `generationId` (gdy wymagane) istnieje i należy do użytkownika.
   - (Opcjonalnie) Walidacja limitu zadań na generację (np. max 10).
5. **Persistencja** – wywołanie `supabase.from('tasks').insert(...)` w `task.service.ts`.
6. **Mapowanie** – przekształcenie zwróconego wiersza do `CreateTaskResponseDTO`.
7. **Zwrócenie odpowiedzi** – status 201 i DTO w body.

## 6. Względy bezpieczeństwa

- **Autoryzacja** – wymaganie poprawnego JWT Supabase w nagłówku.
- **Ograniczenie dostępu** – użytkownik może tworzyć zadania tylko dla własnego `user_id`.
- **Walidacja danych** – Zod zapewnia ochronę przed nieprawidłowymi typami i danymi wstrzykniętymi.
- **Sprawdzanie relacji** – upewnienie się, że `parentTaskId` i `generationId` należą do użytkownika.
- **SQL Injection** – użycie Supabase Client (parametryzowane zapytania).

## 7. Obsługa błędów

| Scenariusz                                                    | Kod statusu | Opis                              |
| ------------------------------------------------------------- | ----------- | --------------------------------- |
| Brak nagłówka Authorization lub niepoprawny token             | 401         | Nieautoryzowany                   |
| Błędy Zod (np. brak wymaganych pól, nieprawidłowy UUID)       | 400         | Nieprawidłowe dane wejściowe      |
| `parentTaskId` lub `generationId` nie istnieje/lub nie należy | 404         | Zasób nie znaleziony              |
| Przekroczenie limitu zadań lub poziomu zagnieżdżenia          | 400         | Ogólne błędy walidacji biznesowej |
| Błąd podczas zapisu w bazie                                   | 500         | Błąd serwera; zalogowany w logach |

## 8. Rozważania dotyczące wydajności

- Indeksy na kolumnach `user_id`, `parent_task_id`, `generation_id`.
- Unikanie operacji N+1: pojedyncze zapytanie insert.
- Batchowe obliczanie pozycji za pomocą agregacji w jednym zapytaniu.
- Konfiguracja limitów i paginacji przy późniejszym pobieraniu.

## 9. Kroki implementacji

1. Utworzyć `server/validation/task.schema.ts` ze Zod schematem dla `CreateTaskCommand`.
2. Rozszerzyć typ `CreateTaskCommand` w `types.ts` o pole `generationId`.
3. Utworzyć `server/services/task.service.ts` z funkcją `createTask(command: CreateTaskCommand, userId: string)` implementującą logikę biznesową.
4. Utworzyć `server/api/tasks.post.ts`, implementując endpoint:
   - Parsowanie i walidacja danych
   - Wywołanie serwisu i mapowanie wyników
   - Obsługa wyjątków i kodów statusu
