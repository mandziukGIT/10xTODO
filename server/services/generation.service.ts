import { createHash } from 'crypto'
import { z } from 'zod'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { 
  GenerationProposalTaskDTO
} from '~/types'
import { OpenRouterService } from './openrouter.service'
import type { Database } from '~/db/database.types'


/**
 * Service responsible for handling AI task generation processes
 */
export class GenerationService {
  private readonly config = useRuntimeConfig()
  private readonly supabase: SupabaseClient<Database>
  private readonly openRouter = new OpenRouterService()

  constructor(supabase: SupabaseClient<Database>) {
    this.supabase = supabase
  }
  
  /**
   * Generate tasks based on user description
   * 
   * @param userId - The ID of the user making the request
   * @param description - Text description of the goal/problem
   * @returns Generated tasks and metadata
   */
  async generateTasks(userId: string, description: string): Promise<{
    generationId: string;
    tasks: GenerationProposalTaskDTO[];
    generated_count: number;
    createdAt: string;
  }> {
    // Calculate hash of the source text for potential caching/deduplication
    const sourceTextHash = this.calculateHash(description)
    
    try {
      // Start timer for duration measurement
      const startTime = performance.now()
      
      // Define schema for task generation
      const taskSchema = z.object({
        tasks: z.array(z.object({
          title: z.string().describe('The concise title of the task.'),
          description: z.string().describe('A brief description of the task.'),
        })).describe('A list of generated tasks.'),
      });

      // Define system prompt for task generation
      const systemPrompt = `You are an expert project manager and task organizer. 
Based on the user's goal or problem description, generate a list of 3-5 actionable tasks.
Each task should have a clear title and brief description.
Focus on creating specific, actionable tasks that directly contribute to achieving the goal.

Example response format:
{
  "tasks": [
    {
      "title": "Example Task",
      "description": "Brief description of what needs to be done"
    }
  ]
}`;

      // Generate tasks using OpenRouter
      const response = await this.openRouter.getJsonResponse(
        systemPrompt,
        description,
        taskSchema,
        {
          temperature: 0.7,
          max_tokens: 1000,
        }
      );

      // Transform response to match GenerationProposalTaskDTO
      const tasks: GenerationProposalTaskDTO[] = response.tasks.map(task => ({
        ...task,
        source: 'ai_full' as const,
      }));
      
      // Calculate duration in milliseconds
      const duration = performance.now() - startTime
      
      // Save generation process record
      const { data: generationProcess, error: insertError } = await this.supabase
        .from('generation_process')
        .insert({
          user_id: userId,
          model: this.config.AI_MODEL || 'mock-model',
          source_text_hash: sourceTextHash,
          duration,
          generated_count: tasks.length,
        })
        .select('id, created_at')
        .single()
      
      if (insertError) {
        throw new Error(`Failed to save generation process: ${insertError?.message}`)
      }
      
      return {
        generationId: generationProcess.id,
        tasks,
        generated_count: tasks.length,
        createdAt: generationProcess.created_at,
      }
    } catch (error) {
      // Log error to database
      await this.logGenerationError(userId, sourceTextHash, error)
      
      // Re-throw for controller to handle
      throw error
    }
  }
  
  /**
   * Log generation process errors to database
   * 
   * @param userId - User ID
   * @param sourceTextHash - Hash of the source text
   * @param error - Error object
   */
  private async logGenerationError(
    userId: string,
    sourceTextHash: string,
    error: unknown
  ): Promise<void> {
    try {
      const errorMessage = error instanceof Error ? error?.message : String(error)
      const errorCode = error instanceof Error && error.name ? error.name : 'UNKNOWN_ERROR'
      
      await this.supabase.from('generation_process_error_logs').insert({
        user_id: userId,
        source_text_hash: sourceTextHash,
        model: this.config.AI_MODEL || 'mock-model',
        error_code: errorCode,
        error_message: errorMessage,
      })
    } catch (logError) {
      // If error logging fails, just log to console - we don't want to throw here
      console.error('Failed to log generation error:', logError)
    }
  }
  
  /**
   * Calculate SHA-256 hash of input string
   * 
   * @param input - String to hash
   * @returns Hex string hash
   */
  private calculateHash(input: string): string {
    return createHash('sha256').update(input).digest('hex')
  }
  

}
