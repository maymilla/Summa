import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { spawn } from 'child_process';
import path from 'path'

interface ScrapedData {
  title: string;
  description?: string;
  headings: string[];
  url: string;
  content: string[];
  images?: string[];
}

const SERP_API_KEY = process.env.SERP_API_KEY;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const urlParam = searchParams.get('url');

    if (urlParam) {
      const scraped = await scrapeUrl(urlParam);
      return NextResponse.json({ data: scraped });
    }

    if (!query) {
      return NextResponse.json({ error: 'URL or query is required' }, { status: 400 });
    }

    if (!SERP_API_KEY) {
      return NextResponse.json({ error: 'Missing SERP_API_KEY' }, { status: 500 });
    }

    const serpRes = await axios.get('https://serpapi.com/search.json', {
      params: {
        q: query,
        api_key: SERP_API_KEY,
        engine: 'google',
        num: 10,
      }
    });

    const links: string[] = serpRes.data.organic_results
      ?.map((r: any) => r.link)
      ?.filter((link: string) => !!link)
      .slice(0, 10);

    if (!links.length) {
      return NextResponse.json({ error: 'No search results found' }, { status: 404 });
    }

    const results: ScrapedData[] = [];

    for (const url of links) {
      try {
        const data = await scrapeUrl(url);
        results.push(data);
      } catch (err) {
        console.warn(`Failed to scrape ${url}`, err);
        results.push({
          url,
          title: '',
          description: 'Failed to scrape',
          headings: [],
          content: [],
        });
      }
    }

    const normalized = convertArticles(results);
    const clustered = await runClusteringPython(normalized);

    return NextResponse.json({ clustered });

  } catch (err) {
    console.error('General scraping error:', err);
    return NextResponse.json({ error: 'Unexpected error occurred' }, { status: 500 });
  }
}

interface ScrapedData {
  title: string;
  description?: string;
  headings: string[];
  url: string;
  content: string[];
  images?: string[];
}

async function scrapeUrl(url: string): Promise<ScrapedData> {
  const response = await axios.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0',
      'Accept': 'text/html,application/xhtml+xml',
      'Accept-Language': 'en-US,en;q=0.9',
      'Referer': url,
      'Cache-Control': 'no-cache',
    },
    timeout: 10000,
  });

  const $ = cheerio.load(response.data);

  const imageSrcs = $('img')
    .map((i, el) => $(el).attr('src'))
    .get()
    .filter((src): src is string =>
      !!src &&
      !src.startsWith('data:') &&
      !src.toLowerCase().includes('logo') &&
      !src.toLowerCase().includes('icon')
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
    .filter(Boolean);

  return {
    title: $('title').text().trim(),
    description: $('meta[name="description"]').attr('content')?.trim(),
    headings: $('h1, h2, h3').map((i, el) => $(el).text().trim()).get().filter(Boolean),
    url,
    content: $('p').map((i, el) => $(el).text().trim()).get().filter(Boolean),
    images: imageSrcs,
  };
}

type ArticleRaw = {
  title: string;
  description?: string;
  content: string[];
};

function normalizeArticle(article: ArticleRaw): string {
  const { title, description, content } = article;

  const cleanedContent = content
    .filter(line =>
      line &&                          
      !line.toLowerCase().includes('komentar') &&
      !line.toLowerCase().includes('admin') &&
      !line.toLowerCase().includes('redaksi') &&
      !line.toLowerCase().includes('copyright') &&
      !line.toLowerCase().includes('subscribe') &&
      !line.toLowerCase().includes('po-content') && 
      line.length > 20                              
    )
    .map(line => line.trim());

  const fullText = [title, description, ...cleanedContent].filter(Boolean).join('\n');
  return fullText;
}

export function convertArticles(rawArticles: ArticleRaw[]): string[] {
  return rawArticles.map(normalizeArticle);
}

async function runClusteringPython(normalizedArticles: string[]) {
  return new Promise((resolve, reject) => {
    const pythonPath = 'python'; // pake python or python3??
    const scriptPath = path.resolve(process.cwd(), 'python/cluster_perspective.py');

    const childProcess = spawn(pythonPath, [scriptPath]);

    let output = '';
    let error = '';

    childProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    childProcess.stderr.on('data', (data) => {
      error += data.toString();
    });

    childProcess.on('close', (code) => {
      if (code === 0) {
        try {
          const parsed = JSON.parse(output);
          resolve(parsed);
        } catch (err) {
          reject('Failed to parse Python output');
        }
      } else {
        reject(error || `Python process exited with code ${code}`);
      }
    });

    childProcess.stdin.write(JSON.stringify(normalizedArticles));
    childProcess.stdin.end();
  });
}

