import { z } from 'zod';
import { type JSONSchema7 } from 'json-schema';
import { zodToJsonSchema } from 'zod-to-json-schema';
import type { GenerationProposalTaskDTO } from '~/types';

// Types for messages and options
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
    this.defaultModel = 'anthropic/claude-3.5-sonnet';
    this.siteUrl = 'https://todo.10x.show';
  }

  /**
   * Gets a structured JSON response from an LLM model.
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
      console.log('Raw API Response:', content);
      
      try {
        const jsonData = JSON.parse(content);
        console.log('Parsed JSON:', JSON.stringify(jsonData, null, 2));
        // Validate response using Zod schema
        return schema.parse(jsonData);
      } catch (parseError: any) {
        throw new Error(`Failed to parse JSON response from model: ${parseError?.message}`);
      }
    } catch (error: any) {
      console.error('OpenRouterService Error:', error?.message);
      // Rethrow the error to be handled in the API handler
      throw new Error(`Failed to get a valid response from OpenRouter. Details: ${error?.message}`);
    }
  }

  /**
   * Builds the payload for a JSON schema request.
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
          name: 'json_schema',
          strict: true,
          schema: jsonSchema,
        },
      },
      temperature: options.temperature,
      max_tokens: options.max_tokens,
    };
  }

  /**
   * Makes a request to the OpenRouter API.
   */
  private async makeRequest(payload: any) {
    try {
      return await $fetch<any>(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': this.siteUrl,
          'X-Title': '10X-TODO',
        },
        body: payload,
      });
    } catch (error: any) {
      // Handle specific HTTP error codes
      if (error.response) {
        const status = error.response.status;
        
        if (status === 400) {
          throw new Error(`Invalid request: ${error.response._data?.error?.message || 'Bad request'}`);
        } else if (status === 401) {
          throw new Error('Authentication failed: Invalid API key');
        } else if (status === 429) {
          throw new Error('Rate limit exceeded: Too many requests');
        } else if (status >= 500) {
          throw new Error('OpenRouter service unavailable. Please try again later.');
        }
      }
      
      // Rethrow any other errors
      throw error;
    }
  }
}
