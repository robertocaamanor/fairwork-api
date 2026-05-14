import { NewsSource } from '../entities/news-source.entity';
import { buildNewsSourceSeeds } from '../news-sources.seed';
import { BiobioScraper } from './biobio.scraper';
import { FotechScraper } from './fotech.scraper';
import { GenericWordpressScraper } from './generic-wordpress.scraper';
import { HtmlScraper } from './html.scraper';
import { RssScraper } from './rss.scraper';
import {
  NON_GOOGLE_SEED_SOURCE_NAMES,
  isGoogleNewsSourceName,
} from './seed-source-coverage';

describe('Scraper coverage', () => {
  it('mantiene inventariadas todas las fuentes seed que no son Google News', () => {
    const expectedNames = buildNewsSourceSeeds()
      .filter((source) => !isGoogleNewsSourceName(source.name ?? ''))
      .map((source) => source.name)
      .sort();

    expect([...NON_GOOGLE_SEED_SOURCE_NAMES].sort()).toEqual(expectedNames);
  });

  it('tiene al menos un scraper para cada fuente seed que no es Google News', () => {
    const htmlScraper = new HtmlScraper();
    const rssScraper = new RssScraper();
    const wordpressScraper = new GenericWordpressScraper();
    const biobioScraper = new BiobioScraper();
    const fotechScraper = new FotechScraper(htmlScraper);
    const scrapers = [
      fotechScraper,
      rssScraper,
      wordpressScraper,
      biobioScraper,
      htmlScraper,
    ];

    const unsupportedSources = buildNewsSourceSeeds()
      .filter((source) => !isGoogleNewsSourceName(source.name ?? ''))
      .map((source) => source as NewsSource)
      .filter(
        (source) => !scrapers.some((scraper) => scraper.supports(source)),
      )
      .map((source) => source.name);

    expect(unsupportedSources).toEqual([]);
  });
});