import type { LeadResponse } from '../types';

export interface AnalyzeLeadOptions {
  channel: 'whatsapp' | 'email' | 'portal';
  text: string;
}

export interface ApiError {
  message: string;
  details?: string;
  status?: number;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}`;
    let errorDetails: string | undefined;

    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorMessage;
      errorDetails = errorData.details;
    } catch {
      // If response is not JSON, use status text
      errorMessage = response.statusText || errorMessage;
    }

    const error: ApiError = {
      message: errorMessage,
      details: errorDetails,
      status: response.status,
    };

    throw error;
  }

  return response.json();
}

/**
 * Analyzes a lead message and returns structured analysis with AI-generated response.
 *
 * @param options - Analysis options including channel and message text
 * @returns Promise resolving to LeadResponse with analysis, persona, and reply
 * @throws {ApiError} If the API request fails
 */
export async function analyzeLead(options: AnalyzeLeadOptions): Promise<LeadResponse> {
  const { channel, text } = options;

  if (!text.trim()) {
    throw {
      message: 'Message text cannot be empty',
    } as ApiError;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/lead`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        channel,
        text: text.trim(),
      }),
    });

    return handleResponse<LeadResponse>(response);
  } catch (error) {
    // Re-throw ApiError as-is
    if (error && typeof error === 'object' && 'message' in error) {
      throw error;
    }

    // Handle network errors
    throw {
      message: 'Network error: Unable to reach the server',
      details: error instanceof Error ? error.message : 'Unknown error',
    } as ApiError;
  }
}

