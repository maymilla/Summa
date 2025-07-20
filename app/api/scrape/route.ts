import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

interface ScrapedData {
  title: string;
  description?: string;
  headings: string[];
  url: string;
  content: string[];
  images?: string[];
}

const possibleContentSelectors = [
  '.news-content',
  '.article-content',
  '.article-body',
  '.entry-content',
  '.post-content',
  '.main-content',
  '.content-article',
  '.web-content',
  '.text-content',
  '.bodyContent',
  '.content-body',
  '.read__content',
  'article',
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.json(
        { error: 'URL parameter is required' },
        { status: 400 }
      );
    }

    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/114.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': url,
        'Cache-Control': 'no-cache'
      },
      timeout: 10000
    });

    const $ = cheerio.load(response.data);

    // let content = '';
    // for (const selector of possibleContentSelectors) {
    //     const selected = $(selector).text().trim();
    //     if (selected.length > 1) {
    //         content = selected;
    //         break;
    //     }
    // }

    const imageSrcs = $('img')
    .map((i, el) => $(el).attr('src'))
    .get()
    .filter((src): src is string => !!src && !src.startsWith('data:') && !src.toLowerCase().includes('logo') && !src.toLowerCase().includes('icon')) 
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

    const scrapedData: ScrapedData = {
      title: $('title').text().trim(),
      description: $('meta[name="description"]').attr('content')?.trim(),
      headings: $('h1, h2, h3').map((i, el) => $(el).text().trim()).get().filter(Boolean),
      url,
      content: $('p').map((i, el) => $(el).text().trim()).get().filter(Boolean) ,
      images: imageSrcs,
    };

    return NextResponse.json({ data: scrapedData });
  } catch (error) {
    console.error('Scraping error:', error);
    return NextResponse.json(
      { error: 'Failed to scrape website' },
      { status: 500 }
    );
  }
}