import { Injectable } from '@nestjs/common';
import { NewsSource } from '../entities/news-source.entity';
import { ScrapedNewsInput } from './scraper.interface';
import { HtmlScraper } from './html.scraper';

@Injectable()
export class FotechScraper {
  constructor(private readonly htmlScraper: HtmlScraper) {}

  supports(source: NewsSource): boolean {
    const isHtmlType = source.type === 'html';
    const matchesDomain = /fotech\.cl/i.test(source.url) || /fotech/i.test(source.name);
    return isHtmlType && matchesDomain;
  }

  async scrape(source: NewsSource): Promise<ScrapedNewsInput[]> {
    const fallbackSelectors = {
      article: 'article, .jeg_post',
      title: 'h3 a, h2 a, .jeg_post_title a',
      summary: 'p, .jeg_post_excerpt p',
      link: 'a',
      image: 'img',
      date: 'time',
    };

    const sourceWithDefaults: NewsSource = {
      ...source,
      selectors: {
        ...fallbackSelectors,
        ...(source.selectors ?? {}),
      },
    };

    return this.htmlScraper.scrape(sourceWithDefaults);
  }
}
