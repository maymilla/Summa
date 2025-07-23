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

interface SummarizedCluster {
  summary: string;
  articles: string[];
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
          console.error('Failed to parse Python output:', output);
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

// Dummy data for testing
const dummyArticles: ScrapedData[] = [
  {
    title: "Government Defends Fuel Price Hike as Necessary Reform",
    description: "Officials explain the rationale behind the subsidy cut and price increase",
    url: "https://example.com/fuel-policy-gov-defense",
    headings: ["Government Position", "Economic Justification"],
    content: [
      "The Indonesian government announced a significant increase in fuel prices last week, citing the growing burden of energy subsidies on the national budget.",
      "According to the Ministry of Finance, the subsidy program was costing the state over 500 trillion rupiah annually, threatening other public spending priorities.",
      "Officials argue that the adjustment is crucial for long-term fiscal stability and to redirect funds toward education, healthcare, and infrastructure.",
      "President Joko Widodo emphasized that the decision was not easy but necessary for national economic health.",
      "The government pledged direct cash assistance to 20 million low-income households to cushion the impact."
    ],
    success: true
  },
  {
    title: "Fuel Price Hike Triggers Nationwide Protests Among Students and Workers",
    description: "Demonstrations erupt in Jakarta and other cities over rising cost of living",
    url: "https://example.com/fuel-policy-protests",
    headings: ["Public Reaction", "Protest Movement"],
    content: [
      "Mass protests erupted across Indonesia following the government's announcement of a fuel price hike.",
      "Students, labor unions, and civil society groups took to the streets demanding the policy be reversed.",
      "Many protesters say the price increase will disproportionately harm low-income families and small businesses.",
      "Activists accuse the government of prioritizing fiscal discipline over people's welfare.",
      "In some regions, demonstrations turned tense as police deployed tear gas to disperse crowds."
    ],
    success: true
  },
  {
    title: "Economists Say Fuel Subsidy Reform Is Long Overdue",
    description: "Experts argue the price hike is painful but economically sound",
    url: "https://example.com/fuel-policy-economists",
    headings: ["Expert Analysis", "Economic Perspective"],
    content: [
      "Several economists have voiced support for the Indonesian government's decision to reduce fuel subsidies and raise prices.",
      "They note that energy subsidies often benefit the wealthy more than the poor, and distort market signals.",
      "According to economic analysts, the saved funds could be better spent on targeted programs such as education, healthcare, and social protection.",
      "Some warn that short-term inflation is inevitable, but stress that long-term benefits outweigh immediate costs.",
      "They encourage the government to pair the reform with transparent communication and strong safety nets."
    ],
    success: true
  },
  {
    title: "Environmentalists Back Fuel Price Hike to Reduce Emissions",
    description: "Green groups applaud reduction of fossil fuel dependence",
    url: "https://example.com/fuel-policy-environment",
    headings: ["Environmental Impact", "Sustainability Goals"],
    content: [
      "Environmental organizations have expressed support for the fuel price hike, calling it a step toward sustainable energy policy.",
      "They argue that cheap fuel has encouraged overconsumption and high emissions in urban areas.",
      "The policy may incentivize the use of public transport and cleaner alternatives like electric vehicles.",
      "Activists urge the government to reinvest subsidy savings into renewable energy development.",
      "They caution, however, that reforms must be paired with equitable access to green transportation for low-income groups."
    ],
    success: true
  },
  {
    title: "Fuel Price Increase Sparks Political Tension Ahead of Elections",
    description: "Opposition parties criticize government over unpopular move",
    url: "https://example.com/fuel-policy-politics",
    headings: ["Political Implications", "Electoral Impact"],
    content: [
      "Opposition parties in Indonesia have seized on the fuel price hike to criticize the ruling administration's economic policy.",
      "Several lawmakers claim the decision reflects poor planning and a failure to manage global economic pressures.",
      "Some political analysts believe the protests could influence voter sentiment ahead of the 2024 elections.",
      "The fuel policy may become a central campaign issue, with parties divided over subsidy reform.",
      "Analysts also note that public trust could erode if the government fails to deliver promised social aid effectively."
    ],
    success: true
  }
];

// Summarization function
async function summarizeCluster(articles: string[], baseUrl: string): Promise<string> {
  try {
    const combinedText = articles.join('\n\n');
    
    const response = await fetch(`${baseUrl}/api/summarize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: combinedText }),
    });

    if (!response.ok) {
      throw new Error(`Summarization failed: ${response.status}`);
    }

    const { summary } = await response.json();
    return summary || 'No summary generated';
  } catch (error) {
    console.error('Summarization error:', error);
    return 'Summary generation failed';
  }
}

// Database save function
async function savePerspectivesToDatabase(
  summarizedClusters: Record<string, SummarizedCluster>,
  topicId: string
): Promise<any[]> {
  const savePromises = Object.entries(summarizedClusters).map(
    async ([perspectiveKey, data]) => {
      try {
        if (data.summary && data.summary.trim().length > 0) {
          console.log(`Saving perspective: ${perspectiveKey}`);
          
          await prisma.perspective.create({
            data: {
              idtopic: parseInt(topicId),
              idpers: parseInt(perspectiveKey),
              content: data.summary.trim(),
            },
          });
          
          console.log(`Successfully saved perspective: ${perspectiveKey}`);
          return { perspectiveKey, status: 'saved' };
        } else {
          console.log(`Skipping empty summary for: ${perspectiveKey}`);
          return { perspectiveKey, status: 'skipped - empty summary' };
        }
      } catch (error) {
        console.error(`Error saving perspective ${perspectiveKey}:`, error);
        return { 
          perspectiveKey, 
          status: 'error', 
          error: error instanceof Error ? error.message : 'Unknown error' 
        };
      }
    }
  );

  return await Promise.all(savePromises);
}

// Main GET handler
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const urlParam = searchParams.get('url');
    const useReal = searchParams.get('real') === 'true'; // Flag to use real scraping
    
    // Handle single URL scraping
    if (urlParam) {
      console.log(`Single URL scraping: ${urlParam}`);
      const scraped = await scrapeUrlWithRetry(urlParam);
      return NextResponse.json({ data: scraped });
    }

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    let normalizedArticles: string[];
    let metadata: any;

    if (useReal && SERP_API_KEY) {
      // Real scraping logic (when you're ready to use it)
      console.log(`Real search query: ${query}`);
      
      const serpRes = await axios.get('https://serpapi.com/search.json', {
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
        ?.map((r: any) => r.link)
        ?.filter((link: string) => {
          if (!link) return false;
          const blacklist = [
            'facebook.com', 'instagram.com', 'tiktok.com', 
            'youtube.com', 'twitter.com', 'x.com',
            'linkedin.com', 'pinterest.com'
          ];
          return !blacklist.some(domain => link.includes(domain));
        })
        .slice(0, 10);

      if (!links.length) {
        return NextResponse.json({ error: 'No valid search results found' }, { status: 404 });
      }

      const results = await scrapeUrlsBatch(links);
      const successfulResults = results.filter(r => r.success && r.content.length > 0);

      if (successfulResults.length === 0) {
        return NextResponse.json({ 
          error: 'No articles could be scraped successfully'
        }, { status: 404 });
      }

      normalizedArticles = convertArticles(successfulResults);
      metadata = {
        totalSearchResults: links.length,
        successfulScrapes: successfulResults.length,
        failedScrapes: results.length - successfulResults.length,
        isDummyData: false
      };
    } else {
      // Use dummy data
      console.log(`Using dummy data for query: ${query}`);
      normalizedArticles = convertArticles(dummyArticles);
      metadata = {
        totalSearchResults: dummyArticles.length,
        successfulScrapes: dummyArticles.length,
        failedScrapes: 0,
        isDummyData: true
      };
    }

    console.log(`Processing ${normalizedArticles.length} articles, running clustering...`);
    
    const clustered = await runClusteringPython(normalizedArticles);

    // Create base URL for summarization API call
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const host = request.headers.get('host') || 'localhost:3000';
    const baseUrl = `${protocol}://${host}`;

    const summarizePromises = Object.entries(clustered).map(
      async ([perspectiveKey, articles]): Promise<[string, SummarizedCluster]> => {
        const summary = await summarizeCluster(articles, baseUrl);
        return [perspectiveKey, { summary, articles }];
      }
    );

    const summarizedEntries = await Promise.all(summarizePromises);
    const summarizedClusters = Object.fromEntries(summarizedEntries);

    // Save to database
    const topicId = "1"; 
    const saveResults = await savePerspectivesToDatabase(summarizedClusters, topicId);
    
    console.log('Database save results:', saveResults);

    return NextResponse.json({
      summarized: summarizedClusters,
      metadata: {
        ...metadata,
        saveResults
      }
    });

  } catch (err) {
    console.error('General error:', err);
    return NextResponse.json({ 
      error: 'Unexpected error occurred',
      details: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 });
  }
}