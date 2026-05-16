import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { NewsItem } from '../entities/news-item.entity';
import { PuppeteerResolverService } from './puppeteer-resolver.service';

type ResolveAndEnrichOptions = {
  allowGoogleNewsResolution?: boolean;
};

@Injectable()
export class ArticleResolverService {
  private readonly logger = new Logger(ArticleResolverService.name);

  constructor(private readonly puppeteerResolver: PuppeteerResolverService) {}

  async resolveAndEnrich(
    item: NewsItem,
    options: ResolveAndEnrichOptions = {},
  ): Promise<NewsItem> {
    const enriched = { ...item } as NewsItem;

    if (
      options.allowGoogleNewsResolution === false &&
      this.isGoogleNewsIntermediateUrl(item.originalUrl)
    ) {
      return enriched;
    }

    try {
      this.logger.log(`Resolviendo URL final para: ${item.originalUrl}`);
      const resolvedUrl = await this.resolveFinalUrl(item.originalUrl);
      if (resolvedUrl && !this.isGoogleNewsIntermediateUrl(resolvedUrl)) {
        enriched.resolvedUrl = resolvedUrl;

        try {
          enriched.resolvedSourceDomain = new URL(resolvedUrl).hostname;
        } catch {
          enriched.resolvedSourceDomain = undefined;
        }
      }

      const articleUrl = enriched.resolvedUrl || item.originalUrl;
      if (this.isGoogleNewsIntermediateUrl(articleUrl)) {
        this.logger.warn(`No se resolvio URL final no-Google para ${item.originalUrl}`);
        return item;
      }

      this.logger.log(`Scrapeando articulo: ${articleUrl}`);
      const scraped = await this.scrapeArticle(articleUrl);

      if (scraped.title?.trim() && !/^Google News$/i.test(scraped.title.trim())) {
        enriched.title = scraped.title.trim();
      }

      if (scraped.summary?.trim()) {
        enriched.summary = scraped.summary.trim();
      }

      if (scraped.fullContent?.trim()) {
        enriched.fullContent = scraped.fullContent.trim();
      }

      if (scraped.cleanContent?.trim()) {
        enriched.cleanContent = scraped.cleanContent.trim();
      }

      if (scraped.extractedImageUrl?.trim()) {
        enriched.extractedImageUrl = scraped.extractedImageUrl.trim();
      }

      if (scraped.author?.trim()) {
        enriched.author = scraped.author.trim();
      }

      if (scraped.publishedAt) {
        enriched.publishedAt = scraped.publishedAt;
      }

      if ((!enriched.imageUrl || enriched.imageUrl.trim().length === 0) && enriched.extractedImageUrl) {
        enriched.imageUrl = enriched.extractedImageUrl;
      }

      if (enriched.cleanContent && enriched.cleanContent.length > 400) {
        enriched.content = enriched.cleanContent;
      } else if (enriched.fullContent && enriched.fullContent.length > 0) {
        enriched.content = enriched.fullContent;
      }

      this.logger.log(`Articulo enriquecido: ${item.originalUrl}`);
      return enriched;
    } catch (error) {
      this.logger.warn(`No se pudo enriquecer ${item.originalUrl}: ${String(error)}`);
      return item;
    }
  }

