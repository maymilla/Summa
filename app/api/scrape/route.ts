// api/scrape/route.ts
import { NextRequest, NextResponse } from 'next/server';
import axios, { AxiosRequestConfig } from 'axios';
import * as cheerio from 'cheerio';
import { spawn } from 'child_process';
import path from 'path';
import { prisma } from '@/lib/prisma';

interface ScrapedData {
  title: string;
  description?: string;
  headings: string[];
  url: string;
  content: string[];
  images?: string[];
  success: boolean;
  error?: string;
}

interface ClusterResult {
  [perspectiveKey: string]: string[];
}

interface SerpApiResult {
  link: string;
  title?: string;
  snippet?: string;
  [key: string]: unknown;
}

interface SerpApiResponse {
  organic_results?: SerpApiResult[];
  [key: string]: unknown;
}

const SERP_API_KEY = process.env.SERP_API_KEY;

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
];

const getRandomUserAgent = () => USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Python clustering 
async function runClusteringPython(normalizedArticles: string[]): Promise<ClusterResult> {
  return new Promise((resolve, reject) => {
    if (normalizedArticles.length === 0) {
      reject(new Error('No articles to cluster'));
      return;
    }

    const pythonPath = process.platform === 'win32' ? 'python' : 'python3';
    const scriptPath = path.resolve(process.cwd(), 'python/cluster_perspective.py');

    console.log(`Running clustering with ${normalizedArticles.length} articles...`);

    const childProcess = spawn(pythonPath, [scriptPath], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env }
    });

    let output = '';
    let error = '';

    const timeout = setTimeout(() => {
      childProcess.kill();
      reject(new Error('Python clustering process timed out'));
    }, 120000);

    childProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    childProcess.stderr.on('data', (data) => {
      error += data.toString();
      console.error('Python stderr:', data.toString());
    });

    childProcess.on('close', (code) => {
      clearTimeout(timeout);
      
      if (code === 0) {
        try {
          const parsed = JSON.parse(output.trim());
          console.log('Clustering completed successfully');
          resolve(parsed);
        } catch (err) {
          console.error('Failed to parse Python output:', output, 'error: ', err);
          reject(new Error('Failed to parse clustering results'));
        }
      } else {
        console.error(`Python process exited with code ${code}`);
        console.error('Error output:', error);
        reject(new Error(error || `Clustering process failed with code ${code}`));
      }
    });

    childProcess.on('error', (err) => {
      clearTimeout(timeout);
      console.error('Failed to start Python process:', err);
      reject(new Error(`Failed to start clustering: ${err.message}`));
    });

    try {
      childProcess.stdin.write(JSON.stringify(normalizedArticles));
      childProcess.stdin.end();
    } catch (err) {
      clearTimeout(timeout);
      reject(new Error(`Failed to send data to Python: ${err}`));
    }
  });
}

// Scraping functions
async function scrapeUrlsBatch(urls: string[], concurrency = 3): Promise<ScrapedData[]> {
  const results: ScrapedData[] = [];
  
  for (let i = 0; i < urls.length; i += concurrency) {
    const batch = urls.slice(i, i + concurrency);
    console.log(`Processing batch ${Math.floor(i/concurrency) + 1}: ${batch.length} URLs`);
    
    const batchPromises = batch.map(url => scrapeUrlWithRetry(url));
    const batchResults = await Promise.allSettled(batchPromises);
    
    const batchData = batchResults.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        console.error(`Failed to scrape ${batch[index]}:`, result.reason);
        return {
          url: batch[index],
          title: '',
          description: 'Scraping failed',
          headings: [],
          content: [],
          success: false,
          error: result.reason?.message || 'Unknown error'
        };
      }
    });
    
    results.push(...batchData);
    
    if (i + concurrency < urls.length) {
      const delayTime = 2000 + Math.random() * 2000;
      console.log(`Waiting ${Math.round(delayTime/1000)}s before next batch...`);
      await delay(delayTime);
    }
  }
  
  return results;
}

async function scrapeUrlWithRetry(url: string, maxRetries = 3): Promise<ScrapedData> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 1) {
        const delayTime = 1000 * attempt + Math.random() * 1000;
        console.log(`Retry attempt ${attempt} for ${url} after ${Math.round(delayTime/1000)}s delay`);
        await delay(delayTime);
      }
      
      const result = await scrapeUrl(url);
      
      if (result.success && result.content.length > 0) {
        return result;
      } else if (attempt === maxRetries) {
        return {
          ...result,
          success: false,
          error: result.error || 'No content extracted after all retries'
        };
      }
    } catch (error) {
      if (attempt === maxRetries) {
        return {
          url,
          title: '',
          description: '',
          headings: [],
          content: [],
          success: false,
          error: error instanceof Error ? error.message : 'Unknown scraping error'
        };
      }
    }
  }
  
  return {
    url,
    title: '',
    description: '',
    headings: [],
    content: [],
    success: false,
    error: 'Maximum retries exceeded'
  };
}

