# Plan Implementacji Usługi OpenRouter

## 1. Opis usługi

`OpenRouterService` to klasa TypeScript, która hermetyzuje logikę komunikacji z API OpenRouter. Została zaprojektowana do działania w środowisku serwerowym Nuxt 3 (`./server/services/`). Jej głównym zadaniem jest ułatwienie wysyłania zapytań do modeli językowych (LLM), obsługa odpowiedzi (w tym ustrukturyzowanych danych JSON) oraz zarządzanie błędami i konfiguracją.

## 2. Opis konstruktora

Konstruktor inicjalizuje serwis, wczytując konfigurację z zmiennych środowiskowych.

```typescript
// ./server/services/openrouter.service.ts

import { z } from 'zod';
import { type JSONSchema7 } from 'json-schema';
import { zodToJsonSchema } from 'zod-to-json-schema';

export class OpenRouterService {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly defaultModel: string;
  private readonly siteUrl: string;

  constructor() {
    const config = useRuntimeConfig();

    if (!config.openRouter.apiKey) {
      // Logowanie błędu po stronie serwera
      console.error('OpenRouter API key is not configured.');
      throw new Error('OPENROUTER_API_KEY is not defined in environment variables.');
    }

    this.apiKey = config.openRouter.apiKey;
    this.baseUrl = 'https://openrouter.ai/api/v1';
    this.defaultModel = 'anthropic/claude-3.5-sonnet';
    this.siteUrl = 'https://todo.10x.show';
  }
}
```

## 3. Publiczne metody i pola

### `public async getJsonResponse<T extends z.ZodTypeAny>(...)`

Główna metoda publiczna do interakcji z modelem w celu uzyskania odpowiedzi w formacie JSON, zgodnej z podanym schematem Zod.

- **Parametry:**
    - `systemPrompt` (string): Komunikat systemowy definiujący rolę i zachowanie modelu.
    - `userPrompt` (string): Zapytanie użytkownika.
    - `schema` (`T`): Schemat Zod definiujący oczekiwaną strukturę odpowiedzi JSON.
    - `options` (object, opcjonalny): Obiekt z opcjami do nadpisania domyślnych ustawień.
        - `model` (string): Nazwa modelu do użycia (np. `google/gemini-flash-1.5`).
        - `temperature` (number): Kreatywność odpowiedzi (0-2).
        - `max_tokens` (number): Maksymalna liczba tokenów w odpowiedzi.

- **Zwraca:** `Promise<z.infer<T>>` - Obiekt z danymi zgodnymi ze schematem Zod.

- **Przykład użycia:**
  ```typescript
  const taskSchema = z.object({
    taskName: z.string().describe('Name of the task'),
    priority: z.enum(['low', 'medium', 'high']).describe('Priority of the task'),
  });

  const openRouterService = new OpenRouterService();
  const task = await openRouterService.getJsonResponse(
    'You are a task creation assistant.',
    'Create a high priority task for buying milk.',
    taskSchema,
    { model: 'google/gemini-flash-1.5' }
  );
  console.log(task); // { taskName: 'Buy milk', priority: 'high' }
  ```

## 4. Prywatne metody i pola

### `private buildJsonSchemaPayload(...)`

Metoda pomocnicza do budowania payloadu zapytania, gdy wymagana jest odpowiedź JSON.

- **Funkcjonalność:**
    1. Konwertuje schemat Zod na schemat JSON za pomocą `zod-to-json-schema`.
    2. Tworzy tablicę `messages` z komunikatami systemowymi i użytkownika.
    3. Konstruuje obiekt `response_format` zgodnie ze specyfikacją OpenRouter.
    4. Łączy domyślne i przekazane opcje (model, temperatura itp.).
    5. Zwraca kompletny obiekt payloadu gotowy do wysłania do API.

### `private async makeRequest(...)`

Prywatna metoda do wykonywania zapytań HTTP do API OpenRouter.

- **Funkcjonalność:**
    1. Używa wbudowanego w Nuxt klienta `$fetch` do wysyłania żądania POST.
    2. Ustawia wymagane nagłówki: `Authorization`, `HTTP-Referer`, `X-Title`.
    3. Przekazuje zbudowany payload jako ciało żądania.
    4. Zwraca odpowiedź z API.

## 5. Obsługa błędów

