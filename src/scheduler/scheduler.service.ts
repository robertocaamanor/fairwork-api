import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NewsService } from '../news/news.service';

@Injectable()
export class SchedulerService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(private readonly newsService: NewsService) {}

  onApplicationBootstrap(): void {
    const startupDelayMs = Number(process.env.STARTUP_SCRAPE_DELAY_MS ?? 15000);
    const runStartupScrape = process.env.STARTUP_SCRAPE_ENABLED !== 'false';

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
    await this.runNewsScraping('cron');
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