async function scrapeUrl(url: string): Promise<ScrapedData> {
  try {
    const config: AxiosRequestConfig = {
      headers: {
        'User-Agent': getRandomUserAgent(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Cache-Control': 'max-age=0',
        'Referer': 'https://www.google.com/',
      },
      timeout: 45000,
      maxRedirects: 10,
      validateStatus: (status) => status >= 200 && status < 400,
    };

    const response = await axios.get(url, config);
    
    if (!response.data || response.data.length < 100) {
      throw new Error('Response too short or empty');
    }

    const $ = cheerio.load(response.data);
    $('script, style, nav, header, footer, aside, .advertisement, .ads, .social-share, .comment').remove();

    let title = $('h1').first().text().trim() ||
                $('title').text().trim() ||
                $('meta[property="og:title"]').attr('content')?.trim() ||
                $('meta[name="title"]').attr('content')?.trim() ||
                '';

    title = title
      .replace(/\s*\|\s*.*$/, '')
      .replace(/\s*-\s*.*$/, '')
      .trim();

    const description = $('meta[name="description"]').attr('content')?.trim() ||
                       $('meta[property="og:description"]').attr('content')?.trim() ||
                       '';

    const headings = $('h1, h2, h3, h4')
      .map((i, el) => $(el).text().trim())
      .get()
      .filter((heading) => heading && heading.length > 5 && heading.length < 200)
      .slice(0, 10);

    const contentSelectors = [
      'article p', '.article-content p', '.post-content p', '.content p',
      '.entry-content p', '.article-body p', '.story-content p', 
      '.news-content p', 'main p', '#content p', '.main-content p',
      'p'
    ];

    let content: string[] = [];
    
    for (const selector of contentSelectors) {
      const paragraphs = $(selector)
        .map((i, el) => $(el).text().trim())
        .get()
        .filter((para) => {
          if (!para || para.length < 30) return false;
          
          const lowerPara = para.toLowerCase();
          const noisePatterns = [
            'komentar', 'admin', 'redaksi', 'copyright', 'subscribe', 
            'baca juga', 'lihat juga', 'iklan', 'advertisement',
            'follow us', 'join us', 'share this', 'related articles',
            'po-content', 'loading', 'error', 'not found'
          ];
          
          return !noisePatterns.some(pattern => lowerPara.includes(pattern));
        });

      if (paragraphs.length > 2) {
        content = paragraphs.slice(0, 20);
        break;
      }
    }

    const imageSrcs = $('img')
      .map((i, el) => $(el).attr('src'))
      .get()
      .filter((src): src is string =>
        !!src &&
        !src.startsWith('data:') &&
        !src.toLowerCase().includes('logo') &&
        !src.toLowerCase().includes('icon') &&
        !src.toLowerCase().includes('avatar')
      )
      .map((src) => {
        if (src.startsWith('http')) return src;
        if (src.startsWith('//')) return `https:${src}`;
        try {
          return new URL(src, url).href;
        } catch {
          return '';
        }
      })
      .filter(Boolean)
      .slice(0, 5);

    if (!title && content.length === 0) {
      throw new Error('No meaningful content extracted');
    }

    return {
      title: title || 'No title',
      description,
      headings,
      url,
      content,
      images: imageSrcs,
      success: true
    };

  } catch (error) {
    console.error(`Scraping error for ${url}:`, error);
    
    let errorMessage = 'Unknown error';
    if (axios.isAxiosError(error)) {
      errorMessage = `HTTP ${error.response?.status || 'ERROR'}: ${error.message}`;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return {
      url,
      title: '',
      description: '',
      headings: [],
      content: [],
      success: false,
      error: errorMessage
    };
  }
}

// Article processing functions
type ArticleRaw = {
  title: string;
  description?: string;
  content: string[];
  success?: boolean;
};

function normalizeArticle(article: ArticleRaw): string {
  const { title, description, content } = article;

  const cleanedContent = content
    .filter(line => {
      if (!line || line.length < 25) return false;
      
      const lowerLine = line.toLowerCase();
      const blacklistPatterns = [
        'komentar', 'admin', 'redaksi', 'copyright', 'subscribe',
        'po-content', 'baca juga', 'lihat juga', 'iklan', 'advertisement',
        'follow', 'share', 'like', 'tweet', 'facebook', 'instagram',
        'whatsapp', 'telegram', 'loading', 'error'
      ];
      
      return !blacklistPatterns.some(pattern => lowerLine.includes(pattern));
    })
    .map(line => line.trim())
    .filter(line => line.length > 20);

  const textParts = [title, description, ...cleanedContent].filter(Boolean);
  const fullText = textParts.join('\n\n');

  return fullText.length > 100 ? fullText : title || 'No content available';
}

export function convertArticles(rawArticles: ArticleRaw[]): string[] {
  return rawArticles
    .filter(article => article.success !== false)
    .map(normalizeArticle)
    .filter(text => text && text.length > 20);
}

async function summarizeCluster(articles: string[], baseUrl: string): Promise<string> {
  try {
    const combinedText = articles.join('\n\n');

    const MAX_CHUNK_LENGTH = 1000; 
    function chunkText(text: string, maxLength: number): string[] {
      const chunks = [];
      let current = '';
      for (const paragraph of text.split('\n')) {
        if ((current + paragraph).length > maxLength) {
          chunks.push(current);
          current = '';
        }
        current += paragraph + '\n';
      }
      if (current.trim().length > 0) chunks.push(current);
      return chunks;
    }

    const chunks = chunkText(combinedText, MAX_CHUNK_LENGTH);

    const summaries: string[] = [];
    for (const chunk of chunks) {
      const response = await fetch(`${baseUrl}/api/summarize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: chunk }),
      });

      if (!response.ok) {
        throw new Error(`Summarization failed: ${response.status}`);
      }

      const { summary } = await response.json();
      summaries.push(summary || '');
    }

    return summaries.join('\n\n');
  } catch (error) {
    console.error('Summarization error:', error);
    return 'Summary generation failed';
  }
}


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('search')?.trim();

    if (!query || query.length < 2) {
      return NextResponse.json({ error: 'Search query too short or missing' }, { status: 400 });
    }

    // 1. Cek di DB
    const found = await prisma.topic.findMany({
      where: {
        OR: [
          { judul: { contains: query, mode: 'insensitive' } },
          { desc: { contains: query, mode: 'insensitive' } }
        ]
      }
    });

    if (found.length > 0) {
      return NextResponse.json(found, { status: 200 });
    }

    // 2. Jika tidak ada di DB, lanjut scraping via SERP API
    if (!SERP_API_KEY) {
      return NextResponse.json({ error: 'Missing SERP_API_KEY' }, { status: 500 });
    }

    const serpRes = await axios.get<SerpApiResponse>('https://serpapi.com/search.json', {
      params: {
        q: query,
        api_key: SERP_API_KEY,
        engine: 'google',
        num: 15,
        hl: 'id',
        gl: 'id',
      },
      timeout: 30000,
    });

    const links: string[] = serpRes.data.organic_results
      ?.map((r: SerpApiResult) => r.link)
      ?.filter((link: string) => {
        if (!link) return false;

        const blacklist = [
          'facebook.com', 'instagram.com', 'tiktok.com',
          'youtube.com', 'twitter.com', 'x.com',
          'linkedin.com', 'pinterest.com'
        ];

        return !blacklist.some(domain => link.includes(domain));
      })
      .slice(0, 10) || [];

    if (!links.length) {
      return NextResponse.json({ error: 'No valid search results found' }, { status: 404 });
    }

    const results = await scrapeUrlsBatch(links);

    const successfulResults = results.filter(r => r.success && r.content.length > 0);
    const failedResults = results.filter(r => !r.success);

    if (successfulResults.length === 0) {
      return NextResponse.json({
        error: 'No articles could be scraped successfully',
        failures: failedResults.map(r => ({ url: r.url, error: r.error }))
      }, { status: 404 });
    }

    const normalized = convertArticles(successfulResults);


    console.log("Run clustering result:", await runClusteringPython(normalized));

    const clusteringResult = await runClusteringPython(normalized);
    console.log("Run clustering result:", clusteringResult);

    if (!clusteringResult || Object.keys(clusteringResult).length === 0) {
      return NextResponse.json({ error: 'Clustering failed or returned empty result' }, { status: 500 });
    }

const summarized = clusteringResult;
const protocol = request.headers.get('x-forwarded-proto') || 'http';
const host = request.headers.get('host') || 'localhost:3000';
const baseUrl = `${protocol}://${host}`;

const summarizePromises = Object.entries(summarized).map(
  async ([, articles]) => {
    // articles: string[]
    const summary = await summarizeCluster(articles, baseUrl);
    return {
      summary,
      articles
    };
  }
);

const perspectivesData = await Promise.all(summarizePromises);


    const newTopic = await prisma.topic.create({
      data: {
        judul: query,
        desc: perspectivesData[0]?.summary?.slice(0, 300) ?? 'Deskripsi tidak tersedia',
        perspectives: {
          create: perspectivesData.map(p => ({
            content: p.summary,
            sources: {
              create: p.articles.map(a => ({ sources: a }))
            }
          }))
        }
      },
      include: {
        perspectives: {
          include: { sources: true }
        }
      }
    });


    return NextResponse.json([newTopic], { status: 201 });

  } catch (err) {
    console.error('General scraping error:', err);
    return NextResponse.json({
      error: 'Unexpected error occurred',
      details: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 });
  }
}