import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NewsService } from '../news/news.service';

@Injectable()
export class SchedulerService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SchedulerService.name);
  private readonly scrapeIntervalMinutes = this.getScrapeIntervalMinutes();

  constructor(private readonly newsService: NewsService) {}

  onApplicationBootstrap(): void {
    const startupDelayMs = Number(process.env.STARTUP_SCRAPE_DELAY_MS ?? 15000);
    const runStartupScrape = process.env.STARTUP_SCRAPE_ENABLED !== 'false';

    this.logger.log(
      `Scheduled scraping interval configured for every ${this.scrapeIntervalMinutes} minute(s)`,
    );

    if (!runStartupScrape) {
      this.logger.log('Startup scraping disabled');
      return;
    }

    setTimeout(() => {
      void this.runNewsScraping('startup');
    }, startupDelayMs);
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async handleScheduledScraping(): Promise<void> {
    if (!this.shouldRunCurrentMinute()) {
      return;
    }

    await this.runNewsScraping('cron');
  }

  private getScrapeIntervalMinutes(): 1 | 2 {
    const rawValue = (process.env.SCRAPE_INTERVAL_MINUTES ?? '1').trim();

    if (rawValue === '1' || rawValue === '2') {
      return Number(rawValue) as 1 | 2;
    }

    this.logger.warn(
      `Invalid SCRAPE_INTERVAL_MINUTES value "${rawValue}". Falling back to 1 minute`,
    );
    return 1;
  }

  private shouldRunCurrentMinute(): boolean {
    if (this.scrapeIntervalMinutes === 1) {
      return true;
    }

    return new Date().getMinutes() % this.scrapeIntervalMinutes === 0;
  }

  private async runNewsScraping(trigger: 'startup' | 'cron'): Promise<void> {
    try {
      this.logger.log(`Running ${trigger} scraping job`);
      const result = await this.newsService.scrapeActiveSources();
      if (result.skipped) {
        this.logger.warn(
          `Skipping ${trigger} scraping job because another run is still in progress`,
        );
        return;
      }
      this.logger.log(`Scraping completed: ${JSON.stringify(result)}`);
    } catch (error) {
      this.logger.error(
        `Scheduled scraping failed during ${trigger}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }
}
