# Schemat Bazy Danych PostgreSQL

## 1. Typy niestandardowe

```sql
-- Enum dla źródła zadania
CREATE TYPE task_source AS ENUM (
  'ai_full',    -- wygenerowane przez AI (nieedytowane)
  'ai_edited',  -- wygenerowane i edytowane przez użytkownika
  'manual'      -- dodane ręcznie przez użytkownika
);
```

## 2. Lista tabel

### 2.1. users

This table is managed by Supabase Auth.

### 2.2. generation_process

Przechowuje metadane sesji generowania AI.

| Kolumna          | Typ          | Ograniczenia                           |
| ---------------- | ------------ | -------------------------------------- |
| id               | UUID         | PRIMARY KEY, DEFAULT gen_random_uuid() |
| user_id          | UUID         | NOT NULL, FOREIGN KEY → auth.users(id) |
| duration         | INTERVAL     | NOT NULL                               |
| model            | VARCHAR(100) | NOT NULL                               |
| generated_count  | INT          | NOT NULL CHECK (generated_count > 0)   |
| source_text_hash | VARCHAR      | NOT NULL                               |
| created_at       | TIMESTAMPTZ  | NOT NULL DEFAULT now()                 |

### 2.3. generation_process_error_logs

Przechowuje metadane sesji generowania AI.

| Kolumna          | Typ          | Ograniczenia                           |
| ---------------- | ------------ | -------------------------------------- |
| id               | UUID         | PRIMARY KEY, DEFAULT gen_random_uuid() |
| user_id          | UUID         | NOT NULL, FOREIGN KEY → auth.users(id) |
| model            | VARCHAR      | NOT NULL                               |
| source_text_hash | VARCHAR      | NOT NULL                               |
| error_code       | VARCHAR(100) | NOT NULL                               |
| error_message    | TEXT         | NOT NULL                               |
| created_at       | TIMESTAMPTZ  | NOT NULL DEFAULT now()                 |

### 2.4. tasks

Przechowuje zadania i podzadania (do 2 poziomów zagnieżdżenia).

| Kolumna        | Typ          | Ograniczenia                           |
| -------------- | ------------ | -------------------------------------- |
| id             | UUID         | PRIMARY KEY, DEFAULT gen_random_uuid() |
| user_id        | UUID         | NOT NULL, FOREIGN KEY → auth.users(id) |
| generation_id  | UUID         | FOREIGN KEY → generation_process(id)   |
| parent_task_id | UUID         | NULLABLE, FOREIGN KEY → tasks(id)      |
| source         | task_source  | NOT NULL                               |
| title          | VARCHAR(255) | NOT NULL                               |
| description    | TEXT         |                                        |
| created_at     | TIMESTAMPTZ  | NOT NULL DEFAULT now()                 |
| completed      | BOOLEAN      | NOT NULL DEFAULT FALSE                 |
| completed_at   | TIMESTAMPTZ  |                                        |

## 3. Relacje między tabelami

- **users** 1–N **generation_process** via `generation_process.user_id`
- **users** 1–N **generation_process_error_logs** via `generation_process_error_logs.user_id`
- **generation_process** 1–N **tasks** via `tasks.generation_id`
- **tasks** 1–N **tasks** (self-join) via `tasks.parent_task_id` (max dwa poziomy zagnieżdżenia)

## 4. Indeksy

Indeks na kolumnie user_id w tabeli tasks.
Indeks na kolumnie generation_id w tabeli tasks.
Indeks na kolumnie user_id w tabeli generation_process.
Indeks na kolumnie user_id w tabeli generation_process_error_logs.

## 5. Zasady RLS (Row-Level Security)

```sql
-- Włączenie RLS
enable row level security on generation_process;
enable row level security on generation_process_error_logs;
enable row level security on tasks;

-- Polityka dla generation_process
CREATE POLICY genproc_owner_policy ON generation_process
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY genprocerrlog_owner_policy ON generation_process_error_logs
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Polityka dla tasks
CREATE POLICY tasks_owner_policy ON tasks
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
```

## 6. Dodatkowe ograniczenia i mechanizmy

1. **Limity liczby zadań**

   - **BEFORE INSERT** trigger w `tasks`, aby wymusić max 10 podzadań poziomu 1 (parent_task_id IS NULL) i max 5 podzadań poziomu 2.

2. **Kaskada ukończenia**

   - **AFTER UPDATE** trigger na `tasks`, który przy `completed = TRUE` rekurencyjnie ustawia `completed = TRUE` i `completed_at = now()` dla podzadań kazdego poziomu.

3. Migracje schematu zarządzane przez Supabase Migrations.

---

### Uwagi projektowe

- Dane `auth.users` są zarządzane przez Supabase Auth, dlatego tabela `users` nie jest tu definiowana ręcznie.
- Wybór `INTERVAL` dla `duration` pozwala na łatwe przechowywanie czasu trwania sesji AI.
- ENUM `task_source` zastępuje pola `ai_generated` i `edited_at` z elastyczniejszymi opcjami źródła danych.
- Schemat w 3NF — żadna denormalizacja nie jest wymagana na tym etapie.
- Indeksy skupiają się na kluczowych filtrach po `user_id`, `generation_id` i `parent_task_id`.