  async resolveFinalUrl(url: string): Promise<string> {
    const normalized = (url || '').trim();
    if (!normalized) {
      return normalized;
    }

    if (!this.isGoogleNewsIntermediateUrl(normalized)) {
      return normalized;
    }

    // Strategy 0: Puppeteer headless browser. Google News often resolves client-side.
    try {
      this.logger.log('Intentando Strategy 0 (Puppeteer headless browser)...');
      const resolvedViaBrowser = await this.puppeteerResolver.resolveUrlWithBrowser(normalized);
      if (this.isLikelyArticleUrl(resolvedViaBrowser)) {
        this.logger.log(`URL resuelta via Puppeteer: ${resolvedViaBrowser}`);
        return resolvedViaBrowser;
      }
      this.logger.debug('Strategy 0 (Puppeteer) no retornó URL válida');
    } catch (err) {
      this.logger.debug(`Strategy 0 (Puppeteer) falló: ${String(err).slice(0, 200)}`);
    }

    // Strategy 1: Google batchexecute API (most reliable for Google News tokens)
    try {
      const viaBatchExecute = await this.resolveViaGoogleBatchExecute(normalized);
      if (this.isLikelyArticleUrl(viaBatchExecute)) {
        this.logger.log(`URL resuelta via batchexecute: ${viaBatchExecute}`);
        return viaBatchExecute;
      }
      this.logger.debug('Strategy 1 (batchexecute) no retornó URL válida');
    } catch (err) {
      this.logger.debug(`Strategy 1 (batchexecute) falló: ${String(err).slice(0, 200)}`);
    }

    // Consent cookies required to bypass Google's cookie consent gate (necessary for redirect to work)
    const googleConsentCookies =
      'CONSENT=YES+1; SOCS=CAISHAgCEhJnd3NfMjAyMzA4MDlfMCIJZXMtNDE5GAEgASI; NID=511=';
    const commonGoogleHeaders = {
      'User-Agent':
        'Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'es-419,es;q=0.9,en-US;q=0.8,en;q=0.7',
      'Cache-Control': 'no-cache',
      Cookie: googleConsentCookies,
      Referer: 'https://news.google.com/',
    };

    // Strategy 2: Access the non-RSS version of the article URL which may redirect
    try {
      const nonRssUrl = normalized.replace('/rss/articles/', '/articles/');
      const response = await axios.get<string>(nonRssUrl, {
        maxRedirects: 10,
        timeout: 15000,
        headers: commonGoogleHeaders,
      });

      const finalUrl = (response.request?.res?.responseUrl as string | undefined) || nonRssUrl;

      if (this.isLikelyArticleUrl(finalUrl)) {
        this.logger.log(`URL resuelta via non-RSS redirect: ${finalUrl}`);
        return finalUrl;
      }

      // Parse the HTML Google serves for the article page
      const html = typeof response.data === 'string' ? response.data : '';
      if (html) {
        this.logger.debug(`Strategy2 HTML snippet (first 800): ${html.slice(0, 800).replace(/\s+/g, ' ')}`);
        const extracted = this.extractUrlFromGoogleHtml(html, finalUrl);
        if (this.isLikelyArticleUrl(extracted)) {
          this.logger.log(`URL extraida de HTML Google: ${extracted}`);
          return extracted;
        }
        this.logger.debug('Strategy 2 (non-RSS) no encontró URL en HTML');
      } else {
        this.logger.debug('Strategy 2 (non-RSS) respuesta no contiene HTML string');
      }
    } catch (err) {
      this.logger.debug(`Strategy 2 (non-RSS) falló: ${String(err).slice(0, 200)}`);
    }

    // Small delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Strategy 3: RSS URL direct with redirects + consent cookies
    try {
      const response = await axios.get<string>(normalized, {
        maxRedirects: 10,
        timeout: 15000,
        headers: commonGoogleHeaders,
      });

      const finalByAxios = (response.request?.res?.responseUrl as string | undefined) || normalized;

      if (this.isLikelyArticleUrl(finalByAxios)) {
        return finalByAxios;
      }

      const paramUrl = this.extractFromKnownParams(finalByAxios);
      if (this.isLikelyArticleUrl(paramUrl)) {
        return paramUrl;
      }

      const html = typeof response.data === 'string' ? response.data : '';
      if (html) {
        this.logger.debug(`Strategy3 HTML length: ${html.length}, snippet (first 2500): ${html.slice(0, 2500).replace(/\s+/g, ' ')}`);
        const extracted = this.extractUrlFromGoogleHtml(html, finalByAxios);
        if (this.isLikelyArticleUrl(extracted)) {
          return extracted;
        }
        this.logger.debug('Strategy 3 (RSS direct) no encontró URL en HTML');
      }
    } catch (err) {
      this.logger.debug(`Strategy 3 (RSS direct) falló: ${String(err).slice(0, 200)}`);
    }

    return normalized;
  }

