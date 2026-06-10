import 'reflect-metadata';
import 'dotenv/config';
import { DataSource } from 'typeorm';
import { NewsItem } from '../src/news/entities/news-item.entity';
import { NewsSource } from '../src/news/entities/news-source.entity';
import { NewsService } from '../src/news/news.service';
import { BiobioScraper } from '../src/news/scrapers/biobio.scraper';
import { FotechScraper } from '../src/news/scrapers/fotech.scraper';
import { GenericWordpressScraper } from '../src/news/scrapers/generic-wordpress.scraper';
import { HtmlScraper } from '../src/news/scrapers/html.scraper';
import { RssScraper } from '../src/news/scrapers/rss.scraper';
import { ArticleResolverService } from '../src/news/services/article-resolver.service';
import { NewsSourceSeederService } from '../src/news/services/news-source-seeder.service';
import { PuppeteerResolverService } from '../src/news/services/puppeteer-resolver.service';

function isSslEnabled(): boolean {
  return process.env.DATABASE_SSL === 'true';
}

function getSslOptions() {
  if (!isSslEnabled()) {
    return undefined;
  }

  return {
    rejectUnauthorized: false,
  };
}

function buildDataSource(): DataSource {
  const databaseUrl = process.env.DATABASE_URL;
  const ssl = getSslOptions();
  const commonOptions = {
    entities: [NewsItem, NewsSource],
    synchronize: false,
    ssl,
    extra: ssl ? { ssl } : undefined,
  };

  if (databaseUrl) {
    return new DataSource({
      type: 'postgres',
      url: databaseUrl,
      ...commonOptions,
    });
  }

  return new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST ?? 'localhost',
    port: Number(process.env.DATABASE_PORT ?? 5432),
    username: process.env.DATABASE_USER ?? 'postgres',
    password: process.env.DATABASE_PASSWORD ?? 'postgres',
    database: process.env.DATABASE_NAME ?? 'news_monitor',
    ...commonOptions,
  });
}

async function run() {
  const dataSource = buildDataSource();
  await dataSource.initialize();

  const puppeteerResolver = new PuppeteerResolverService();

  try {
    const newsItemRepository = dataSource.getRepository(NewsItem);
    const newsSourceRepository = dataSource.getRepository(NewsSource);
    const htmlScraper = new HtmlScraper();
    const seeder = new NewsSourceSeederService(newsSourceRepository);
    const newsService = new NewsService(
      newsItemRepository,
      newsSourceRepository,
      new RssScraper(),
      htmlScraper,
      new GenericWordpressScraper(),
      new FotechScraper(htmlScraper),
      new BiobioScraper(),
      new ArticleResolverService(puppeteerResolver),
      seeder,
    );

    await seeder.seedSources();

    const googleSourceCount = await newsSourceRepository
      .createQueryBuilder('source')
      .where('source.url ILIKE :googleUrl', {
        googleUrl: '%news.google.com%',
      })
      .andWhere('source.enabled = true')
      .getCount();

    const deleteResult = await newsItemRepository
      .createQueryBuilder()
      .delete()
      .from(NewsItem)
      .where('"sourceName" ILIKE :googleSourceName', {
        googleSourceName: 'Google News%',
      })
      .orWhere('"sourceUrl" ILIKE :googleUrl', {
        googleUrl: '%news.google.com%',
      })
      .orWhere('"originalUrl" ILIKE :googleUrl', {
        googleUrl: '%news.google.com%',
      })
      .orWhere('"resolvedUrl" ILIKE :googleUrl', {
        googleUrl: '%news.google.com%',
      })
      .execute();

    const shouldScrape = process.env.SKIP_GOOGLE_NEWS_RESEED_SCRAPE !== 'true';
    const scrapeResult = shouldScrape
      ? await newsService.scrapeActiveSources()
      : {
          sourcesProcessed: 0,
          inserted: 0,
          deduplicated: 0,
          skipped: true,
          message: 'Scraping omitido por SKIP_GOOGLE_NEWS_RESEED_SCRAPE=true',
        };

    console.log(
      JSON.stringify(
        {
          googleSourcesEnabled: googleSourceCount,
          googleNewsItemsDeleted: deleteResult.affected ?? 0,
          scrape: scrapeResult,
        },
        null,
        2,
      ),
    );
  } finally {
    await puppeteerResolver.onModuleDestroy();
    await dataSource.destroy();
  }
}

run().catch((error) => {
  console.error('Google News timeline reset failed:', error);
  process.exitCode = 1;
});