Błędy będą obsługiwane poprzez rzucanie wyjątków z konkretnymi, zrozumiałymi komunikatami. Należy je przechwytywać w kodzie wywołującym (np. w handlerach API Nuxt).

1.  **Brak klucza API:** Konstruktor rzuci `Error`, jeśli klucz API nie jest skonfigurowany w zmiennych środowiskowych. Aplikacja nie powinna się uruchomić w takim stanie.
2.  **Błędy Walidacji (400):** Jeśli API zwróci błąd 400, metoda `makeRequest` przechwyci go i rzuci wyjątek z informacją o nieprawidłowym zapytaniu.
3.  **Błędy Autoryzacji (401):** Wskazuje na nieprawidłowy klucz API. Zostanie rzucony wyjątek.
4.  **Przekroczenie Limitu (429):** Błąd "Too Many Requests". W przyszłości można zaimplementować mechanizm ponawiania z wykładniczym czasem oczekiwania (exponential backoff).
5.  **Błędy Serwera (5xx):** Błędy po stronie OpenRouter. Rzucany będzie wyjątek informujący o niedostępności usługi.
6.  **Nieprawidłowy JSON w odpowiedzi:** Jeśli model nie zwróci poprawnego JSON-a, `getJsonResponse` spróbuje sparsować odpowiedź. W przypadku błędu rzuci wyjątek `Error('Failed to parse JSON response from model.')`.

## 6. Kwestie bezpieczeństwa

1.  **Klucz API:** Klucz API musi być przechowywany wyłącznie w zmiennych środowiskowych (`.env` dla dewelopmentu, sekrety w środowisku produkcyjnym). Nigdy nie powinien być umieszczany w kodzie źródłowym.
2.  **Walidacja Danych Wejściowych:** Wszystkie dane pochodzące od użytkownika (np. `userPrompt`) powinny być traktowane jako niezaufane. Chociaż w tym przypadku są one przekazywane do zewnętrznego API, należy unikać przekazywania jakichkolwiek wrażliwych danych.
3.  **Walidacja Danych Wyjściowych:** Użycie schematów Zod do walidacji odpowiedzi z modelu jest kluczowe. Gwarantuje to, że dane zwracane przez serwis mają oczekiwaną strukturę i typ, chroniąc resztę aplikacji przed nieoczekiwanymi danymi.
4.  **Logowanie:** Należy unikać logowania pełnych zapytań i odpowiedzi w środowisku produkcyjnym, aby chronić prywatność danych użytkowników.

## 7. Plan wdrożenia krok po kroku

### Krok 1: Konfiguracja zmiennych środowiskowych

1.  W pliku `.env` (utwórz, jeśli nie istnieje) dodaj klucz API OpenRouter:
    ```env
    # .env
    OPENROUTER_API_KEY="sk-or-v1-..."
    ```
2.  Zaktualizuj `nuxt.config.ts`, aby udostępnić zmienną środowiskową po stronie serwera:
    ```typescript
    // nuxt.config.ts
    export default defineNuxtConfig({
      // ...
      runtimeConfig: {
        openRouter: {
          apiKey: process.env.OPENROUTER_API_KEY,
        },
        // ... inne klucze
      },
      // ...
    });
    ```

### Krok 2: Instalacja zależności

Zainstaluj biblioteki `zod` i `zod-to-json-schema`, które są potrzebne do walidacji i budowania schematów.
```bash
npm install zod zod-to-json-schema
```

### Krok 3: Implementacja `OpenRouterService`