  private extractUrlFromGoogleHtml(html: string, baseUrl: string): string | undefined {
    const $ = cheerio.load(html);

    // Check canonical tag (but skip if it's the same Google News URL)
    const canonical = $('link[rel="canonical"]').attr('href')?.trim();
    if (canonical) {
      try {
        const fullUrl = new URL(canonical, baseUrl).toString();
        if (this.isLikelyArticleUrl(fullUrl)) return fullUrl;
      } catch {
        // ignore
      }
    }

    // Check meta refresh
    const refresh = $('meta[http-equiv="refresh"]').attr('content')?.trim();
    if (refresh) {
      const m = refresh.match(/url=(.+)$/i);
      if (m?.[1]) {
        try {
          const refreshUrl = new URL(m[1].trim(), baseUrl).toString();
          if (this.isLikelyArticleUrl(refreshUrl)) return refreshUrl;
        } catch {
          // ignore
        }
      }
    }

    // Check data-url or data-article-url attributes (Google News uses data-n-au)
    const dataUrl =
      $('[data-n-au]').first().attr('data-n-au')?.trim() ||
      $('[data-url]').first().attr('data-url')?.trim() ||
      $('[data-article-url]').first().attr('data-article-url')?.trim();
    if (dataUrl) {
      try {
        const fullUrl = new URL(dataUrl, baseUrl).toString();
        if (this.isLikelyArticleUrl(fullUrl)) return fullUrl;
      } catch {
        // ignore
      }
    }

    // Parse ALL scripts and search for article URLs
    const scripts = $('script')
      .toArray()
      .map((el) => $(el).html() || '');

    // Strategy A: Find URLs in AF_initDataCallback or similar Google callbacks
    for (const script of scripts) {
      if (script.includes('AF_initDataCallback') || script.includes('data:function')) {
        // Match any URL that is NOT from Google domains (exclude google.com, gstatic, googleapis, etc)
        const urlMatches = [
          ...script.matchAll(
            /"(https?:\/\/(?!(?:[^"]*\.)?(?:google|googleapis|gstatic|googleusercontent|ggpht|youtube)\.com)[^"]{20,})"/g,
          ),
        ];
        for (const m of urlMatches) {
          const candidate = m[1];
          // Additional filtering: must look like a real article URL (not tracking/ads/resources)
          if (
            !candidate.includes('doubleclick') &&
            !candidate.includes('googleadservices') &&
            !candidate.includes('google-analytics') &&
            !candidate.includes('googletagmanager') &&
            !candidate.includes('.gif') &&
            !candidate.includes('.png') &&
            !candidate.includes('.js') &&
            !candidate.includes('.css') &&
            !candidate.includes('pixel') &&
            !candidate.includes('analytics') &&
            !candidate.includes('/embed') &&
            !candidate.includes('/widget')
          ) {
            try {
              const parsed = new URL(candidate);
              if (this.isLikelyArticleUrl(candidate)) {
                this.logger.debug(`Found URL in script: ${candidate}`);
                return candidate;
              }
            } catch {
              // invalid URL, continue
            }
          }
        }
      }

