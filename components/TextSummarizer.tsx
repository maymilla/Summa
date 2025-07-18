// components/TextSummarizer.tsx
import React, { useState, ChangeEvent, FormEvent } from 'react';

interface SummaryResult {
  summary: string;
  originalLength: number;
  summaryLength: number;
  compressionRatio: number;
}

interface SummarizeResponse {
  success: boolean;
  summary?: string;
  originalLength?: number;
  summaryLength?: number;
  compressionRatio?: number;
  error?: string;
}

const TextSummarizer: React.FC = () => {
  const [inputText, setInputText] = useState<string>('');
  const [summary, setSummary] = useState<SummaryResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [maxLength, setMaxLength] = useState<number>(150);
  const [minLength, setMinLength] = useState<number>(50);

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    // Clear previous results when text changes
    if (summary) setSummary(null);
    if (error) setError('');
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!inputText.trim()) {
      setError('Please enter some text to summarize');
      return;
    }

    setLoading(true);
    setError('');
    setSummary(null);

    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: inputText,
          maxLength,
          minLength,
          doSample: false
        }),
      });

      const data: SummarizeResponse = await response.json();

      if (data.success && data.summary) {
        setSummary({
          summary: data.summary,
          originalLength: data.originalLength || 0,
          summaryLength: data.summaryLength || 0,
          compressionRatio: data.compressionRatio || 0
        });
      } else {
        setError(data.error || 'Failed to generate summary');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Summarization error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setInputText('');
    setSummary(null);
    setError('');
  };

  const handleCopySummary = async () => {
    if (summary?.summary) {
      try {
        await navigator.clipboard.writeText(summary.summary);
        // You could add a toast notification here
        alert('Summary copied to clipboard!');
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Text Summarizer</h1>
        <p className="text-gray-600">
          Powered by Facebook's BART Large CNN model for high-quality text summarization
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Input Text Area */}
        <div>
          <label htmlFor="inputText" className="block text-sm font-medium text-gray-700 mb-2">
            Text to Summarize
          </label>
          <textarea
            id="inputText"
            value={inputText}
            onChange={handleInputChange}
            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical min-h-[200px]"
            placeholder="Paste your text here. The model works best with articles, news, or longer passages (minimum 50 characters)..."
            disabled={loading}
          />
          <div className="mt-1 text-sm text-gray-500">
            Character count: {inputText.length} / 10,000
          </div>
        </div>

        {/* Parameters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="maxLength" className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Summary Length
            </label>
            <input
              id="maxLength"
              type="number"
              value={maxLength}
              onChange={(e) => setMaxLength(parseInt(e.target.value))}
              min="50"
              max="500"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
          </div>
          <div>
            <label htmlFor="minLength" className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Summary Length
            </label>
            <input
              id="minLength"
              type="number"
              value={minLength}
              onChange={(e) => setMinLength(parseInt(e.target.value))}
              min="10"
              max="200"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading || !inputText.trim()}
            className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Summarizing...
              </span>
            ) : (
              'Generate Summary'
            )}
          </button>
          <button
            type="button"
            onClick={handleClear}
            disabled={loading}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors font-medium"
          >
            Clear
          </button>
        </div>
      </form>

      {/* Error Display */}
      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Summary Display */}
      {summary && (
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-800">Summary</h3>
            <button
              onClick={handleCopySummary}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              Copy
            </button>
          </div>
          
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-gray-800 leading-relaxed">{summary.summary}</p>
          </div>

          {/* Summary Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-gray-500">Original Length</div>
              <div className="text-lg font-semibold text-gray-800">{summary.originalLength.toLocaleString()} chars</div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-gray-500">Summary Length</div>
              <div className="text-lg font-semibold text-gray-800">{summary.summaryLength.toLocaleString()} chars</div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-gray-500">Compression Ratio</div>
              <div className="text-lg font-semibold text-gray-800">{summary.compressionRatio}%</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TextSummarizer;