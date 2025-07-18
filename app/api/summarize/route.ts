import { NextRequest, NextResponse } from 'next/server';
import { HfInference } from '@huggingface/inference';

// Initialize Hugging Face client
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

// Request interface
interface SummarizeRequest {
  text: string;
  maxLength?: number;
  minLength?: number;
  doSample?: boolean;
}

// Response interface
interface SummarizeResponse {
  success: boolean;
  summary?: string;
  originalLength?: number;
  summaryLength?: number;
  compressionRatio?: number;
  error?: string;
}

// Utility: Split text into ~400-word chunks (~1024 tokens)
function chunkText(text: string, maxWords = 400): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  for (let i = 0; i < words.length; i += maxWords) {
    const chunk = words.slice(i, i + maxWords).join(' ');
    chunks.push(chunk);
  }
  return chunks;
}

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Invalid input text' }, { status: 400 });
    }

    const chunks = chunkText(text);
    const summaries: string[] = [];

    for (const chunk of chunks) {
      const result = await hf.summarization({
        model: 'facebook/bart-large-cnn', 
        inputs: chunk,
      });
      summaries.push(result.summary_text);
    }

    const summary = summaries.join(' ');
    const originalLength = text.length;
    const summaryLength = summary.length;
    const compressionRatio = Math.round((summaryLength / originalLength) * 100);

    console.log('Summary generated successfully');
    console.log('Summary length:', summaryLength);
    console.log('Compression ratio:', compressionRatio + '%');

    return NextResponse.json({
      success: true,
      summary,
      originalLength,
      summaryLength,
      compressionRatio
    });

  } catch (error) {
        console.error('Summarization error:', error);
        
        let errorMessage = 'An unexpected error occurred';
        
        if (error instanceof Error) {
        errorMessage = error.message;

        if (error.message.includes('rate limit')) {
            errorMessage = 'Rate limit exceeded. Please try again later.';
        } else if (error.message.includes('model')) {
            errorMessage = 'Model is currently unavailable. Please try again later.';
        } else if (error.message.includes('timeout')) {
            errorMessage = 'Request timeout. The text might be too long to process.';
        }
        }

        return NextResponse.json({
            success: false,
            error: errorMessage
        }, { status: 500 });
  }
}

// GET method to return model info
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    model: 'facebook/bart-large-cnn',
    description: 'BART Large CNN model for text summarization',
    maxInputLength: 10000,
    defaultMaxLength: 150,
    defaultMinLength: 50,
    usage: 'POST /api/summarize with { text: string, maxLength?: number, minLength?: number }'
  });
}

// lib/summarization-service.ts
// TODO: cek ini
export class SummarizationService {
  private hf: HfInference;
  private readonly MODEL_NAME = 'facebook/bart-large-cnn';
  private readonly MAX_INPUT_LENGTH = 10000;
  private readonly MIN_INPUT_LENGTH = 50;

  constructor() {
    this.hf = new HfInference(process.env.HUGGINGFACE_API_KEY);
  }

  async summarizeText(
    text: string,
    options: {
      maxLength?: number;
      minLength?: number;
      doSample?: boolean;
    } = {}
  ) {
    const { maxLength = 150, minLength = 50, doSample = false } = options;

    // Validate input
    this.validateInput(text);

    try {
      const result = await this.hf.summarization({
        model: this.MODEL_NAME,
        inputs: text,
        parameters: {
          max_length: maxLength,
          min_length: minLength,
          do_sample: doSample,
        },
      });

      return {
        summary: result.summary_text,
        originalLength: text.length,
        summaryLength: result.summary_text.length,
        compressionRatio: Math.round((result.summary_text.length / text.length) * 100),
        model: this.MODEL_NAME
      };
    } catch (error) {
      throw new Error(`Summarization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private validateInput(text: string): void {
    if (!text || text.trim().length === 0) {
      throw new Error('Text is required and cannot be empty');
    }

    if (text.length < this.MIN_INPUT_LENGTH) {
      throw new Error(`Text is too short. Please provide at least ${this.MIN_INPUT_LENGTH} characters.`);
    }

    if (text.length > this.MAX_INPUT_LENGTH) {
      throw new Error(`Text is too long. Please provide text under ${this.MAX_INPUT_LENGTH} characters.`);
    }
  }

  // Method to get optimal parameters based on text length
  getOptimalParameters(textLength: number) {
    if (textLength < 500) {
      return { maxLength: 100, minLength: 30 };
    } else if (textLength < 1500) {
      return { maxLength: 150, minLength: 50 };
    } else if (textLength < 3000) {
      return { maxLength: 200, minLength: 70 };
    } else {
      return { maxLength: 300, minLength: 100 };
    }
  }
}

export const summarizationService = new SummarizationService();