      // Strategy B: Check JavaScript redirects
      const jsMatch =
        script.match(/window\.location(?:\.href)?\s*=\s*["']([^"']+)["']/i) ||
        script.match(/location\.replace\(\s*["']([^"']+)["']\s*\)/i) ||
        script.match(/location\.href\s*=\s*["']([^"']+)["']/i);
      if (jsMatch?.[1]) {
        try {
          const redirectUrl = new URL(jsMatch[1], baseUrl).toString();
          if (this.isLikelyArticleUrl(redirectUrl)) return redirectUrl;
        } catch {
          // ignore
        }
      }
    }

    // Fallback: Search entire HTML for any non-Google URL (as last resort)
    const allUrlMatches = [
      ...html.matchAll(
        /"(https?:\/\/(?!(?:[^"]*\.)?(?:google|googleapis|gstatic|googleusercontent|ggpht|youtube)\.com)[^"]{25,})"/g,
      ),
    ];
    for (const m of allUrlMatches) {
      const candidate = m[1];
      // Strict filtering: must be a news article URL
      if (
        !candidate.includes('doubleclick') &&
        !candidate.includes('googleadservices') &&
        !candidate.includes('google-analytics') &&
        !candidate.includes('googletagmanager') &&
        !candidate.includes('googlesyndication') &&
        !candidate.includes('.gif') &&
        !candidate.includes('.png') &&
        !candidate.includes('.jpg') &&
        !candidate.includes('.js') &&
        !candidate.includes('.css') &&
        !candidate.includes('pixel') &&
        !candidate.includes('tracking') &&
        !candidate.includes('analytics') &&
        !candidate.includes('/embed') &&
        !candidate.includes('/widget')
      ) {
        try {
          const parsed = new URL(candidate);
          // Must have path (not just domain) to be a real article
          if (this.isLikelyArticleUrl(candidate)) {
            this.logger.debug(`Found URL in raw HTML: ${candidate}`);
            return candidate;
          }
        } catch {
          // invalid URL, continue
        }
      }
    }

    // Final fallback: first non-Google anchor
    const candidates = new Set<string>();
    $('a[href]').each((_, element) => {
      const href = $(element).attr('href')?.trim();
      if (!href) return;
      try {
        const fullUrl = new URL(href, baseUrl).toString();
        if (this.isLikelyArticleUrl(fullUrl)) {
          candidates.add(fullUrl);
        }
      } catch {
        // ignore
      }
    });

    const first = [...candidates][0];
    return first;
  }

  async scrapeArticle(url: string): Promise<Partial<NewsItem>> {
    try {
      if (this.isGoogleNewsIntermediateUrl(url)) {
        return {};
      }
      const response = await axios.get<string>(url, {
        timeout: 10000,
        maxRedirects: 5,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        },
      });

      const initialHtml = typeof response.data === 'string' ? response.data : '';
      const initialExtracted = this.extractArticleFromHtml(initialHtml, url);
      if (this.hasEnoughArticleContent(initialExtracted.cleanContent)) {
        return initialExtracted;
      }

      this.logger.debug(`Scrape HTTP insuficiente para ${url}, intentando HTML renderizado`);
      const renderedPage = await this.puppeteerResolver.loadPageWithBrowser(url);
      if (!renderedPage?.html) {
        return initialExtracted;
      }

      const renderedExtracted = this.extractArticleFromHtml(renderedPage.html, renderedPage.finalUrl || url);
      if (renderedPage.title?.trim() && !renderedExtracted.title) {
        renderedExtracted.title = renderedPage.title.trim();
      }

      return this.hasEnoughArticleContent(renderedExtracted.cleanContent)
        ? renderedExtracted
        : initialExtracted;
    } catch {
      return {};
    }
  }

  private extractArticleFromHtml(html: string, url: string): Partial<NewsItem> {
    if (!html) {
      return {};
    }

    const $ = cheerio.load(html);
    const title =
      $('h1').first().text().trim() ||
      $('meta[property="og:title"]').attr('content')?.trim() ||
      $('title').first().text().trim() ||
      undefined;

    const extractedImageUrl =
      $('meta[property="og:image"]').attr('content')?.trim() ||
      $('meta[name="twitter:image"]').attr('content')?.trim() ||
      $('article img').first().attr('src')?.trim() ||
      undefined;

    const summary =
      $('meta[property="og:description"]').attr('content')?.trim() ||
      $('meta[name="description"]').attr('content')?.trim() ||
      undefined;

    const author =
      $('meta[name="author"]').attr('content')?.trim() ||
      $('[rel="author"]').first().text().trim() ||
      undefined;

    const publishedRaw =
      $('meta[property="article:published_time"]').attr('content')?.trim() ||
      $('time[datetime]').first().attr('datetime')?.trim() ||
      undefined;

    const publishedAt = publishedRaw ? new Date(publishedRaw) : undefined;
    const validPublishedAt =
      publishedAt && !Number.isNaN(publishedAt.getTime()) ? publishedAt : undefined;

    const fullContent = this.extractMainContent(html, url);
    const cleanContent = this.cleanHtml(fullContent);

    return {
      title,
      summary,
      extractedImageUrl,
      author,
      publishedAt: validPublishedAt,
      fullContent,
      cleanContent,
    };
  }

  private hasEnoughArticleContent(content?: string): boolean {
    const normalized = this.cleanHtml(content ?? '');
    return normalized.length >= 400;
  }

  cleanHtml(html: string): string {
    const noTags = (html || '')
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<nav[\s\S]*?<\/nav>/gi, ' ')
      .replace(/<footer[\s\S]*?<\/footer>/gi, ' ')
      .replace(/<aside[\s\S]*?<\/aside>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const cleaned = noTags
      .replace(/(Siguenos|S[ií]guenos|Tambi[eé]n te puede interesar|Lee tambi[eé]n)/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    return cleaned.slice(0, 6000);
  }

  extractMainContent(html: string, url: string): string {
    const $ = cheerio.load(html);

    $('script, style, nav, footer, aside').remove();

    const selectors = [
      'article p',
      'main p',
      '.entry-content p',
      '.post-content p',
      '.td-post-content p',
      '.jeg_post_content p',
      '.article-content p',
      '.content p',
    ];

    for (const selector of selectors) {
      const paragraphs = $(selector)
        .toArray()
        .map((element) => $(element).text().trim())
        .filter((text) => text.length > 30);

      if (paragraphs.length > 0) {
        return paragraphs.join('\n\n');
      }
    }

    const bodyText = $('body').text().trim();
    if (bodyText.length > 0) {
      return bodyText;
    }

    return '';
  }

  private extractFromKnownParams(url: string): string | undefined {
    try {
      const parsed = new URL(url);
      const candidates = ['url', 'u', 'q', 'continue', 'redirect', 'dest'];

      for (const key of candidates) {
        const value = parsed.searchParams.get(key)?.trim();
        if (!value) {
          continue;
        }

        try {
          const normalized = new URL(decodeURIComponent(value)).toString();
          return normalized;
        } catch {
          // ignore invalid candidate
        }
      }
    } catch {
      return undefined;
    }

    return undefined;
  }

  private tryDecodeGoogleArticleToken(url: string): string | undefined {
    try {
      const parsed = new URL(url);
      const match = parsed.pathname.match(/\/articles\/([^/?]+)/i);
      const token = match?.[1];
      if (!token) {
        return undefined;
      }

      const normalizedToken = token.replace(/-/g, '+').replace(/_/g, '/');
      const paddedToken = normalizedToken.padEnd(
        normalizedToken.length + ((4 - (normalizedToken.length % 4)) % 4),
        '=',
      );
      const decoded = Buffer.from(paddedToken, 'base64').toString('utf-8');
      const urlMatch = decoded.match(/https?:\/\/[^\s"'<>]+/i);
      return urlMatch?.[0];
    } catch {
      return undefined;
    }
  }

  private async resolveViaGoogleBatchExecute(url: string): Promise<string | undefined> {
    try {
      const parsed = new URL(url);
      // Strip query params from the token
      const token = parsed.pathname.split('/').pop()?.split('?')[0]?.trim();
      if (!token) {
        return undefined;
      }

      // Build the correct batchexecute request format
      const innerPayload = JSON.stringify([
        'garturlreq',
        [
          [
            'en-US',
            'US',
            ['FINANCE_TOP_INDICES', 'WEB_TEST_1_0_0'],
            null,
            null,
            1,
            1,
            'US:en-US',
            null,
            480,
            null,
            null,
            null,
            null,
            null,
            0,
            null,
            null,
            [1608992183, 723341000],
          ],
          token,
        ],
      ]);

      const fReq = JSON.stringify([[['Fbv4je', innerPayload, null, 'generic']]]);
      const formBody = `f.req=${encodeURIComponent(fReq)}&`;

      const response = await axios.post<string>(
        'https://news.google.com/_/DotsSplashUi/data/batchexecute?rpcids=Fbv4je&source-path=%2F&f.sid=-1&bl=boq_dotssplashui&hl=en-US&gl=US&authuser=0&soc-app=1&soc-platform=1&soc-device=1&rt=c',
        formBody,
        {
          timeout: 15000,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
            Referer: 'https://news.google.com/',
            Origin: 'https://news.google.com',
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            'X-Same-Domain': '1',
          },
        },
      );

      const text = String(response.data ?? '');
      this.logger.debug(`batchexecute raw response (first 500 chars): ${text.slice(0, 500)}`);

      return this.parseBatchExecuteResponse(text);
    } catch (err) {
      this.logger.debug(`batchexecute error: ${String(err)}`);
      return undefined;
    }
  }

  private parseBatchExecuteResponse(text: string): string | undefined {
    // Google batchexecute response format:
    // )]}'\n[[["wrb.fr","Fbv4je","[\"garturlres\",[\"https://...\",\"US:en-US\",...]]",null,"generic",...]]]
    // The URL is nested as JSON-within-JSON in the third element of the Fbv4je array

    try {
      // Remove the leading )]}' security prefix
      const jsonStart = text.indexOf('[');
      if (jsonStart === -1) return undefined;
      const outerJson = text.slice(jsonStart);

      // Try to find the Fbv4je section and extract URL from it
      const fbv4jeIdx = outerJson.indexOf('"Fbv4je"');
      if (fbv4jeIdx !== -1) {
        // Find the JSON string after "Fbv4je", which contains the inner response
        const afterKey = outerJson.slice(fbv4jeIdx + 8);
        // The next quoted string is the inner JSON payload
        const innerMatch = afterKey.match(/,"((?:[^"\\]|\\.)*)"/);
        if (innerMatch?.[1]) {
          const innerJson = innerMatch[1]
            .replace(/\\"/g, '"')
            .replace(/\\\\/g, '\\')
            .replace(/\\n/g, '\n');
          try {
            const innerParsed = JSON.parse(innerJson) as unknown;
            // garturlres format: ["garturlres", ["https://...", "US:en-US", ...]]
            if (Array.isArray(innerParsed) && innerParsed[0] === 'garturlres') {
              const urls = innerParsed[1];
              if (Array.isArray(urls) && typeof urls[0] === 'string' && urls[0].startsWith('http')) {
                return urls[0];
              }
            }
          } catch {
            // inner parse failed, try regex fallback
          }
        }
      }
    } catch {
      // outer parse failed
    }

    // Fallback regex: find any http URL not from Google in the response
    const urlMatches = [...text.matchAll(/"(https?:\/\/(?![^"]*google\.com)[^"\\]{10,})"/g)];
    for (const m of urlMatches) {
      const candidate = m[1]
        .replace(/\\u003d/g, '=')
        .replace(/\\u0026/g, '&')
        .replace(/\\\//g, '/');
      try {
        new URL(candidate); // validate
        return candidate;
      } catch {
        // invalid URL, continue
      }
    }

    return undefined;
  }

  private isGoogleNewsIntermediateUrl(url: string): boolean {
    return (
      url.includes('news.google.com/rss/articles') ||
      url.includes('news.google.com/articles') ||
      url.includes('google.com/rss/articles')
    );
  }

  private isLikelyArticleUrl(url?: string | null): url is string {
    const normalized = (url ?? '').trim();
    if (!normalized) {
      return false;
    }

    let parsed: URL;
    try {
      parsed = new URL(normalized);
    } catch {
      return false;
    }

    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return false;
    }

    if (this.isGoogleNewsIntermediateUrl(normalized)) {
      return false;
    }

    const hostname = parsed.hostname.toLowerCase();
    if (
      hostname === 'www.w3.org' ||
      hostname === 'w3.org' ||
      hostname === 'schema.org' ||
      hostname.endsWith('.w3.org') ||
      hostname.endsWith('.schema.org')
    ) {
      return false;
    }

    const pathname = parsed.pathname.toLowerCase();
    if (
      pathname === '/' ||
      pathname.startsWith('/xml/') ||
      pathname.endsWith('.js') ||
      pathname.endsWith('.css') ||
      pathname.endsWith('.png') ||
      pathname.endsWith('.jpg') ||
      pathname.endsWith('.jpeg') ||
      pathname.endsWith('.gif') ||
      pathname.endsWith('.svg') ||
      pathname.endsWith('.woff') ||
      pathname.endsWith('.woff2')
    ) {
      return false;
    }

    if (
      normalized.includes('google-analytics') ||
      normalized.includes('googletagmanager') ||
      normalized.includes('doubleclick') ||
      normalized.includes('googlesyndication') ||
      normalized.includes('/amphtml')
    ) {
      return false;
    }

    return parsed.pathname.length > 3;
  }
}
