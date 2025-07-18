// app/api/summarize/route.ts
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

export async function POST(request: NextRequest): Promise<NextResponse<SummarizeResponse>> {
  try {
    const { text, maxLength = 150, minLength = 50, doSample = false }: SummarizeRequest = await request.json();

    // Validate input
    if (!text || text.trim().length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Text is required and cannot be empty'
      }, { status: 400 });
    }

    // Check if text is too short (BART works better with longer texts)
    if (text.trim().length < 50) {
      return NextResponse.json({
        success: false,
        error: 'Text is too short for meaningful summarization. Please provide at least 50 characters.'
      }, { status: 400 });
    }

    // Check if text is too long (API limits)
    if (text.length > 10000) {
      return NextResponse.json({
        success: false,
        error: 'Text is too long. Please provide text under 10,000 characters.'
      }, { status: 400 });
    }

    console.log('Summarizing text with BART model...');
    console.log('Original text length:', text.length);

    // Call Hugging Face BART model
    const result = await hf.summarization({
      model: 'facebook/bart-large-cnn',
      inputs: text,
      parameters: {
        max_length: maxLength,
        min_length: minLength,
        do_sample: doSample,
        // You can add more parameters:
        // temperature: 0.7,
        // top_p: 0.9,
        // repetition_penalty: 1.1,
      },
    });

    const summary = result.summary_text;
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
      
      // Handle specific Hugging Face API errors
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

// Optional: Add GET method to return model info
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

// Export singleton instance
export const summarizationService = new SummarizationService();

// Alternative API route using the service (app/api/summarize-service/route.ts)
/*
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { text, maxLength, minLength, doSample }: SummarizeRequest = await request.json();

    // Get optimal parameters if not provided
    const optimalParams = summarizationService.getOptimalParameters(text.length);
    const finalMaxLength = maxLength || optimalParams.maxLength;
    const finalMinLength = minLength || optimalParams.minLength;

    const result = await summarizationService.summarizeText(text, {
      maxLength: finalMaxLength,
      minLength: finalMinLength,
      doSample: doSample
    });

    return NextResponse.json({
      success: true,
      ...result
    });

  } catch (error) {
    console.error('Summarization service error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} */