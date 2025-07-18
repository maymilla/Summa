import React, { useState } from 'react';

interface ScrapedData {
  title: string;
  description?: string;
  headings: string[];
  url: string;
  content: string[];
}

interface ScrapeApiResponse {
  data?: ScrapedData;
  error?: string;
}

interface WebScraperProps {
  className?: string;
}

const WebScraper: React.FC<WebScraperProps> = ({ className = '' }) => {
const [url, setUrl] = useState<string>('');
const [data, setData] = useState<ScrapedData | null>(null);
const [loading, setLoading] = useState<boolean>(false);
const [error, setError] = useState<string>('');

const scrapeWebsite = async (): Promise<void> => {
if (!url.trim()) {
    setError('Please enter a valid URL');
    return;
}

setLoading(true);
setError('');

try {
    const response = await fetch(`/api/scrape?url=${encodeURIComponent(url)}`);
    const result: ScrapeApiResponse = await response.json();
    
    if (result.error) {
    setError(result.error);
    setData(null);
    } else if (result.data) {
    setData(result.data);
    }
} catch (err) {
    setError('Network error occurred');
    console.error('Scraping error:', err);
} finally {
    setLoading(false);
}
};

const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
setUrl(e.target.value);
setError('');
};

const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
if (e.key === 'Enter') {
    scrapeWebsite();
}
};

return (
    <div className={`web-scraper ${className}`}>
        <div className="input-section">
        <input
            type="url"
            value={url}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Enter URL to scrape (e.g., https://example.com)"
            className="url-input"
            disabled={loading}
        />
        <button
            onClick={scrapeWebsite}
            disabled={loading || !url.trim()}
            className="scrape-button"
        >
            {loading ? 'Scraping...' : 'Scrape Website'}
        </button>
        </div>

        {error && (
        <div className="error-message">
            <p>Error: {error}</p>
        </div>
        )}

        {data && (
        <div className="scraped-data">
            <h2>Scraped Data</h2>
            <div className="data-item">
                <h3>Title:</h3>
                <p>{data.title || 'No title found'}</p>
            </div>
            
            {data.description && (
            <div className="data-item">
                <h3>Description:</h3>
                <p>{data.description}</p>
            </div>
            )}
            
            <div className="data-item">
                <h3>URL:</h3>
                <a href={data.url} target="_blank" rel="noopener noreferrer">
                    {data.url}
                </a>
            </div>
            
            {data.headings.length > 0 && (
            <div className="data-item">
                <h3>Headings:</h3>
                <ul>
                {data.headings.map((heading, index) => (
                    <li key={index}>{heading}</li>
                ))}
                </ul>
            </div>
            )}

            {data.content && data.content.length > 0 && (
            <div className="data-item">
                <h3>Content:</h3>
                <p>{data.content}</p>
            </div>
            )}
        </div>
        )}
    </div>
    );
};

export default WebScraper;