1.  Utwórz nowy plik: `./server/services/openrouter.service.ts`.
2.  Wklej poniższy kod do pliku. Jest to kompletna implementacja klasy, zgodna z powyższymi wytycznymi.

    ```typescript
    // ./server/services/openrouter.service.ts
    import { z } from 'zod';
    import { type JSONSchema7 } from 'json-schema';
    import { zodToJsonSchema } from 'zod-to-json-schema';

    // Typy dla wiadomości i opcji
    type Message = {
      role: 'system' | 'user';
      content: string;
    };

    type RequestOptions = {
      model?: string;
      temperature?: number;
      max_tokens?: number;
    };

    export class OpenRouterService {
      private readonly apiKey: string;
      private readonly baseUrl: string;
      private readonly defaultModel: string;
      private readonly siteUrl: string;

      constructor() {
        const config = useRuntimeConfig();

        if (!config.openRouter.apiKey) {
          console.error('OpenRouterService Error: OPENROUTER_API_KEY is not defined in environment variables.');
          throw new Error('Server configuration error: OpenRouter API key is missing.');
        }

        this.apiKey = config.openRouter.apiKey;
        this.baseUrl = 'https://openrouter.ai/api/v1';
        this.defaultModel = 'anthropic/claude-3.5-sonnet'; // Można dostosować
        this.siteUrl = 'https://todo.10x.show'; // Zastąp lub pobierz dynamicznie
      }

      /**
       * Pobiera ustrukturyzowaną odpowiedź JSON z modelu LLM.
       */
      public async getJsonResponse<T extends z.ZodTypeAny>(
        systemPrompt: string,
        userPrompt: string,
        schema: T,
        options: RequestOptions = {}
      ): Promise<z.infer<T>> {
        const payload = this.buildJsonSchemaPayload(systemPrompt, userPrompt, schema, options);
        
        try {
          const response = await this.makeRequest(payload);

          if (!response.choices || response.choices.length === 0) {
            throw new Error('Invalid response structure from API.');
          }

          const content = response.choices[0]?.message.content;
          const jsonData = JSON.parse(content);

          // Walidacja odpowiedzi przy użyciu schematu Zod
          return schema.parse(jsonData);
        } catch (error: any) {
          console.error('OpenRouterService Error:', error?.message);
          // Rzucamy dalej błąd, aby mógł być obsłużony w handlerze API
          throw new Error(`Failed to get a valid response from OpenRouter. Details: ${error?.message}`);
        }
      }

      /**
       * Buduje payload dla zapytania o odpowiedź w formacie JSON.
       */
      private buildJsonSchemaPayload<T extends z.ZodTypeAny>(
        systemPrompt: string,
        userPrompt: string,
        schema: T,
        options: RequestOptions
      ) {
        const jsonSchema = zodToJsonSchema(schema, { name: 'json_schema', target: 'jsonSchema7' }) as JSONSchema7;

        const messages: Message[] = [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ];

        return {
          model: options.model || this.defaultModel,
          messages,
          response_format: {
            type: 'json_schema',
            json_schema: {
              name: 'json_schema', // Nazwa schematu
              strict: true,
              schema: jsonSchema,
            },
          },
          temperature: options.temperature,
          max_tokens: options.max_tokens,
        };
      }

      /**
       * Wykonuje zapytanie do API OpenRouter.
       */
      private async makeRequest(payload: any) {
        return $fetch<any>(`${this.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': this.siteUrl,
            'X-Title': '10X-TODO',
          },
          body: payload,
        });
      }
    }
    ```

### Krok 4: Przykładowe użycie w handlerze API

Utwórz lub zmodyfikuj istniejący handler API, aby użyć nowej usługi.

1.  Utwórz plik, np. `./server/api/generate-task.post.ts`.
2.  Dodaj kod, który importuje i używa `OpenRouterService`:

    ```typescript
    // ./server/api/generate-task.post.ts
    import { z } from 'zod';
    import { OpenRouterService } from '~/server/services/openrouter.service';

    // Schemat walidacji ciała zapytania
    const requestBodySchema = z.object({
      prompt: z.string().min(10),
    });

    // Schemat oczekiwanej odpowiedzi od LLM
    const taskResponseSchema = z.object({
      tasks: z.array(z.object({
        title: z.string().describe('The concise title of the task.'),
        description: z.string().describe('A brief description of the task.'),
      })).describe('A list of generated tasks.'),
    });

    export default defineEventHandler(async (event) => {
      try {
        const body = await readValidatedBody(event, requestBodySchema.parse);

        const openRouterService = new OpenRouterService();
        
        const systemPrompt = 'You are an expert project manager. Based on the user\'s goal, generate a list of 2-5 actionable tasks. Respond with a JSON object containing a "tasks" array.';

        const taskData = await openRouterService.getJsonResponse(
          systemPrompt,
          body.prompt,
          taskResponseSchema
        );

        return {
          status: 'success',
          data: taskData,
        };
      } catch (error: any) {
        console.error('API Error in /generate-task:', error);
        
        // Ustawienie statusu błędu w odpowiedzi HTTP
        setResponseStatus(event, 500);
        return {
          status: 'error',
          message: 'An error occurred while generating tasks.',
          details: error?.message,
        };
      }
    });
    ```

Tym samym usługa `OpenRouterService` jest gotowa do użycia w całej aplikacji Nuxt 3.
